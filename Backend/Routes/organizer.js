import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import OrganizerApplication from "../Models/OrganizerApplication.js";
import User from "../Models/User.js";
import { upload } from "../config/cloudinary.js";

const router = Router();

/**
 * POST /api/organizer/apply
 *   • Only a logged‐in donor can create a new application.
 *   • If they already have a pending or approved application, reject.
 */
router.post("/organizer/apply", requireAuth, async (req, res) => {
  try {
    const { 
      organizationName, 
      description, 
      contactEmail, 
      phoneNumber, 
      website,
      organizationType 
    } = req.body;
    const userId = req.user.userId;

    // 1) Validate required fields
    if (!organizationName || !description) {
      return res
        .status(400)
        .json({ message: "Organization name and description are required." });
    }

    // 2) Check if user already has a pending, draft, or approved application
    const existing = await OrganizerApplication.findOne({
      user: userId,
      status: { $in: ["draft", "pending", "approved"] },
    });
    if (existing) {
      // If they have a draft, allow them to continue with that one
      if (existing.status === "draft") {
        return res.status(200).json({
          message: "You have an incomplete application. Redirecting to document upload.",
          applicationId: existing._id,
          app: existing,
        });
      }
      // Otherwise, they already have a pending or approved application
      return res.status(409).json({
        message:
          "You already have a pending or approved application. You cannot apply again.",
      });
    }

    // 3) Create new application as DRAFT (not visible to admin yet)
    const app = await OrganizerApplication.create({
      user: userId,
      organizationName: organizationName.trim(),
      description: description.trim(),
      contactEmail: contactEmail?.trim(),
      phoneNumber: phoneNumber?.trim(),
      website: website?.trim(),
      organizationType: organizationType || "other",
      status: "draft", // ← Changed from "pending" to "draft"
    });

    return res.status(201).json({ 
      message: "Application submitted. Please upload verification documents.", 
      applicationId: app._id,
      app 
    });
  } catch (err) {
    console.error("Apply Organizer Error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

/**
 * POST /api/organizer/upload-documents/:applicationId
 *   • Upload verification documents for an application
 *   • Accepts multiple files for different document types
 */
router.post(
  "/organizer/upload-documents/:applicationId",
  requireAuth,
  upload.fields([
    { name: "governmentId", maxCount: 1 },
    { name: "selfieWithId", maxCount: 1 },
    { name: "registrationCertificate", maxCount: 1 },
    { name: "taxId", maxCount: 1 },
    { name: "addressProof", maxCount: 1 },
    { name: "additionalDocuments", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const userId = req.user.userId;

      // 1) Find the application
      const application = await OrganizerApplication.findById(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found." });
      }

      // 2) Verify ownership
      if (application.user.toString() !== userId) {
        return res
          .status(403)
          .json({ message: "You can only upload documents for your own application." });
      }

      // 3) Verify application is in draft status (awaiting documents)
      if (application.status !== "draft" && application.status !== "pending") {
        return res.status(400).json({ 
          message: "Can only upload documents for draft or pending applications." 
        });
      }

      // 4) Process uploaded files
      const documents = {};
      
      if (req.files.governmentId) {
        documents["documents.governmentId"] = {
          url: req.files.governmentId[0].path,
          publicId: req.files.governmentId[0].filename,
          uploadedAt: new Date(),
        };
      }
      
      if (req.files.selfieWithId) {
        documents["documents.selfieWithId"] = {
          url: req.files.selfieWithId[0].path,
          publicId: req.files.selfieWithId[0].filename,
          uploadedAt: new Date(),
        };
      }
      
      if (req.files.registrationCertificate) {
        documents["documents.registrationCertificate"] = {
          url: req.files.registrationCertificate[0].path,
          publicId: req.files.registrationCertificate[0].filename,
          uploadedAt: new Date(),
        };
      }
      
      if (req.files.taxId) {
        documents["documents.taxId"] = {
          url: req.files.taxId[0].path,
          publicId: req.files.taxId[0].filename,
          uploadedAt: new Date(),
        };
      }
      
      if (req.files.addressProof) {
        documents["documents.addressProof"] = {
          url: req.files.addressProof[0].path,
          publicId: req.files.addressProof[0].filename,
          uploadedAt: new Date(),
        };
      }

      // Handle additional documents
      if (req.files.additionalDocuments) {
        const additionalDocs = req.files.additionalDocuments.map((file) => ({
          name: file.originalname,
          url: file.path,
          publicId: file.filename,
          uploadedAt: new Date(),
        }));
        documents["documents.additionalDocuments"] = additionalDocs;
      }

      // 5) Update application with documents AND change status to "pending"
      // This makes it visible to admin for review
      documents["status"] = "pending"; // ← NOW the application is sent to admin!
      
      await OrganizerApplication.findByIdAndUpdate(
        applicationId,
        { $set: documents },
        { new: true }
      );

      return res.json({ 
        message: "Documents uploaded successfully! Your application is now pending admin review.",
        uploadedFiles: Object.keys(documents).length - 1 // -1 to exclude status field
      });
    } catch (err) {
      console.error("Upload Documents Error:", err);
      return res.status(500).json({ 
        message: "Failed to upload documents.",
        error: err.message 
      });
    }
  }
);

/**
 * GET /api/admin/applications
 *   • Admin‐only: list all applications (sorted by createdAt descending).
 *   • Only shows completed applications (pending, approved, rejected, revoked)
 *   • Excludes "draft" applications (incomplete - no documents uploaded yet)
 */
router.get("/admin/applications", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Only fetch applications that have been submitted (not drafts)
    const apps = await OrganizerApplication.find({
      status: { $ne: "draft" } // Exclude draft applications
    })
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
