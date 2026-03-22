import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import Campaign from "../Models/Campaign.js";
import Donation from "../Models/Donation.js";
import paypal from "@paypal/checkout-server-sdk";
import { paypalClient } from "../services/paypalClient.js";

const router = express.Router();

// ───────────────────────────────────────────────────────────────
// 0) Get PayPal Configuration (Client ID)
// ───────────────────────────────────────────────────────────────
// GET /api/paypal/config
// Returns: { clientId }
// Public endpoint - no auth required
router.get("/paypal/config", (req, res) => {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID;

    if (!clientId) {
      return res.status(500).json({
        error: "PayPal configuration not found on server",
      });
    }

    return res.json({ clientId });
  } catch (err) {
    console.error("PayPal Config Error:", err);
    return res.status(500).json({
      error: "Could not fetch PayPal configuration",
    });
  }
});

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

      console.log("🔍 Creating PayPal Order:");
      console.log("  Campaign ID:", campaignId);
      console.log("  Amount:", amount);
      console.log("  User:", req.user.email);

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

      const orderPayload = {
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: campaignId,
            description: `Donation to ${campaign.title}`,
            amount: {
              currency_code: "USD",
              value: parseFloat(amount).toFixed(2),
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
      };

      console.log("  Order Payload:", JSON.stringify(orderPayload, null, 2));
      request.requestBody(orderPayload);

      const paypalReq = await paypalClient().execute(request);
      const orderID = paypalReq.result.id;

      console.log("✅ PayPal Order Created:", orderID);
      console.log("  Status:", paypalReq.result.status);

      return res.json({ orderID });
    } catch (err) {
      console.error("❌ Create Order Error:");
      console.error("  Message:", err.message);
      console.error("  Status Code:", err.statusCode);
      if (err.headers) {
        console.error("  Headers:", err.headers);
      }
      return res.status(500).json({
        error: "Could not create PayPal order.",
        details:
          process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },
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

      console.log("🔍 Capturing PayPal Order:");
      console.log("  Order ID:", orderID);
      console.log("  Campaign ID:", campaignId);
      console.log("  User:", req.user.email);

      if (!orderID || !campaignId) {
        return res.status(400).json({ error: "Invalid input" });
      }

      // Capture the order
      const request = new paypal.orders.OrdersCaptureRequest(orderID);
      request.requestBody({});

      const captureResponse = await paypalClient().execute(request);
      const result = captureResponse.result; // Full capture result

      console.log("  Capture Status:", result.status);

      // Extract relevant info
      const purchaseUnit = result.purchase_units[0];
      const captureId = purchaseUnit.payments.captures[0].id;
      const captureStatus = purchaseUnit.payments.captures[0].status; // e.g. "COMPLETED"
      const amountValue = purchaseUnit.payments.captures[0].amount.value; // string
      const payer = result.payer; // payer object

      // Find campaign for receipt fields
      const campaign = await Campaign.findById(campaignId);
      if (!campaign)
        return res.status(404).json({ error: "Campaign not found" });

      const parsedAmount = parseFloat(amountValue);
      if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
        return res
          .status(400)
          .json({ error: "Invalid capture amount from PayPal" });
      }

      // Use atomic increment to avoid full-document validation on legacy records.
      await Campaign.updateOne(
        { _id: campaignId },
        { $inc: { raised: parsedAmount } },
      );

      // Create a Donation record
      const donation = new Donation({
        campaign: campaignId,
        donor: req.user.userId,
        donorEmail: req.user.email,
        amount: parsedAmount,
        method: "paypal",
        transactionId: captureId,
        payerEmail: payer.email_address,
        payerName: `${payer.name.given_name} ${payer.name.surname}`,
        payerCountry: payer.address?.country_code,
        status: captureStatus,
        captureDetails: result,
      });
      await donation.save();

      console.log("✅ Donation Recorded:", donation._id);

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
      console.error("❌ Capture Order Error:");
      console.error("  Message:", err.message);
      console.error("  Status Code:", err.statusCode);
      if (err.headers) {
        console.error("  Headers:", err.headers);
      }
      return res.status(500).json({
        error: "Could not capture PayPal order.",
        details:
          process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },
);

export default router;
