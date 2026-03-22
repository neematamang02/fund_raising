import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { uploadRateLimiter } from "../middleware/rateLimiter.js";
import { validateDocumentUpload } from "../middleware/fileValidation.js";
import OrganizerApplication from "../Models/OrganizerApplication.js";
import { upload } from "../config/s3.js";
import { logError, logInfo, logSecurityEvent } from "../utils/logger.js";
import { sanitizeString } from "../utils/validation.js";
import { sendApplicationSubmittedEmail } from "../services/emailService.js";
import {
  approveAdminApplication,
  listAdminApplications,
  rejectAdminApplication,
  revokeAdminApplication,
} from "../controllers/adminApplicationsController.js";

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
      organizationType,
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
          message:
            "You have an incomplete application. Redirecting to document upload.",
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
      app,
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
        return res.status(403).json({
          message: "You can only upload documents for your own application.",
        });
      }

      // 3) Verify application is in draft status (awaiting documents)
      if (application.status !== "draft" && application.status !== "pending") {
        return res.status(400).json({
          message:
            "Can only upload documents for draft or pending applications.",
        });
      }

      // 4) Process uploaded files
      const documents = {};

      if (req.files.governmentId) {
        documents["documents.governmentId"] = {
          url: req.files.governmentId[0].location,
          key: req.files.governmentId[0].key,
          uploadedAt: new Date(),
        };
      }

      if (req.files.selfieWithId) {
        documents["documents.selfieWithId"] = {
          url: req.files.selfieWithId[0].location,
          key: req.files.selfieWithId[0].key,
          uploadedAt: new Date(),
        };
      }

      if (req.files.registrationCertificate) {
        documents["documents.registrationCertificate"] = {
          url: req.files.registrationCertificate[0].location,
          key: req.files.registrationCertificate[0].key,
          uploadedAt: new Date(),
        };
      }

      if (req.files.taxId) {
        documents["documents.taxId"] = {
          url: req.files.taxId[0].location,
          key: req.files.taxId[0].key,
          uploadedAt: new Date(),
        };
      }

      if (req.files.addressProof) {
        documents["documents.addressProof"] = {
          url: req.files.addressProof[0].location,
          key: req.files.addressProof[0].key,
          uploadedAt: new Date(),
        };
      }

      // Handle additional documents
      if (req.files.additionalDocuments) {
        const additionalDocs = req.files.additionalDocuments.map((file) => ({
          name: file.originalname,
          url: file.location,
          key: file.key,
          uploadedAt: new Date(),
        }));
        documents["documents.additionalDocuments"] = additionalDocs;
      }

      // 5) Update application with documents AND change status to "pending"
      // This makes it visible to admin for review
      documents["status"] = "pending"; // ← NOW the application is sent to admin!

      const updatedApplication = await OrganizerApplication.findByIdAndUpdate(
        applicationId,
        { $set: documents },
        { new: true },
      ).populate("user", "name email");

      // 6) Send email notification to user
      try {
        await sendApplicationSubmittedEmail(
          updatedApplication.user,
          updatedApplication,
        );
      } catch (emailError) {
        console.error(
          "Failed to send application submitted email:",
          emailError,
        );
        // Don't fail the request if email fails
      }

      return res.json({
        message:
          "Documents uploaded successfully! Your application is now pending admin review.",
        uploadedFiles: Object.keys(documents).length - 1, // -1 to exclude status field
      });
    } catch (err) {
      console.error("Upload Documents Error:", err);
      return res.status(500).json({
        message: "Failed to upload documents.",
        error: err.message,
      });
    }
  },
);

/**
 * GET /api/admin/applications
 *   • Admin‐only: list all applications (sorted by createdAt descending).
 *   • Only shows completed applications (pending, approved, rejected, revoked)
 *   • Excludes "draft" applications (incomplete - no documents uploaded yet)
 */
router.get(
  "/admin/applications",
  requireAuth,
  requireRole(["admin"]),
  listAdminApplications,
);

/**
 * PATCH /api/admin/applications/:id/approve
 *   • Admin approves a pending application:
 *     – set status="approved", reviewedBy, reviewedAt
 *     – update the user: role="organizer", isOrganizerApproved=true
 */
router.patch(
  "/admin/applications/:id/approve",
  requireAuth,
  requireRole(["admin"]),
  approveAdminApplication,
);

/**
 * PATCH /api/admin/applications/:id/reject
 *   • Admin rejects a pending application:
 *     – set status="rejected", reviewedBy, reviewedAt, rejectionReason
 */
router.patch(
  "/admin/applications/:id/reject",
  requireAuth,
  requireRole(["admin"]),
  rejectAdminApplication,
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
  requireRole(["admin"]),
  revokeAdminApplication,
);

export default router;
