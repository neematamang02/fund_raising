import mongoose from "mongoose";

const DonationSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    donor: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    donorEmail: { type: String, required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["paypal"], default: "paypal" },
    // PayPal‐specific details:
    transactionId: { type: String, required: true },
    payerEmail: String,
    payerName: String,
    payerCountry: String,
    status: {
      type: String,
      enum: ["COMPLETED", "PENDING", "FAILED"],
      default: "PENDING",
    },
    // Full PayPal capture response JSON (optional, for your records):
    captureDetails: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

const Donation = mongoose.model("Donation", DonationSchema);
export default Donation;
