import express from "express";
import WithdrawalRequest from "../Models/WithdrawalRequest.js";
import Campaign from "../Models/Campaign.js";
import Donation from "../Models/Donation.js";
import ActivityLog from "../Models/ActivityLog.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import { sendWithdrawalStatusEmail, sendWithdrawalRequestEmail } from "../services/emailService.js";
import { upload } from "../config/s3.js";

const router = express.Router();

// Upload document for withdrawal request (S3)
router.post("/withdrawal-requests/upload-document", authenticateToken, requireRole(["organizer"]), upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.json({
      message: "Document uploaded successfully",
      url: req.file.location,
      key: req.file.key,
      documentType: req.body.documentType,
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create withdrawal request (Organizer only)
router.post("/withdrawal-requests", authenticateToken, requireRole(["organizer"]), async (req, res) => {
  try {
    const {
      campaignId,
      amount,
      bankDetails,
      documents,
      kycInfo,
    } = req.body;

    // Validate campaign ownership
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (campaign.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You don't own this campaign" });
    }

    // Calculate total donations for this campaign
    const donations = await Donation.aggregate([
      {
        $match: {
          campaign: campaign._id,
          status: "COMPLETED",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const totalRaised = donations[0]?.total || 0;

    // Check if requested amount is available
    const previousWithdrawals = await WithdrawalRequest.aggregate([
      {
        $match: {
          campaign: campaign._id,
          status: { $in: ["approved", "completed"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const totalWithdrawn = previousWithdrawals[0]?.total || 0;
    const availableAmount = totalRaised - totalWithdrawn;

    if (amount > availableAmount) {
      return res.status(400).json({
        message: "Insufficient funds",
        available: availableAmount,
        requested: amount,
      });
    }

    // Validate required documents
    if (!documents.governmentId?.url || !documents.bankProof?.url || !documents.addressProof?.url) {
      return res.status(400).json({
        message: "All required documents must be uploaded (Government ID, Bank Proof, Address Proof)",
      });
    }

    // Create withdrawal request
    const withdrawalRequest = new WithdrawalRequest({
      organizer: req.user.userId,
      campaign: campaignId,
      amount,
      bankDetails,
      documents,
      kycInfo,
      status: "pending",
    });

    await withdrawalRequest.save();

    // Log activity
    await ActivityLog.create({
      user: req.user.userId,
      activityType: "withdrawal_requested",
      description: `Withdrawal request of $${amount} for campaign "${campaign.title}"`,
      metadata: { campaignId, amount, withdrawalRequestId: withdrawalRequest._id },
      relatedEntity: {
        entityType: "WithdrawalRequest",
        entityId: withdrawalRequest._id,
      },
    });

    // Send email notification to organizer
    try {
      const User = (await import("../Models/User.js")).default;
      const organizer = await User.findById(req.user.userId);
      if (organizer) {
        await sendWithdrawalRequestEmail(organizer, campaign, withdrawalRequest);
      }
    } catch (emailError) {
      console.error("Error sending withdrawal request email:", emailError);
    }

    res.status(201).json({
      message: "Withdrawal request submitted successfully",
      withdrawalRequest,
    });
  } catch (error) {
    console.error("Error creating withdrawal request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get organizer's withdrawal requests
router.get("/withdrawal-requests/my-requests", authenticateToken, requireRole(["organizer"]), async (req, res) => {
  try {
    const withdrawalRequests = await WithdrawalRequest.find({
      organizer: req.user.userId,
    })
      .populate("campaign", "title imageURL target raised")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(withdrawalRequests);
  } catch (error) {
    console.error("Error fetching withdrawal requests:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get available balance for a campaign
router.get("/withdrawal-requests/available-balance/:campaignId", authenticateToken, requireRole(["organizer"]), async (req, res) => {
  try {
    const { campaignId } = req.params;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (campaign.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You don't own this campaign" });
    }

    // Calculate total raised
    const donations = await Donation.aggregate([
      {
        $match: {
          campaign: campaign._id,
          status: "COMPLETED",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const totalRaised = donations[0]?.total || 0;

    // Calculate total withdrawn/pending
    const withdrawals = await WithdrawalRequest.aggregate([
      {
        $match: {
          campaign: campaign._id,
          status: { $in: ["pending", "under_review", "approved", "completed"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const totalWithdrawn = withdrawals[0]?.total || 0;
    const availableBalance = totalRaised - totalWithdrawn;

    res.json({
      campaignId,
      totalRaised,
      totalWithdrawn,
      availableBalance,
    });
  } catch (error) {
    console.error("Error fetching available balance:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Admin: Get all withdrawal requests
router.get("/withdrawal-requests", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};

    const withdrawalRequests = await WithdrawalRequest.find(query)
      .populate("organizer", "name email")
      .populate("campaign", "title imageURL target raised")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await WithdrawalRequest.countDocuments(query);

    res.json({
      withdrawalRequests,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error("Error fetching withdrawal requests:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Admin: Get single withdrawal request details
router.get("/withdrawal-requests/:id", authenticateToken, requireRole(["admin", "organizer"]), async (req, res) => {
  try {
    const withdrawalRequest = await WithdrawalRequest.findById(req.params.id)
      .populate("organizer", "name email")
      .populate("campaign", "title imageURL target raised")
      .populate("reviewedBy", "name email");

    if (!withdrawalRequest) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    // Organizers can only view their own requests
    if (req.user.role === "organizer" && withdrawalRequest.organizer._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(withdrawalRequest);
  } catch (error) {
    console.error("Error fetching withdrawal request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Admin: Update withdrawal request status
router.patch("/withdrawal-requests/:id/status", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const { status, reviewNotes, rejectionReason, transactionReference } = req.body;

    const withdrawalRequest = await WithdrawalRequest.findById(req.params.id)
      .populate("organizer", "name email")
      .populate("campaign", "title");

    if (!withdrawalRequest) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    // Update status
    withdrawalRequest.status = status;
    withdrawalRequest.reviewedBy = req.user.userId;
    withdrawalRequest.reviewedAt = new Date();
    withdrawalRequest.reviewNotes = reviewNotes;

    if (status === "rejected" && rejectionReason) {
      withdrawalRequest.rejectionReason = rejectionReason;
    }

    if (status === "completed") {
      withdrawalRequest.completedAt = new Date();
      withdrawalRequest.transactionReference = transactionReference;
    }

    await withdrawalRequest.save();

    // Log activity
    await ActivityLog.create({
      user: req.user.userId,
      activityType: `withdrawal_${status}`,
      description: `Withdrawal request ${status} for campaign "${withdrawalRequest.campaign.title}"`,
      metadata: {
        withdrawalRequestId: withdrawalRequest._id,
        amount: withdrawalRequest.amount,
        organizerId: withdrawalRequest.organizer._id,
      },
      relatedEntity: {
        entityType: "WithdrawalRequest",
        entityId: withdrawalRequest._id,
      },
    });

    // Send email notification to organizer
    try {
      await sendWithdrawalStatusEmail(
        withdrawalRequest.organizer.email,
        withdrawalRequest.organizer.name,
        {
          status,
          amount: withdrawalRequest.amount,
          campaignTitle: withdrawalRequest.campaign.title,
          reviewNotes,
          rejectionReason,
          transactionReference,
        }
      );
    } catch (emailError) {
      console.error("Error sending withdrawal status email:", emailError);
    }

    res.json({
      message: `Withdrawal request ${status} successfully`,
      withdrawalRequest,
    });
  } catch (error) {
    console.error("Error updating withdrawal request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Admin: Verify document
router.patch("/withdrawal-requests/:id/verify-document", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const { documentType, verified } = req.body;

    const withdrawalRequest = await WithdrawalRequest.findById(req.params.id);
    if (!withdrawalRequest) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    if (!withdrawalRequest.documents[documentType]) {
      return res.status(400).json({ message: "Invalid document type" });
    }

    withdrawalRequest.documents[documentType].verified = verified;
    await withdrawalRequest.save();

    res.json({
      message: `Document ${verified ? "verified" : "unverified"} successfully`,
      withdrawalRequest,
    });
  } catch (error) {
    console.error("Error verifying document:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
