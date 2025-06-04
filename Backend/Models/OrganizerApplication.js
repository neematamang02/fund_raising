import mongoose from "mongoose";

const OrganizerApplicationSchema = new mongoose.Schema(
  {
    // Reference to the User who submitted the application
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The name of the organization or group
    organizationName: {
      type: String,
      required: true,
      trim: true,
    },

    // A description of why this user wants to be an organizer
    description: {
      type: String,
      required: true,
      trim: true,
    },

    // Current status of the application: "pending", "approved", or "rejected"
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "revoked"],
      default: "pending",
      required: true,
    },

    // Reference to the admin (User) who reviewed this application (set when approved/rejected)
    reviewedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Timestamp when the application was reviewed (set when approved/rejected)
    reviewedAt: {
      type: Date,
    },

    // If the application was rejected, an (optional) reason for rejection
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

const OrganizerApplication = mongoose.model(
  "OrganizerApplication",
  OrganizerApplicationSchema
);

export default OrganizerApplication;
