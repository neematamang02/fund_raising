import { sendWithdrawalStatusEmail } from "../services/emailService.js";
import {
  getWithdrawalRequestDetails,
  listWithdrawalRequests,
  updateWithdrawalStatus,
  verifyWithdrawalDocument,
} from "../services/adminWithdrawalsService.js";
import { createInAppNotification } from "../services/notificationService.js";

export async function listAdminWithdrawalRequests(req, res) {
  try {
    const result = await listWithdrawalRequests({
      status: req.query.status,
      page: req.query.page,
      limit: req.query.limit,
    });

    if (result.status) {
      return res.status(result.status).json({ message: result.message });
    }

    return res.json({
      withdrawalRequests: result.withdrawalRequests,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      total: result.total,
    });
  } catch (error) {
    console.error("Error fetching withdrawal requests:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}

export async function getAdminWithdrawalRequestDetails(req, res) {
  try {
    const result = await getWithdrawalRequestDetails({
      withdrawalRequestId: req.params.id,
      requesterRole: req.user.role,
      requesterUserId: req.user.userId,
    });

    if (result.status) {
      return res.status(result.status).json({ message: result.message });
    }

    return res.json(result.withdrawalRequest);
  } catch (error) {
    console.error("Error fetching withdrawal request:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}

export async function updateAdminWithdrawalRequestStatus(req, res) {
  try {
    const { status, reviewNotes, rejectionReason, transactionReference } =
      req.body;

    const result = await updateWithdrawalStatus({
      withdrawalRequestId: req.params.id,
      adminUserId: req.user.userId,
      status,
      reviewNotes,
      rejectionReason,
      transactionReference,
    });

    if (result.status) {
      return res.status(result.status).json({ message: result.message });
    }

    try {
      await sendWithdrawalStatusEmail(
        result.withdrawalRequest.organizer.email,
        result.withdrawalRequest.organizer.name,
        {
          status,
          amount: result.withdrawalRequest.amount,
          campaignTitle: result.withdrawalRequest.campaign.title,
          reviewNotes,
          rejectionReason,
          transactionReference,
        },
      );

      await createInAppNotification({
        recipient: result.withdrawalRequest.organizer._id,
        eventType: `withdrawal_${status}`,
        title: "Withdrawal Request Updated",
        message: `Your withdrawal request for ${result.withdrawalRequest.campaign.title} is now ${status}.`,
        payload: {
          withdrawalRequestId: result.withdrawalRequest._id,
          campaignId: result.withdrawalRequest.campaign._id,
          status,
          reviewNotes,
          rejectionReason,
          transactionReference,
        },
      });
    } catch (emailError) {
      console.error("Error sending withdrawal status email:", emailError);
    }

    return res.json({
      message: `Withdrawal request ${status} successfully`,
      withdrawalRequest: result.withdrawalRequest,
    });
  } catch (error) {
    console.error("Error updating withdrawal request:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}

export async function verifyAdminWithdrawalDocument(req, res) {
  try {
    const result = await verifyWithdrawalDocument({
      withdrawalRequestId: req.params.id,
      documentType: req.body.documentType,
      verified: req.body.verified,
    });

    if (result.status) {
      return res.status(result.status).json({ message: result.message });
    }

    return res.json({
      message: `Document ${req.body.verified ? "verified" : "unverified"} successfully`,
      withdrawalRequest: result.withdrawalRequest,
    });
  } catch (error) {
    console.error("Error verifying document:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}
