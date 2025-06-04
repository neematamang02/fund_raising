import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import OrganizerApplication from "../Models/OrganizerApplication.js";
import User from "../Models/User.js";

const router = Router();

/**
 * POST /api/organizer/apply
 *   • Only a logged‐in donor can create a new application.
 *   • If they already have a pending or approved application, reject.
 */
router.post("/organizer/apply", requireAuth, async (req, res) => {
  try {
    const { organizationName, description } = req.body;
    const userId = req.user.userId;

    // 1) Validate fields
    if (!organizationName || !description) {
      return res
        .status(400)
        .json({ message: "Organization name and description are required." });
    }

    // 2) Check if user already has a pending or approved application
    const existing = await OrganizerApplication.findOne({
      user: userId,
      status: { $in: ["pending", "approved"] },
    });
    if (existing) {
      return res.status(409).json({
        message:
          "You already have a pending or approved application. You cannot apply again.",
      });
    }

    // 3) Create new application
    const app = await OrganizerApplication.create({
      user: userId,
      organizationName: organizationName.trim(),
      description: description.trim(),
      status: "pending",
    });

    return res.status(201).json({ message: "Application submitted.", app });
  } catch (err) {
    console.error("Apply Organizer Error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

/**
 * GET /api/admin/applications
 *   • Admin‐only: list all applications (sorted by createdAt descending).
 */
router.get("/admin/applications", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const apps = await OrganizerApplication.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.json(apps);
  } catch (err) {
    console.error("List Applications Error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

/**
 * PATCH /api/admin/applications/:id/approve
 *   • Admin approves a pending application:
 *     – set status="approved", reviewedBy, reviewedAt
 *     – update the user: role="organizer", isOrganizerApproved=true
 */
router.patch(
  "/admin/applications/:id/approve",
  requireAuth,
  async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { id } = req.params;
      const application = await OrganizerApplication.findById(id);
      if (!application) {
        return res.status(404).json({ message: "Application not found." });
      }
      if (application.status !== "pending") {
        return res
          .status(400)
          .json({ message: "Only pending applications can be approved." });
      }

      // 1) Mark application as approved
      application.status = "approved";
      application.reviewedBy = req.user.userId;
      application.reviewedAt = new Date();
      await application.save();

      // 2) Update the User record:
      const userToApprove = await User.findById(application.user);
      if (userToApprove) {
        userToApprove.role = "organizer";
        userToApprove.isOrganizerApproved = true;
        await userToApprove.save();
      }

      return res.json({ message: "Application approved." });
    } catch (err) {
      console.error("Approve Application Error:", err);
      return res.status(500).json({ message: "Server error." });
    }
  }
);

/**
 * PATCH /api/admin/applications/:id/reject
 *   • Admin rejects a pending application:
 *     – set status="rejected", reviewedBy, reviewedAt, rejectionReason
 */
router.patch(
  "/admin/applications/:id/reject",
  requireAuth,
  async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { id } = req.params;
      const { rejectionReason } = req.body;
      const application = await OrganizerApplication.findById(id);
      if (!application) {
        return res.status(404).json({ message: "Application not found." });
      }
      if (application.status !== "pending") {
        return res
          .status(400)
          .json({ message: "Only pending applications can be rejected." });
      }

      application.status = "rejected";
      application.reviewedBy = req.user.userId;
      application.reviewedAt = new Date();
      application.rejectionReason = rejectionReason?.trim() || null;
      await application.save();

      return res.json({ message: "Application rejected." });
    } catch (err) {
      console.error("Reject Application Error:", err);
      return res.status(500).json({ message: "Server error." });
    }
  }
);

/**
 * PATCH /api/admin/applications/:id/revoke
 *   • Admin revokes an approved organizer:
 *     – set status="revoked", reviewedBy, reviewedAt, optionally rejectionReason
 *     – set User.role="donor", isOrganizerApproved=false
 */
router.patch(
  "/admin/applications/:id/revoke",
  requireAuth,
  async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { id } = req.params;
      const { reason } = req.body;
      const application = await OrganizerApplication.findById(id);
      if (!application) {
        return res.status(404).json({ message: "Application not found." });
      }
      if (application.status !== "approved") {
        return res
          .status(400)
          .json({ message: "Only an approved application can be revoked." });
      }

      application.status = "revoked";
      application.reviewedBy = req.user.userId;
      application.reviewedAt = new Date();
      if (reason) {
        application.rejectionReason = reason.trim();
      }
      await application.save();

      // Also flip the user's role back to "donor"
      const userToRevoke = await User.findById(application.user);
      if (userToRevoke) {
        userToRevoke.role = "donor";
        userToRevoke.isOrganizerApproved = false;
        await userToRevoke.save();
      }

      return res.json({ message: "Organizer role revoked." });
    } catch (err) {
      console.error("Revoke Organizer Error:", err);
      return res.status(500).json({ message: "Server error." });
    }
  }
);

export default router;
