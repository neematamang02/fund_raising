import axios from "axios";
import ActivityLog from "../Models/ActivityLog.js";
import Campaign from "../Models/Campaign.js";
import Donation from "../Models/Donation.js";
import { recordDonationBlock } from "../services/blockchainService.js";
import {
  getCampaignRemainingAmount,
  tryIncrementCampaignRaisedWithinTarget,
} from "../services/donationCapacityService.js";
import {
  buildRequestHash,
  getStoredIdempotentResponse,
  storeIdempotentResponse,
} from "../utils/idempotency.js";
import { generateHmacSha256Hash, generateUniqueId } from "../utils/helper.js";

function parsePositiveAmount(value) {
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return NaN;
  }

  return parsed;
}

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

function normalizeGateway(value) {
  const gateway = String(value || "")
    .trim()
    .toLowerCase();
  if (gateway === "esewa" || gateway === "khalti") {
    return gateway;
  }

  return null;
}

async function createEsewaPaymentUrl({
  amount,
  productId,
  productName,
  customerName,
}) {
  const productCode = process.env.ESEWA_MERCHANT_ID;
  const totalAmount = Number.parseFloat(amount).toFixed(2);
  const signedFieldNames = "total_amount,transaction_uuid,product_code";

  const signaturePayload = `total_amount=${totalAmount},transaction_uuid=${productId},product_code=${productCode}`;
  const signature = generateHmacSha256Hash(
    signaturePayload,
    process.env.ESEWA_SECRET,
  );

  const paymentData = {
    amount: totalAmount,
    failure_url: process.env.ESEWA_CANCEL_URL,
    product_delivery_charge: "0",
    product_service_charge: "0",
    product_code: productCode,
    signed_field_names: signedFieldNames,
    success_url: process.env.ESEWA_RETURN_URL,
    tax_amount: "0",
    total_amount: totalAmount,
    transaction_uuid: productId,
    signature,
    customer_name: customerName,
    product_name: productName,
  };

  const formData = new URLSearchParams(paymentData).toString();

  const response = await axios.post(process.env.ESEWA_PAYMENT_URL, formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    maxRedirects: 5,
    validateStatus: () => true,
  });

  const paymentUrl = response?.request?.res?.responseUrl;
  if (!paymentUrl) {
    throw new Error("Could not create eSewa payment URL");
  }

  return paymentUrl;
}

