import mongoose from "mongoose";
const DonationSchema = new mongoose.Schema(
  {
    campaign: { type: mongoose.Types.ObjectId, ref: "Campaign" },
    donorEmail: String,
    amount: Number,
    method: String,
  },
  { timestamps: true }
);
const Donation = mongoose.model("Donation", DonationSchema);
export default Donation;
