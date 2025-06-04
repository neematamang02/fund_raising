import { Router } from "express";
import Campaign from "../Models/Campaign.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

/**
 * GET /api/campaigns?owner=<userId>
 * Public (but now optionally filters by owner)
 */
router.get("/", async (req, res) => {
  try {
    const filter = {};
    // If the client provided ?owner=<userId>, only return that user’s campaigns
    if (req.query.owner) {
      filter.owner = req.query.owner;
    }
    const campaigns = await Campaign.find(filter).populate(
      "owner",
      "name email"
    );
    return res.json(campaigns);
  } catch (err) {
    return res.status(500).json({ message: "Could not fetch campaigns." });
  }
});

/**
 * GET /api/campaigns/:campaignId
 * Public
 */
router.get("/:campaignId", async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId).populate(
      "owner",
      "name email"
    );
    if (!campaign)
      return res.status(404).json({ message: "Campaign not found." });
    return res.json(campaign);
  } catch (err) {
    return res.status(500).json({ message: "Could not fetch campaign." });
  }
});

/**
 * POST /api/campaigns
 * Organizer only
 */
router.post("/", requireAuth, requireRole("organizer"), async (req, res) => {
  try {
    const { title, description, imageURL, target } = req.body;
    if (!title || !description || !imageURL || !target) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const campaign = await Campaign.create({
      title,
      description,
      imageURL,
      target,
      owner: req.user.userId,
    });
    return res.status(201).json(campaign);
  } catch (err) {
    return res.status(500).json({ message: "Could not create campaign." });
  }
});

/**
 * PATCH /api/campaigns/:campaignId
 * Organizer only (must own). Uses findOneAndUpdate filter by owner.
 */
router.patch(
  "/:campaignId",
  requireAuth,
  requireRole("organizer"),
  async (req, res) => {
    try {
      // Atomically find + update only if owner matches
      const updated = await Campaign.findOneAndUpdate(
        { _id: req.params.campaignId, owner: req.user.userId },
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!updated) {
        // Either it didn’t exist or owner didn’t match
        return res
          .status(403)
          .json({ message: "Not authorized or campaign not found." });
      }
      return res.json(updated);
    } catch (err) {
      return res.status(500).json({ message: "Could not update campaign." });
    }
  }
);

/**
 * DELETE /api/campaigns/:campaignId
 * Organizer only (must own). Uses findOneAndDelete filter by owner.
 */
router.delete(
  "/:campaignId",
  requireAuth,
  requireRole("organizer"),
  async (req, res) => {
    try {
      const deleted = await Campaign.findOneAndDelete({
        _id: req.params.campaignId,
        owner: req.user.userId,
      });
      if (!deleted) {
        return res
          .status(403)
          .json({ message: "Not authorized or campaign not found." });
      }
      return res.json({ message: "Campaign deleted." });
    } catch (err) {
      return res.status(500).json({ message: "Could not delete campaign." });
    }
  }
);

export default router;
