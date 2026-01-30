import express from "express";
import User from "../Models/User.js";
import Campaign from "../Models/Campaign.js";
import Donation from "../Models/Donation.js";
import WithdrawalRequest from "../Models/WithdrawalRequest.js";
import OrganizerApplication from "../Models/OrganizerApplication.js";
import ActivityLog from "../Models/ActivityLog.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Dashboard statistics
router.get("/admin/dashboard/stats", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const [
      totalUsers,
      totalDonors,
      totalOrganizers,
      totalCampaigns,
      activeCampaigns,
      totalDonations,
      pendingWithdrawals,
      pendingApplications,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "donor" }),
      User.countDocuments({ role: "organizer", isOrganizerApproved: true }),
      Campaign.countDocuments(),
      Campaign.countDocuments({ raised: { $lt: "$target" } }),
      Donation.countDocuments({ status: "COMPLETED" }),
      WithdrawalRequest.countDocuments({ status: "pending" }),
      OrganizerApplication.countDocuments({ status: "pending" }),
    ]);

    // Calculate total donation amount
    const donationStats = await Donation.aggregate([
      { $match: { status: "COMPLETED" } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);

    // Calculate total withdrawn amount
    const withdrawalStats = await WithdrawalRequest.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);

    res.json({
      users: {
        total: totalUsers,
        donors: totalDonors,
        organizers: totalOrganizers,
      },
      campaigns: {
        total: totalCampaigns,
        active: activeCampaigns,
      },
      donations: {
        count: totalDonations,
        totalAmount: donationStats[0]?.totalAmount || 0,
      },
      withdrawals: {
        pending: pendingWithdrawals,
        totalWithdrawn: withdrawalStats[0]?.totalAmount || 0,
      },
      applications: {
        pending: pendingApplications,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// User Management - Get all users
router.get("/admin/users", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-passwordHash -resetToken -resetTokenExpiry")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get user details with activity
router.get("/admin/users/:userId", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-passwordHash -resetToken -resetTokenExpiry");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's campaigns if organizer
    let campaigns = [];
    if (user.role === "organizer") {
      campaigns = await Campaign.find({ owner: user._id }).sort({ createdAt: -1 });
    }

    // Get user's donations
    const donations = await Donation.find({ donor: user._id })
      .populate("campaign", "title imageURL")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's activity logs
    const activities = await ActivityLog.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    // Get withdrawal requests if organizer
    let withdrawalRequests = [];
    if (user.role === "organizer") {
      withdrawalRequests = await WithdrawalRequest.find({ organizer: user._id })
        .populate("campaign", "title")
        .sort({ createdAt: -1 });
    }

    res.json({
      user,
      campaigns,
      donations,
      activities,
      withdrawalRequests,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update user status
router.patch("/admin/users/:userId/status", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const { isOrganizerApproved, role } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (isOrganizerApproved !== undefined) {
      user.isOrganizerApproved = isOrganizerApproved;
    }

    if (role && ["donor", "organizer", "admin"].includes(role)) {
      user.role = role;
    }

    await user.save();

    await ActivityLog.create({
      user: req.user.userId,
      activityType: "profile_updated",
      description: `Admin updated user ${user.email} status`,
      metadata: { targetUserId: user._id, isOrganizerApproved, role },
    });

    res.json({ message: "User status updated successfully", user });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Campaign Management - Get all campaigns
router.get("/admin/campaigns", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const campaigns = await Campaign.find(query)
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Campaign.countDocuments(query);

    res.json({
      campaigns,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get campaign details with donations
router.get("/admin/campaigns/:campaignId", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId).populate("owner", "name email");

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    const donations = await Donation.find({ campaign: campaign._id })
      .populate("donor", "name email")
      .sort({ createdAt: -1 });

    const withdrawalRequests = await WithdrawalRequest.find({ campaign: campaign._id })
      .populate("organizer", "name email")
      .sort({ createdAt: -1 });

    res.json({
      campaign,
      donations,
      withdrawalRequests,
    });
  } catch (error) {
    console.error("Error fetching campaign details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete campaign (admin only)
router.delete("/admin/campaigns/:campaignId", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Check if there are completed donations
    const donationCount = await Donation.countDocuments({
      campaign: campaign._id,
      status: "COMPLETED",
    });

    if (donationCount > 0) {
      return res.status(400).json({
        message: "Cannot delete campaign with completed donations",
      });
    }

    await Campaign.findByIdAndDelete(req.params.campaignId);

    await ActivityLog.create({
      user: req.user.userId,
      activityType: "campaign_deleted",
      description: `Admin deleted campaign "${campaign.title}"`,
      metadata: { campaignId: campaign._id, campaignTitle: campaign.title },
    });

    res.json({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all donations
router.get("/admin/donations", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};

    const donations = await Donation.find(query)
      .populate("donor", "name email")
      .populate("campaign", "title owner")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Donation.countDocuments(query);

    res.json({
      donations,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error("Error fetching donations:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all activity logs
router.get("/admin/activities", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const { activityType, userId, page = 1, limit = 50 } = req.query;
    const query = {};

    if (activityType) query.activityType = activityType;
    if (userId) query.user = userId;

    const activities = await ActivityLog.find(query)
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await ActivityLog.countDocuments(query);

    res.json({
      activities,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
