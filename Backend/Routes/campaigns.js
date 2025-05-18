import { Router } from "express";
import Campaign from "../Models/Campaign.js";
import verifyToken from "../middleware/auth.js";

const router = Router();
router.get("/", async (req, res) => {
  try {
    const campaigns = await Campaign.find().populate("owner", "name email");
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching campaigns" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate(
      "owner",
      "name email"
    );
    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching campaign" });
  }
});
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, description, imageURL, target } = req.body;
    const newCampaign = new Campaign({
      title,
      description,
      imageURL,
      target,
      owner: req.user.id,
    });
    const saved = await newCampaign.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: "Error creating campaign" });
  }
});
export default router;
