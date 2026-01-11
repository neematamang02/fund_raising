// import { Router } from "express";
// import Campaign from "../Models/Campaign.js";
// import { requireAuth, requireRole } from "../middleware/auth.js";

// const router = Router();

// /**
//  * GET /api/campaigns?owner=<userId>
//  * Public (but now optionally filters by owner)
//  */
// router.get("/", async (req, res) => {
//   try {
//     const filter = {};
//     // If the client provided ?owner=<userId>, only return that user’s campaigns
//     if (req.query.owner) {
//       filter.owner = req.query.owner;
//     }
//     const campaigns = await Campaign.find(filter).populate(
//       "owner",
//       "name email"
//     );
//     return res.json(campaigns);
//   } catch (err) {
//     return res.status(500).json({ message: "Could not fetch campaigns." });
//   }
// });

// router.get(
//   "/:campaignId/donors",
//   requireAuth,
//   requireRole("organizer"),
//   async (req, res) => {
//     try {
//       const { campaignId } = req.params;

//       // 1) Verify that campaign exists
//       const campaign = await Campaign.findById(campaignId).select("owner");
//       if (!campaign) {
//         return res.status(404).json({ message: "Campaign not found." });
//       }

//       // 2) Only the organizer who owns it can view donors
//       if (campaign.owner.toString() !== req.user.userId) {
//         return res
//           .status(403)
//           .json({ message: "Not authorized to view this campaign’s donors." });
//       }

//       // 3) Fetch all donations for that campaign.
//       //    - Populate `donor` to get name & email if it’s a registered user.
//       //    - Also include donorEmail for PayPal or unregistered donors.
//       //    - Sort by most recent first.
//       const donations = await Donation.find({ campaign: campaignId })
//         .populate("donor", "name email") // bring in donor.name and donor.email if available
//         .sort({ createdAt: -1 });

//       // 4) Return the array of donations
//       return res.json(donations);
//     } catch (err) {
//       console.error("Fetch Donors Error:", err);
//       return res
//         .status(500)
//         .json({ message: "Server error fetching donor list." });
//     }
//   }
// );

// /**
//  * GET /api/campaigns/:campaignId
//  * Public
//  */
// router.get("/:campaignId", async (req, res) => {
//   try {
//     const campaign = await Campaign.findById(req.params.campaignId).populate(
//       "owner",
//       "name email"
//     );
//     if (!campaign)
//       return res.status(404).json({ message: "Campaign not found." });
//     return res.json(campaign);
//   } catch (err) {
//     return res.status(500).json({ message: "Could not fetch campaign." });
//   }
// });

// /**
//  * POST /api/campaigns
//  * Organizer only
//  */
// router.post("/", requireAuth, requireRole("organizer"), async (req, res) => {
//   try {
//     const { title, description, imageURL, target } = req.body;
//     if (!title || !description || !imageURL || !target) {
//       return res.status(400).json({ message: "All fields are required." });
//     }
//     const campaign = await Campaign.create({
//       title,
//       description,
//       imageURL,
//       target,
//       owner: req.user.userId,
//     });
//     return res.status(201).json(campaign);
//   } catch (err) {
//     return res.status(500).json({ message: "Could not create campaign." });
//   }
// });

// /**
//  * PATCH /api/campaigns/:campaignId
//  * Organizer only (must own). Uses findOneAndUpdate filter by owner.
//  */
// router.patch(
//   "/:campaignId",
//   requireAuth,
//   requireRole("organizer"),
//   async (req, res) => {
//     try {
//       // Atomically find + update only if owner matches
//       const updated = await Campaign.findOneAndUpdate(
//         { _id: req.params.campaignId, owner: req.user.userId },
//         { $set: req.body },
//         { new: true, runValidators: true }
//       );

//       if (!updated) {
//         // Either it didn’t exist or owner didn’t match
//         return res
//           .status(403)
//           .json({ message: "Not authorized or campaign not found." });
//       }
//       return res.json(updated);
//     } catch (err) {
//       return res.status(500).json({ message: "Could not update campaign." });
//     }
//   }
// );

// /**
//  * DELETE /api/campaigns/:campaignId
//  * Organizer only (must own). Uses findOneAndDelete filter by owner.
//  */
// router.delete(
//   "/:campaignId",
//   requireAuth,
//   requireRole("organizer"),
//   async (req, res) => {
//     try {
//       const deleted = await Campaign.findOneAndDelete({
//         _id: req.params.campaignId,
//         owner: req.user.userId,
//       });
//       if (!deleted) {
//         return res
//           .status(403)
//           .json({ message: "Not authorized or campaign not found." });
//       }
//       return res.json({ message: "Campaign deleted." });
//     } catch (err) {
//       return res.status(500).json({ message: "Could not delete campaign." });
//     }
//   }
// );