async function createKhaltiPaymentUrl({
  amount,
  productId,
  productName,
  customerPhone,
}) {
  const amountInPaisa = Math.round(amount * 100);

  const payload = {
    amount: amountInPaisa,
    mobile: customerPhone,
    product_identity: productId,
    product_name: productName,
    return_url: process.env.KHALTI_RETURN_URL,
    failure_url: process.env.KHALTI_CANCEL_URL,
    public_key: process.env.KHALTI_PUBLIC_KEY,
    website_url: process.env.FRONTEND_URL,
    purchase_order_id: productId,
    purchase_order_name: productName,
  };

  const response = await axios.post(process.env.KHALTI_PAYMENT_URL, payload, {
    headers: {
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response?.data?.payment_url) {
    throw new Error("Could not create Khalti payment URL");
  }

  return {
    paymentUrl: response.data.payment_url,
    pidx: response.data.pidx,
  };
}

export async function initiatePayment(req, res) {
  try {
    const {
      amount,
      productId,
      paymentGateway,
      customerName,
      customerEmail,
      customerPhone,
      productName,
      campaignId,
    } = req.body;

    if (
      !amount ||
      !paymentGateway ||
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !productName ||
      !campaignId
    ) {
      return res
        .status(400)
        .json({ message: "Missing required payment fields" });
    }

    const parsedAmount = parsePositiveAmount(amount);
    if (Number.isNaN(parsedAmount)) {
      return res
        .status(400)
        .json({ message: "Amount must be a positive number" });
    }

    const gateway = normalizeGateway(paymentGateway);
    if (!gateway) {
      return res.status(400).json({ message: "Unsupported payment gateway" });
    }

    const { campaign, error } =
      await getCampaignWithLifecycleChecks(campaignId);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const remainingAmount = getCampaignRemainingAmount(campaign);
    if (remainingAmount <= 0) {
      return res.status(409).json({
        message: "This campaign has already reached its target amount.",
        remainingAmount,
      });
    }

    if (parsedAmount > remainingAmount) {
      return res.status(400).json({
        message: "Donation amount exceeds the remaining campaign target.",
        remainingAmount,
      });
    }

    const normalizedProductId = String(productId || generateUniqueId());
    const existingProductDonation = await Donation.findOne({
      donor: req.user.userId,
      product_id: normalizedProductId,
    }).lean();

    if (existingProductDonation) {
      return res.status(409).json({
        message: "Payment already initiated for this product id",
      });
    }

    let paymentUrl = "";
    let pidx;

    if (gateway === "esewa") {
      paymentUrl = await createEsewaPaymentUrl({
        amount: parsedAmount,
        productId: normalizedProductId,
        productName,
        customerName,
      });
    }

    if (gateway === "khalti") {
      const khaltiResult = await createKhaltiPaymentUrl({
        amount: parsedAmount,
        productId: normalizedProductId,
        productName,
        customerPhone,
      });
      paymentUrl = khaltiResult.paymentUrl;
      pidx = khaltiResult.pidx;
    }

    await Donation.create({
      campaign: campaignId,
      donor: req.user.userId,
      donorEmail: req.user.email,
      customerDetails: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
      product_name: productName,
      product_id: normalizedProductId,
      amount: parsedAmount,
      method: gateway,
      payment_gateway: gateway,
      currency: "NPR",
      khaltiPidx: pidx,
      transactionId: `${gateway}-${normalizedProductId}`,
      payerEmail: customerEmail,
      payerName: customerName,
      status: "PENDING",
      captureDetails: {
        initiatedAt: new Date().toISOString(),
      },
    });

    return res.status(201).json({
      url: paymentUrl,
      product_id: normalizedProductId,
      pidx,
    });
  } catch (error) {
    console.error("Initiate payment error:", error);
    return res.status(500).json({
      message: "Failed to initiate payment",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

async function verifyEsewaPayment(donation) {
  const response = await axios.get(process.env.ESEWA_PAYMENT_STATUS_CHECK_URL, {
    params: {
      product_code: process.env.ESEWA_MERCHANT_ID,
      total_amount: Number.parseFloat(donation.amount).toFixed(2),
      transaction_uuid: donation.product_id,
    },
    validateStatus: () => true,
  });

  return response.data;
}

async function verifyKhaltiPayment({ pidx }) {
  try {
    const response = await axios.post(
      process.env.KHALTI_VERIFICATION_URL,
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data) {
      return error.response.data;
    }

    throw error;
  }
}

async function writeDonationFinalizationArtifacts({ donation, campaign }) {
  try {
    await ActivityLog.create({
      user: donation.donor,
      activityType: "donation_made",
      description: `Donation of NPR ${Number.parseFloat(donation.amount).toFixed(2)} made to campaign \"${campaign.title}\" via ${donation.method}`,
      metadata: {
        campaignId: campaign._id,
        campaignTitle: campaign.title,
        donationId: donation._id,
        transactionId: donation.transactionId,
        amount: donation.amount,
        currency: donation.currency,
        method: donation.method,
        productId: donation.product_id,
      },
      relatedEntity: {
        entityType: "Donation",
        entityId: donation._id,
      },
    });
  } catch (activityError) {
    console.error("Donation activity log write failed:", activityError);
  }

  let transparencyBlock = null;
  try {
    transparencyBlock = await recordDonationBlock({
      donorName: donation.payerName || "Anonymous Donor",
      amount: donation.amount,
      campaignId: donation.campaign,
      donationId: donation._id,
      transactionId: donation.transactionId,
      donatedAt:
        donation.updatedAt?.toISOString?.() || new Date().toISOString(),
    });
  } catch (ledgerError) {
    console.error("Donation block record failed:", ledgerError);
  }

  return transparencyBlock;
}

export async function paymentStatus(req, res) {
  try {
    const { product_id: productId, pidx, status } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "product_id is required" });
    }

    const donation = await Donation.findOne({ product_id: productId }).populate(
      "campaign",
      "title",
    );

    if (!donation) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const campaignId = donation.campaign?._id || donation.campaign;

    if (donation.status === "COMPLETED") {
      return res.json({
        message: "Transaction already completed",
        status: donation.status,
        campaignId,
        billReceipt: {
          donationId: donation._id,
          campaignId,
          campaignTitle: donation.campaign?.title || "Campaign Donation",
          amount: Number.parseFloat(donation.amount).toFixed(2),
          currency: donation.currency || "NPR",
          transactionId: donation.transactionId,
          transactionHash: donation.transactionId,
          payerName: donation.payerName,
          payerEmail: donation.payerEmail,
          timestamp: donation.updatedAt,
        },
      });
    }

    const idempotencyUserId =
      req.user?.userId || donation.donor?.toString() || "callback";

    const requestHash = buildRequestHash({
      productId,
      pidx: pidx || "",
      status: status || "",
    });
    const idempotencyState = await getStoredIdempotentResponse({
      idempotencyKey:
        req.get("Idempotency-Key") ||
        `${donation.method}:${productId}:${pidx || "none"}`,
      userId: idempotencyUserId,
      endpoint: "payment_status",
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

    if (status === "FAILED") {
      await Donation.updateOne(
        { _id: donation._id, status: { $in: ["PENDING", "FAILED"] } },
        {
          $set: {
            status: "FAILED",
            captureDetails: {
              ...(donation.captureDetails || {}),
              failedAt: new Date().toISOString(),
              failureReason: "Marked as failed by callback",
            },
          },
        },
      );

      const responseBody = {
        message: "Transaction marked as failed",
        status: "FAILED",
      };

      await storeIdempotentResponse({
        idempotencyKey:
          req.get("Idempotency-Key") ||
          `${donation.method}:${productId}:failed`,
        userId: idempotencyUserId,
        endpoint: "payment_status",
        requestHash,
        statusCode: 200,
        responseBody,
      });

      return res.json(responseBody);
    }

    let gatewayResponse = null;
    let isCompleted = false;

    if (donation.method === "esewa") {
      gatewayResponse = await verifyEsewaPayment(donation);
      isCompleted = gatewayResponse?.status === "COMPLETE";
    }

    if (donation.method === "khalti") {
      const lookupPidx = pidx || donation.khaltiPidx;
      if (!lookupPidx) {
        return res
          .status(400)
          .json({ message: "pidx is required for Khalti verification" });
      }

      gatewayResponse = await verifyKhaltiPayment({ pidx: lookupPidx });
      isCompleted = gatewayResponse?.status === "Completed";
    }

    if (!isCompleted) {
      await Donation.updateOne(
        { _id: donation._id, status: { $in: ["PENDING", "FAILED"] } },
        {
          $set: {
            status: "FAILED",
            captureDetails: {
              ...(donation.captureDetails || {}),
              gatewayVerification: gatewayResponse,
            },
          },
        },
      );

      const failedResponse = {
        message: "Payment verification failed",
        status: "FAILED",
      };

      await storeIdempotentResponse({
        idempotencyKey:
          req.get("Idempotency-Key") ||
          `${donation.method}:${productId}:verify`,
        userId: idempotencyUserId,
        endpoint: "payment_status",
        requestHash,
        statusCode: 200,
        responseBody: failedResponse,
      });

      return res.json(failedResponse);
    }

    const incrementResult = await tryIncrementCampaignRaisedWithinTarget({
      campaignId: donation.campaign?._id || donation.campaign,
      amount: donation.amount,
    });

    if (!incrementResult.ok) {
      await Donation.updateOne(
        { _id: donation._id },
        {
          $set: {
            status: "REFUNDED",
            captureDetails: {
              ...(donation.captureDetails || {}),
              gatewayVerification: gatewayResponse,
              note: "Payment completed at gateway but campaign capacity update failed",
            },
          },
        },
      );

      return res.status(409).json({
        message:
          "Payment completed but campaign capacity was reached. Please process a refund from gateway dashboard.",
        status: "REFUNDED",
      });
    }

    await Donation.updateOne(
      { _id: donation._id, status: { $in: ["PENDING", "FAILED"] } },
      {
        $set: {
          status: "COMPLETED",
          khaltiPidx: pidx || donation.khaltiPidx,
          captureDetails: {
            ...(donation.captureDetails || {}),
            gatewayVerification: gatewayResponse,
            completedAt: new Date().toISOString(),
          },
        },
      },
    );

    const refreshedDonation = await Donation.findById(donation._id).populate(
      "campaign",
      "title",
    );

    const transparencyBlock = await writeDonationFinalizationArtifacts({
      donation: refreshedDonation,
      campaign: refreshedDonation.campaign,
    });

    const responseBody = {
      message: "Payment verified successfully",
      status: "COMPLETED",
      campaignId,
      billReceipt: {
        donationId: refreshedDonation._id,
        campaignId,
        campaignTitle: refreshedDonation.campaign?.title || "Campaign Donation",
        amount: Number.parseFloat(refreshedDonation.amount).toFixed(2),
        currency: refreshedDonation.currency || "NPR",
        transactionId: refreshedDonation.transactionId,
        transactionHash:
          transparencyBlock?.hash || refreshedDonation.transactionId,
        payerName: refreshedDonation.payerName,
        payerEmail: refreshedDonation.payerEmail,
        timestamp: refreshedDonation.updatedAt,
      },
    };

    await storeIdempotentResponse({
      idempotencyKey:
        req.get("Idempotency-Key") || `${donation.method}:${productId}:verify`,
      userId: idempotencyUserId,
      endpoint: "payment_status",
      requestHash,
      statusCode: 200,
      responseBody,
    });

    return res.json(responseBody);
  } catch (error) {
    console.error("Payment status error:", error);
    return res.status(500).json({
      message: "Failed to verify payment status",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
