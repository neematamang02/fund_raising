import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import Campaign from "../Models/Campaign.js";
import Donation from "../Models/Donation.js";
import paypal from "@paypal/checkout-server-sdk";
import { paypalClient } from "../services/paypalClient.js";

const router = express.Router();

// ───────────────────────────────────────────────────────────────
// 1) Create PayPal Order
// ───────────────────────────────────────────────────────────────
// POST /api/paypal/create-order
// Body: { campaignId, amount }
// Returns: { orderID }
router.post(
  "/paypal/create-order",
  requireAuth,
  requireRole("donor"),
  async (req, res) => {
    try {
      const { campaignId, amount } = req.body;
      // Validate inputs
      if (!campaignId || !amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid input" });
      }
      // Optionally, verify campaign exists
      const campaign = await Campaign.findById(campaignId);
      if (!campaign)
        return res.status(404).json({ error: "Campaign not found" });

      // Build PayPal order request
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: campaignId,
            amount: {
              currency_code: "USD",
              value: amount.toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: "FundApp",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
          return_url: `${process.env.FRONTEND_URL}/donate/success`,
          cancel_url: `${process.env.FRONTEND_URL}/donate/cancel`,
        },
      });

      const paypalReq = await paypalClient().execute(request);
      const orderID = paypalReq.result.id;
      return res.json({ orderID });
    } catch (err) {
      console.error("Create Order Error:", err);
      return res.status(500).json({ error: "Could not create PayPal order." });
    }
  }
);

// ───────────────────────────────────────────────────────────────
// 2) Capture PayPal Order & Record Donation
// ───────────────────────────────────────────────────────────────
// POST /api/paypal/capture-order
// Body: { orderID, campaignId }
// Returns: { donationRecord, billReceipt }
router.post(
  "/paypal/capture-order",
  requireAuth,
  requireRole("donor"),
  async (req, res) => {
    try {
      const { orderID, campaignId } = req.body;
      if (!orderID || !campaignId) {
        return res.status(400).json({ error: "Invalid input" });
      }

      // Capture the order
      const request = new paypal.orders.OrdersCaptureRequest(orderID);
      request.requestBody({});

      const captureResponse = await paypalClient().execute(request);
      const result = captureResponse.result; // Full capture result

      // Extract relevant info
      const purchaseUnit = result.purchase_units[0];
      const captureId = purchaseUnit.payments.captures[0].id;
      const captureStatus = purchaseUnit.payments.captures[0].status; // e.g. "COMPLETED"
      const amountValue = purchaseUnit.payments.captures[0].amount.value; // string
      const payer = result.payer; // payer object

      // Find campaign and update its raised amount
      const campaign = await Campaign.findById(campaignId);
      if (!campaign)
        return res.status(404).json({ error: "Campaign not found" });

      campaign.raised += parseFloat(amountValue);
      await campaign.save();

      // Create a Donation record
      const donation = new Donation({
        campaign: campaignId,
        donor: req.user.userId,
        donorEmail: req.user.email,
        amount: parseFloat(amountValue),
        method: "paypal",
        transactionId: captureId,
        payerEmail: payer.email_address,
        payerName: `${payer.name.given_name} ${payer.name.surname}`,
        payerCountry: payer.address?.country_code,
        status: captureStatus,
        captureDetails: result,
      });
      await donation.save();

      // Build a "bill" or receipt object to return to frontend
      const billReceipt = {
        donationId: donation._id,
        campaignTitle: campaign.title,
        amount: amountValue,
        currency: purchaseUnit.payments.captures[0].amount.currency_code,
        transactionId: captureId,
        payerName: donation.payerName,
        payerEmail: donation.payerEmail,
        timestamp: donation.createdAt,
      };

      return res.json({ donation, billReceipt });
    } catch (err) {
      console.error("Capture Order Error:", err);
      return res.status(500).json({ error: "Could not capture PayPal order." });
    }
  }
);

// ───────────────────────────────────────────────────────────────
// 3) Get Logged‐In User's Donation History
// ───────────────────────────────────────────────────────────────
// GET /api/donations/me
// Requires: donor to be logged in
router.get(
  "/donations/me",
  requireAuth,
  requireRole("donor"),
  async (req, res) => {
    try {
      const donations = await Donation.find({ donor: req.user.userId })
        .populate("campaign", "title")
        .sort({ createdAt: -1 });
      return res.json(donations);
    } catch (err) {
      console.error("Fetch Donations Error:", err);
      return res
        .status(500)
        .json({ error: "Could not fetch donation history." });
    }
  }
);

export default router;
