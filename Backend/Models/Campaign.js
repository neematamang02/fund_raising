import mongoose from "mongoose";

const CampaignSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    imageURL: String,
    target: Number,
    raised: { type: Number, default: 0 },
    owner: { type: mongoose.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Campaign = mongoose.model("Campaign", CampaignSchema);
export default Campaign;
