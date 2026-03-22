import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import Campaign from "../Models/Campaign.js";
import Donation from "../Models/Donation.js";
import ActivityLog from "../Models/ActivityLog.js";
import paypal from "@paypal/checkout-server-sdk";
import { paypalClient } from "../services/paypalClient.js";
import {
  buildRequestHash,
  getStoredIdempotentResponse,
  storeIdempotentResponse,
} from "../utils/idempotency.js";

const router = express.Router();

async function getCampaignWithLifecycleChecks(campaignId) {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) {
    return { error: { status: 404, message: "Campaign not found" } };
  }

  const now = new Date();
  const isDeadlinePassed =
    campaign.deadlineAt instanceof Date && campaign.deadlineAt <= now;

  if (campaign.status === "active" && isDeadlinePassed) {
    campaign.status = "expired";
    campaign.isDonationEnabled = false;
    campaign.endedAt = campaign.endedAt || now;
    campaign.expiresProcessedAt = now;
    await campaign.save();
  }

  if (campaign.status !== "active" || campaign.isDonationEnabled === false) {
    return {
      error: {
        status: 400,
        message: "This campaign is no longer accepting donations.",
      },
    };
  }

  return { campaign };
}

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

      const { campaign, error } =
        await getCampaignWithLifecycleChecks(campaignId);
      if (error) {
        return res.status(error.status).json({ error: error.message });
      }

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
      const { orderID, campaignId, isAnonymous } = req.body;
      const idempotencyKey = req.get("Idempotency-Key") || "";

      console.log("🔍 Capturing PayPal Order:");
      console.log("  Order ID:", orderID);
      console.log("  Campaign ID:", campaignId);
      console.log("  User:", req.user.email);

      if (!orderID || !campaignId) {
        return res.status(400).json({ error: "Invalid input" });
      }

      const requestHash = buildRequestHash({ orderID, campaignId });
      const idempotencyState = await getStoredIdempotentResponse({
        idempotencyKey,
        userId: req.user.userId,
        endpoint: "paypal_capture_order",
        requestHash,
      });

      if (idempotencyState.conflict) {
        return res
          .status(idempotencyState.statusCode)
          .json(idempotencyState.responseBody);
      }

      if (idempotencyState.replay) {
        return res
          .status(idempotencyState.statusCode)
          .json(idempotencyState.responseBody);
      }

      const existingDonation = await Donation.findOne({
        paypalOrderId: orderID,
        donor: req.user.userId,
      }).populate("campaign", "title");
      if (existingDonation) {
        const replayBody = {
          donation: existingDonation,
          billReceipt: {
            donationId: existingDonation._id,
            campaignTitle:
              existingDonation.campaign?.title || "Campaign Donation",
            amount: existingDonation.amount,
            currency: "USD",
            transactionId: existingDonation.transactionId,
            payerName: existingDonation.payerName,
            payerEmail: existingDonation.payerEmail,
            timestamp: existingDonation.createdAt,
          },
          replayed: true,
        };

        await storeIdempotentResponse({
          idempotencyKey,
          userId: req.user.userId,
          endpoint: "paypal_capture_order",
          requestHash,
          statusCode: 200,
          responseBody: replayBody,
        });

        return res.json(replayBody);
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

      const { campaign, error } =
        await getCampaignWithLifecycleChecks(campaignId);
      if (error) {
        return res.status(error.status).json({ error: error.message });
      }

      const parsedAmount = parseFloat(amountValue);
      if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
        return res
          .status(400)
          .json({ error: "Invalid capture amount from PayPal" });
      }

      // Use atomic increment to avoid full-document validation on legacy records.
      let raisedIncremented = false;
      await Campaign.updateOne(
        { _id: campaignId },
        { $inc: { raised: parsedAmount } },
      );
      raisedIncremented = true;

      // Create a Donation record
      const donation = new Donation({
        campaign: campaignId,
        donor: req.user.userId,
        donorEmail: req.user.email,
        isAnonymous: Boolean(isAnonymous),
        amount: parsedAmount,
        method: "paypal",
        paypalOrderId: orderID,
        transactionId: captureId,
        payerEmail: payer.email_address,
        payerName: `${payer.name.given_name} ${payer.name.surname}`,
        payerCountry: payer.address?.country_code,
        status: captureStatus,
        captureDetails: result,
      });
      try {
        await donation.save();
      } catch (saveError) {
        if (raisedIncremented) {
          try {
            await Campaign.updateOne(
              { _id: campaignId },
              { $inc: { raised: -parsedAmount } },
            );
          } catch (rollbackError) {
            console.error(
              "❌ Failed to rollback campaign raised amount after donation persistence failure:",
              rollbackError,
            );
          }
        }

        throw new Error(
          `Donation persistence failed after PayPal capture. Transaction ID: ${captureId}`,
        );
      }

      try {
        await ActivityLog.create({
          user: req.user.userId,
          activityType: "donation_made",
          description: `Donation of $${parsedAmount.toFixed(2)} made to campaign "${campaign.title}"`,
          metadata: {
            campaignId: campaign._id,
            campaignTitle: campaign.title,
            donationId: donation._id,
            transactionId: donation.transactionId,
            amount: parsedAmount,
            currency: purchaseUnit.payments.captures[0].amount.currency_code,
            method: "paypal",
          },
          relatedEntity: {
            entityType: "Donation",
            entityId: donation._id,
          },
        });
      } catch (activityError) {
        console.error("Donation activity log write failed:", activityError);
      }

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
      const responseBody = { donation, billReceipt };

      await storeIdempotentResponse({
        idempotencyKey,
        userId: req.user.userId,
        endpoint: "paypal_capture_order",
        requestHash,
        statusCode: 200,
        responseBody,
      });

      return res.json(responseBody);
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
