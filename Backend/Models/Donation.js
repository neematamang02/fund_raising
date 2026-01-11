import mongoose from "mongoose";

const DonationSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Types.ObjectId,
      ref: "Campaign",
      required: true,
      index: true,
    },
    donor: { type: mongoose.Types.ObjectId, ref: "User", required: true, index: true },
    donorEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ["paypal"], default: "paypal" },
    transactionId: { type: String, required: true, unique: true, index: true },
    payerEmail: { type: String, lowercase: true, trim: true },
    payerName: String,
    payerCountry: String,
    status: {
      type: String,
      enum: ["COMPLETED", "PENDING", "FAILED"],
      default: "PENDING",
      index: true,
    },
    captureDetails: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Indexes for performance
DonationSchema.index({ campaign: 1, createdAt: -1 });
DonationSchema.index({ donor: 1, createdAt: -1 });
DonationSchema.index({ donorEmail: 1 });
DonationSchema.index({ transactionId: 1 }, { unique: true });

const Donation = mongoose.model("Donation", DonationSchema);
export default Donation;
