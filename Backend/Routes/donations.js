import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import Donation from "../Models/Donation.js";
import Campaign from "../Models/Campaign.js";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("📋 Fetching donations for user:");
    console.log("  Email:", req.user.email);
    console.log("  User ID:", req.user.userId);
    console.log("  Role:", req.user.role);
    console.log("=".repeat(60));
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    
    // Debug: Check what's in the database
    const allDonationsForEmail = await Donation.find({ donorEmail: req.user.email }).lean();
    console.log(`  Total donations in DB for ${req.user.email}: ${allDonationsForEmail.length}`);
    
    if (allDonationsForEmail.length > 0) {
      console.log("  Sample donation emails in DB:");
      allDonationsForEmail.slice(0, 3).forEach((d, i) => {
        console.log(`    ${i + 1}. donorEmail: "${d.donorEmail}" (exact match: ${d.donorEmail === req.user.email})`);
      });
    }
    
    const [donations, total] = await Promise.all([
      Donation.find({ donorEmail: req.user.email })
        .populate("campaign", "title imageURL")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Donation.countDocuments({ donorEmail: req.user.email }),
    ]);

    console.log(`✅ Returning ${donations.length} donations (total: ${total})`);
    console.log("=".repeat(60) + "\n");

    return res.json({
      donations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("❌ Get My Donations Error:", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch donation history." });
  }
});
/**
 * POST /api/donations
 * Protected: Only "donor" can call.
 * Body: { campaign: "<campaignId>", amount: Number, method: String }
 * Creates a new Donation and increments the Campaign’s raised amount.
 */
router.post("/", requireAuth, requireRole("donor"), async (req, res) => {
  try {
    const { campaign: campaignId, amount, method } = req.body;

    // Validate input
    if (!campaignId || !amount || !method) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be positive." });
    }

    // 1) Ensure the campaign exists
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found." });
    }

    // 2) Create the Donation
    const donation = await Donation.create({
      campaign: campaignId,
      donorEmail: req.user.email,
      amount,
      method,
    });

    // 3) Increment the campaign's raised amount
    campaign.raised = (campaign.raised || 0) + amount;
    await campaign.save();

    // 4) Return the newly created donation (populated with campaign title)
    await donation.populate("campaign", "title");
    return res.status(201).json(donation);
  } catch (err) {
    console.error("Create Donation Error:", err);
    return res.status(500).json({ message: "Failed to create donation." });
  }
});

export default router;
