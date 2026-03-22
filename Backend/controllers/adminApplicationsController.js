import {
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
  sendOrganizerRevokedEmail,
} from "../services/emailService.js";
import {
  approveApplication,
  listSubmittedApplications,
  rejectApplication,
  revokeApplication,
} from "../services/adminApplicationsService.js";

export async function listAdminApplications(req, res) {
  try {
    const apps = await listSubmittedApplications();
    return res.json(apps);
  } catch (err) {
    console.error("List Applications Error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

export async function approveAdminApplication(req, res) {
  try {
    const result = await approveApplication({
      applicationId: req.params.id,
      adminUserId: req.user.userId,
    });

    if (result.status) {
      return res.status(result.status).json({ message: result.message });
    }

    try {
      if (result.userToApprove) {
        await sendApplicationApprovedEmail(
          result.userToApprove,
          result.application,
        );
      }
    } catch (emailError) {
      console.error("Failed to send approval email:", emailError);
    }

    return res.json({ message: "Application approved." });
  } catch (err) {
    console.error("Approve Application Error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

export async function rejectAdminApplication(req, res) {
  try {
    const result = await rejectApplication({
      applicationId: req.params.id,
      adminUserId: req.user.userId,
      rejectionReason: req.body.rejectionReason,
    });

    if (result.status) {
      return res.status(result.status).json({ message: result.message });
    }

    try {
      if (result.userToNotify) {
        await sendApplicationRejectedEmail(
          result.userToNotify,
          result.application,
          result.application.rejectionReason,
        );
      }
    } catch (emailError) {
      console.error("Failed to send rejection email:", emailError);
    }

    return res.json({ message: "Application rejected." });
  } catch (err) {
    console.error("Reject Application Error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

export async function revokeAdminApplication(req, res) {
  try {
    const result = await revokeApplication({
      applicationId: req.params.id,
      adminUserId: req.user.userId,
      reason: req.body.reason,
    });

    if (result.status) {
      return res.status(result.status).json({ message: result.message });
    }

    try {
      if (result.userToRevoke) {
        await sendOrganizerRevokedEmail(
          result.userToRevoke,
          result.application,
          result.application.rejectionReason,
        );
      }
    } catch (emailError) {
      console.error("Failed to send revocation email:", emailError);
    }

    return res.json({ message: "Organizer role revoked." });
  } catch (err) {
    console.error("Revoke Organizer Error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}