// export default router;

// routes/campaigns.js

// routes/campaigns.js

import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth, requireRole } from "../middleware/auth.js";
import Donation from "../Models/Donation.js";
import Campaign from "../Models/Campaign.js";

const router = Router();

/**
 * GET /api/campaigns?owner=<userId>&page=1&limit=10
 */
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.owner) {
      if (!mongoose.isValidObjectId(req.query.owner)) {
        return res.status(400).json({ message: "Invalid owner ID." });
      }
      filter.owner = req.query.owner;
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Max 100 per page
    const skip = (page - 1) * limit;
    
    const [campaigns, total] = await Promise.all([
      Campaign.find(filter)
        .populate("owner", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Campaign.countDocuments(filter),
    ]);
    
    return res.json({
      campaigns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Fetch Campaigns Error:", err);
    return res.status(500).json({ message: "Could not fetch campaigns." });
  }
});

/**
 * GET /api/campaigns/:campaignId/donors
 *
 * MUST be defined *before* GET /:campaignId, so Express matches “/123/donors”
 * correctly instead of interpreting “123/donors” as a campaignId.
 */
router.get(
  "/:campaignId/donors",
  requireAuth,
  requireRole("organizer"),
  async (req, res) => {
    try {
      const { campaignId } = req.params;

      // 1) Validate that campaignId is a valid ObjectId string
      if (!mongoose.isValidObjectId(campaignId)) {
        return res.status(400).json({ message: "Invalid campaign ID." });
      }

      // 2) Verify campaign exists
      const campaign = await Campaign.findById(campaignId).select("owner");
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found." });
      }

      // 3) Ensure the authenticated organizer actually owns this campaign
      if (campaign.owner.toString() !== req.user.userId) {
        return res
          .status(403)
          .json({ message: "Not authorized to view this campaign’s donors." });
      }

      // 4) Fetch all Donation docs for that campaign, populate donor info
      const donations = await Donation.find({ campaign: campaignId })
        .populate("donor", "name email")
        .sort({ createdAt: -1 }); // newest first

      return res.json(donations);
    } catch (err) {
      console.error("Fetch Donors Error:", err);
      return res
        .status(500)
        .json({ message: "Server error fetching donor list." });
    }
  }
);

/**
 * GET /api/campaigns/:campaignId
 */
router.get("/:campaignId", async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!mongoose.isValidObjectId(campaignId)) {
      return res.status(400).json({ message: "Invalid campaign ID." });
    }

    const campaign = await Campaign.findById(campaignId).populate(
      "owner",
      "name email"
    );
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found." });
    }
    return res.json(campaign);
  } catch (err) {
    console.error("Fetch Campaign Error:", err);
    return res.status(500).json({ message: "Could not fetch campaign." });
  }
});

/**
 * POST /api/campaigns
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
    console.error("Create Campaign Error:", err);
    return res.status(500).json({ message: "Could not create campaign." });
  }
});

/**
 * PATCH /api/campaigns/:campaignId
 */
router.patch(
  "/:campaignId",
  requireAuth,
  requireRole("organizer"),
  async (req, res) => {
    try {
      const { campaignId } = req.params;
      if (!mongoose.isValidObjectId(campaignId)) {
        return res.status(400).json({ message: "Invalid campaign ID." });
      }

      const updated = await Campaign.findOneAndUpdate(
        { _id: campaignId, owner: req.user.userId },
        { $set: req.body },
        { new: true, runValidators: true }
      );
      if (!updated) {
        return res
          .status(403)
          .json({ message: "Not authorized or campaign not found." });
      }
      return res.json(updated);
    } catch (err) {
      console.error("Update Campaign Error:", err);
      return res.status(500).json({ message: "Could not update campaign." });
    }
  }
);

/**
 * DELETE /api/campaigns/:campaignId
 */
router.delete(
  "/:campaignId",
  requireAuth,
  requireRole("organizer"),
  async (req, res) => {
    try {
      const { campaignId } = req.params;
      if (!mongoose.isValidObjectId(campaignId)) {
        return res.status(400).json({ message: "Invalid campaign ID." });
      }

      const deleted = await Campaign.findOneAndDelete({
        _id: campaignId,
        owner: req.user.userId,
      });
      if (!deleted) {
        return res
          .status(403)
          .json({ message: "Not authorized or campaign not found." });
      }
      return res.json({ message: "Campaign deleted." });
    } catch (err) {
      console.error("Delete Campaign Error:", err);
      return res.status(500).json({ message: "Could not delete campaign." });
    }
  }
);

export default router;
