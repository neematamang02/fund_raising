import { Router } from "express";
import stripe from "stripe";
import Donation from "../Models/Donation.js";
import Campaign from "../Models/Campaign.js";
import verifyToken from "../middleware/auth.js";
const router = Router();
const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY);

router.post("/:campaignId", verifyToken, async (req, res) => {
  try {
    const { amount, paymentMethodId } = req.body;
    // Create a PaymentIntent
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(amount * 100), // in cents
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true,
    });

    // Record donation in DB
    const donation = new Donation({
      campaign: req.params.campaignId,
      donorEmail: req.user.email,
      amount,
      method: "stripe",
    });
    await donation.save();

    // Update campaign raised amount
    await Campaign.findByIdAndUpdate(req.params.campaignId, {
      $inc: { raised: amount },
    });

    res.json({ success: true, paymentIntent });
  } catch (err) {
    res.status(400).json({ message: "Donation failed", error: err.message });
  }
});

export default router;
