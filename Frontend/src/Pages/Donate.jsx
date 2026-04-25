import { useContext, useState, useMemo } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { AuthContext } from "@/Context/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import ROUTES from "@/routes/routes";
import {
  ArrowLeft,
  Heart,
  Target,
  Users,
  CheckCircle,
  TrendingUp,
  Shield,
  Clock,
  DollarSign,
  Sparkles,
  Loader2,
} from "lucide-react";
import { generateUniqueId } from "@/utils/helpers";
import { initiatePayment } from "@/services/paymentApi";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : "/api";

export default function Donate() {
  const { campaignId } = useParams();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [amount, setAmount] = useState("");
  const [bill, setBill] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [paypalClientId, setPaypalClientId] = useState(null);
  const [isAnonymousDonation, setIsAnonymousDonation] = useState(false);
  const [paymentGateway, setPaymentGateway] = useState("esewa");
  const activeCurrency = paymentGateway === "paypal" ? "USD" : "NPR";
  const activeCurrencySymbol = paymentGateway === "paypal" ? "$" : "Rs ";
  const paymentSuccessMessage = location.state?.paymentSuccess;

  // Preset donation amounts
  const presetAmounts = [25, 50, 100, 250, 500, 1000];

  // Fetch PayPal Client ID from backend
  const { isLoading: loadingPaypalConfig } = useQuery({
    queryKey: ["paypalConfig"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/paypal/config`);
      if (!res.ok) {
        throw new Error("Could not fetch PayPal configuration");
      }
      const data = await res.json();
      setPaypalClientId(data.clientId);
      return data;
    },
    retry: 2,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const {
    data: campaign,
    isLoading: loadingCampaign,
    error: campaignError,
  } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: async () => {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`, {
        headers,
      });
      if (!res.ok) {
        throw new Error("Could not fetch campaign");
      }
      return res.json();
    },
    enabled: !!campaignId,
    retry: false,
  });

  const { data: campaignPayoutHistory, isLoading: loadingPayoutHistory } =
    useQuery({
      queryKey: ["campaignPayoutHistory", campaignId],
      queryFn: async () => {
        const res = await fetch(
          `${API_BASE_URL}/campaigns/${campaignId}/payout-history`,
        );
        if (!res.ok) {
          throw new Error("Could not fetch campaign payout history");
        }
        return res.json();
      },
      enabled: !!campaignId,
      retry: 1,
      staleTime: 1000 * 60,
    });

  const createOrderMutation = useMutation({
    mutationFn: async (amountValue) => {
      try {
        const res = await fetch(`${API_BASE_URL}/paypal/create-order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            campaignId,
            amount: parseFloat(amountValue),
            currency: "USD",
          }),
        });

        const data = await res.json().catch(() => null);
        if (!res.ok) {
          if (data && data.message) {
            throw new Error(data.message);
          }
          throw new Error(`Failed to create PayPal order: ${res.status}`);
        }

        return data;
      } catch (error) {
        console.error("PayPal order creation error:", error);
        throw error;
      }
    },
  });

  const captureOrderMutation = useMutation({
    mutationFn: async (orderID) => {
      const captureIdempotencyKey = `paypal-capture:${campaignId}:${orderID}`;
      const res = await fetch(`${API_BASE_URL}/paypal/capture-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
          "Idempotency-Key": captureIdempotencyKey,
        },
        body: JSON.stringify({
          orderID,
          campaignId,
          isAnonymous: isAnonymousDonation,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "Failed to capture PayPal order");
      }
      return res.json();
    },
    onSuccess: (data) => setBill(data.billReceipt),
    onError: (err) => setErrorMsg(err.message || "Error capturing payment"),
  });

  const initiateGatewayPaymentMutation = useMutation({
    mutationFn: async ({ productId, parsedAmount }) => {
      return initiatePayment(
        {
          amount: parsedAmount,
          productId,
          paymentGateway,
          customerName: user?.name || "Donor",
          customerEmail: user?.email || "",
          customerPhone: user?.phone || "9800000000",
          productName: campaign.title,
          campaignId,
        },
        token,
      );
    },
  });

  const isGatewayRedirecting = initiateGatewayPaymentMutation.isPending;

  const handleValidateBeforePayPal = () => {
    if (!user) {
      navigate(ROUTES.LOGIN + `?redirect=/donate/${campaignId}`);
      return false;
    }

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg("Please enter a valid donation amount (greater than 0).");
      return false;
    }

    // Example maximum limit
    if (parsedAmount > 10000) {
      setErrorMsg("Donation amount exceeds maximum limit.");
      return false;
    }

    return true;
  };

  const handleValidateBeforeRedirectPayment = () => {
    if (!user) {
      navigate(ROUTES.LOGIN + `?redirect=/donate/${campaignId}`);
      return null;
    }

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg("Please enter a valid donation amount (greater than 0).");
      return null;
    }

    if (parsedAmount > 1000000) {
      setErrorMsg("Donation amount exceeds maximum limit.");
      return null;
    }

    return parsedAmount;
  };

  const handleGatewayRedirectPayment = async () => {
    setErrorMsg("");
    const parsedAmount = handleValidateBeforeRedirectPayment();
    if (!parsedAmount) {
      return;
    }

    const productId = generateUniqueId();

    sessionStorage.setItem("current_transaction_id", productId);
    sessionStorage.setItem("current_payment_gateway", paymentGateway);
    sessionStorage.setItem("current_campaign_id", campaignId || "");

    try {
      const response = await initiateGatewayPaymentMutation.mutateAsync({
        productId,
        parsedAmount,
      });

      if (!response?.url) {
        throw new Error("Gateway did not return a redirect URL");
      }

      window.location.assign(response.url);
    } catch (error) {
      setErrorMsg(error.message || "Failed to initiate payment");
    }
  };

  const handlePresetAmount = (presetAmount) => {
    setAmount(presetAmount.toString());
    setSelectedPreset(presetAmount);
    setErrorMsg("");
  };

  const handleCustomAmount = (value) => {
    setAmount(value);
    setSelectedPreset(null);
    setErrorMsg("");
  };

  // Calculate progress % and remaining amount
  const progressPercentage = useMemo(() => {
    if (!campaign || campaign.target <= 0) return 0;
    return Math.min(100, Math.round((campaign.raised / campaign.target) * 100));
  }, [campaign]);

  const remainingAmount = useMemo(() => {
    if (!campaign) return 0;
    return Math.max(0, campaign.target - campaign.raised);
  }, [campaign]);

  const campaignEnded = useMemo(() => {
    if (!campaign) return false;
    return (
      campaign.status === "expired" ||
      campaign.status === "inactive" ||
      campaign.isDonationEnabled === false
    );
  }, [campaign]);

  const latestPayoutEvent = campaignPayoutHistory?.timeline?.[0] || null;

  const payoutStatusLabel = useMemo(() => {
    switch (latestPayoutEvent?.status) {
      case "paid_out":
        return "Paid Out";
      case "scheduled":
        return "Scheduled";
      case "processing":
        return "Processing";
      default:
        return "No Payout Yet";
    }
  }, [latestPayoutEvent]);

  // If campaignId is missing or loading
  if (!campaignId || loadingCampaign || loadingPaypalConfig) {
    return (
      <div className="surface-page flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-secondary"></div>
          <p className="text-slate-600">
            {loadingPaypalConfig
              ? "Loading payment system..."
              : "Loading campaign..."}
          </p>
        </div>
      </div>
    );
  }

  // If campaign fetch failed
  if (campaignError || !campaign) {
    return (
      <div className="surface-page flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <Heart className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-foreground">
            Campaign Not Found
          </h2>
          <p className="mb-6 text-muted-foreground">
            {campaignError?.message ||
              "The campaign you're looking for doesn't exist."}
          </p>
          <Link to="/donate">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaigns
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // If donation is successful
  if (bill) {
    return (
      <div className="surface-page px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/15">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>
            <h1 className="mb-2 text-4xl font-bold text-foreground">
              Thank You!
            </h1>
            <p className="text-lg text-muted-foreground">
              Your donation has been successfully processed
            </p>
          </div>

          <Card className="surface-card overflow-hidden rounded-xl border shadow-lg">
            <CardHeader className="bg-primary text-primary-foreground">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Sparkles className="h-6 w-6" />
                Donation Receipt
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Campaign
                  </Label>
                  <p className="text-lg font-semibold text-foreground">
                    {bill.campaignTitle}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Amount
                  </Label>
                  <p className="text-2xl font-bold text-primary">
                    ${bill.amount} {bill.currency}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Transaction ID
                  </Label>
                  <p className="rounded bg-muted px-3 py-1 font-mono text-sm text-foreground">
                    {bill.transactionId}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Date & Time
                  </Label>
                  <p className="text-sm text-foreground">
                    {new Date(bill.timestamp).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>

              <div className="border-t pt-6">
                <Label className="text-sm font-medium text-muted-foreground">
                  Donor Information
                </Label>
                <p className="text-lg text-foreground">{bill.payerName}</p>
                <p className="text-sm text-muted-foreground">
                  {bill.payerEmail}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90"
                  size="lg"
                  onClick={() => navigate(ROUTES.MY_DONATIONS)}
                >
                  <TrendingUp className="h-5 w-5 mr-2" />
                  View Donation History
                </Button>
                <Link to="/donate" className="flex-1">
                  <Button variant="outline" size="lg" className="w-full">
                    <Heart className="h-5 w-5 mr-2" />
                    Donate to Another Cause
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // MAIN RENDER: campaign loaded, no bill yet
  return (
    <div className="surface-page min-h-screen">
      <div className="pt-6 pb-4 px-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/donate">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaigns
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4">
        {paymentSuccessMessage && (
          <div className="mb-6 rounded-xl border border-primary/25 bg-primary/10 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold text-foreground">
                  Donation successful
                </p>
                <p className="text-sm text-muted-foreground">
                  Your contribution has been verified for this campaign.
                  {paymentSuccessMessage.amount && (
                    <>
                      {" "}
                      Amount: {paymentSuccessMessage.amount}{" "}
                      {paymentSuccessMessage.currency || "NPR"}.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <Badge
                className={
                  campaignEnded
                    ? "mb-4 bg-muted text-muted-foreground border-border"
                    : "mb-4 bg-chart-2/10 text-chart-2 border-chart-2/20"
                }
              >
                <Heart className="h-4 w-4 mr-2" />
                {campaignEnded ? "Campaign Ended" : "Support This Cause"}
              </Badge>
              <h1 className="mb-4 text-3xl font-bold text-foreground">
                {campaign.title}
              </h1>
            </div>

            <div className="relative group">
              <img
                src={campaign.imageURL || "/placeholder.svg"}
                alt={campaign.title}
                className="h-64 w-full rounded-xl border border-border object-cover transition-transform duration-300 group-hover:scale-[1.01]"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            <Card className="surface-card rounded-xl">
              <CardContent className="p-6">
                <p className="mb-6 leading-relaxed text-muted-foreground">
                  {campaign.description}
                </p>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Progress
                    </span>
                    <span className="text-sm font-bold text-secondary">
                      {progressPercentage}%
                    </span>
                  </div>

                  <div>
                    <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-4 rounded-full bg-primary transition-all duration-1000 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-primary/8 border border-primary/15 p-4 text-center">
                      <div className="text-2xl font-bold text-primary">
                        ${campaign.raised.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Raised
                      </div>
                    </div>
                    <div className="rounded-xl bg-muted/50 border border-border p-4 text-center">
                      <div className="text-2xl font-bold text-foreground">
                        ${campaign.target.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Goal</div>
                    </div>
                  </div>

                  {remainingAmount > 0 ? (
                    <div className="bg-chart-4/8 border border-chart-4/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-chart-4">
                        <Target className="h-5 w-5" />
                        <span className="font-medium text-sm">
                          ${remainingAmount.toLocaleString()} still needed to
                          reach the goal
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-primary/8 border border-primary/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-primary">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium text-sm">
                          Donation Target Completed
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="surface-card rounded-xl border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-foreground">
                    Fund Transparency
                  </h3>
                  <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20">
                    {payoutStatusLabel}
                  </Badge>
                </div>

                {loadingPayoutHistory ? (
                  <p className="text-sm text-muted-foreground">
                    Loading payout timeline...
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <div className="rounded-xl bg-muted/50 border border-border/50 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Raised
                        </p>
                        <p className="text-base font-semibold text-foreground">
                          $
                          {Number(
                            campaignPayoutHistory?.summary?.totalRaised ||
                              campaign?.raised ||
                              0,
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-xl bg-muted/50 border border-border/50 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Paid Out
                        </p>
                        <p className="text-base font-semibold text-foreground">
                          $
                          {Number(
                            campaignPayoutHistory?.summary?.totalPaidOut || 0,
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-xl bg-muted/50 border border-border/50 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Last Transfer
                        </p>
                        <p className="text-base font-semibold text-foreground">
                          {latestPayoutEvent?.eventDate
                            ? new Date(
                                latestPayoutEvent.eventDate,
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "Not yet"}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      We share payout status, date, and amount with donors to
                      improve transparency while keeping sensitive bank details
                      private.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="surface-card overflow-hidden rounded-xl">
              <CardHeader className="bg-secondary text-white">
                <CardTitle className="flex items-center gap-3">
                  <Heart className="h-6 w-6" />
                  Make Your Donation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {errorMsg && (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                    <p className="text-destructive text-sm">{errorMsg}</p>
                  </div>
                )}

                {campaignEnded ? (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      disabled
                    >
                      Donations Disabled (Campaign Ended)
                    </Button>
                  </div>
                ) : remainingAmount <= 0 ? (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      disabled
                    >
                      Donation Target Completed
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label className="mb-3 block text-sm font-medium text-foreground">
                        Choose an amount or enter custom
                      </Label>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {presetAmounts.map((preset) => (
                          <button
                            key={preset}
                            onClick={() => handlePresetAmount(preset)}
                            className={`rounded-lg border px-3 py-3 text-foreground transition-colors duration-200 ${
                              selectedPreset === preset
                                ? "border-primary bg-primary/8 text-primary"
                                : "border-border hover:border-primary/60"
                            }`}
                          >
                            <div className="text-lg font-bold">
                              {activeCurrencySymbol}
                              {preset}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor="donation-amount"
                        className="text-sm font-medium text-foreground"
                      >
                        Custom Amount ({activeCurrency})
                      </Label>
                      <div className="relative mt-2">
                        <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="donation-amount"
                          type="number"
                          step="0.01"
                          placeholder="Enter amount"
                          value={amount}
                          onChange={(e) => handleCustomAmount(e.target.value)}
                          disabled={isGatewayRedirecting}
                          className="h-12 rounded-lg pl-10 text-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="mb-2 block text-sm font-medium text-foreground">
                        Payment Gateway
                      </Label>
                      <select
                        value={paymentGateway}
                        onChange={(event) =>
                          setPaymentGateway(event.target.value)
                        }
                        disabled={isGatewayRedirecting}
                        className="h-12 w-full rounded-lg border border-border bg-background px-3 text-sm"
                      >
                        <option value="esewa">eSewa</option>
                        <option value="khalti">Khalti</option>
                        <option value="paypal">PayPal</option>
                      </select>
                    </div>

                    <div className="rounded-xl border border-chart-2/20 bg-chart-2/8 p-4">
                      <div className="flex items-center gap-2 text-chart-2">
                        <Shield className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          Secure payment powered by{" "}
                          {paymentGateway === "paypal"
                            ? "PayPal"
                            : paymentGateway === "esewa"
                              ? "eSewa"
                              : "Khalti"}
                          .{" "}
                          {paymentGateway === "paypal"
                            ? "PayPal donations are processed in USD."
                            : "eSewa and Khalti donations are processed in NPR."}
                        </span>
                      </div>
                    </div>

                    <label className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={isAnonymousDonation}
                        onChange={(e) =>
                          setIsAnonymousDonation(e.target.checked)
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        Donate anonymously. Your identity will be hidden in
                        donor lists and shown as Anonymous Donor.
                      </span>
                    </label>

                    <div className="space-y-4">
                      {paymentGateway === "paypal" ? (
                        paypalClientId ? (
                          <PayPalScriptProvider
                            options={{
                              "client-id": paypalClientId,
                              currency: "USD",
                              intent: "capture",
                              components: "buttons",
                              "disable-funding": "credit,card",
                              "enable-funding": "venmo",
                            }}
                          >
                            <PayPalButtons
                              style={{
                                layout: "vertical",
                                color: "gold",
                                shape: "rect",
                                height: 50,
                              }}
                              createOrder={async () => {
                                setErrorMsg("");
                                if (!handleValidateBeforePayPal())
                                  return Promise.reject();
                                try {
                                  const { orderID } =
                                    await createOrderMutation.mutateAsync(
                                      amount,
                                    );
                                  return orderID;
                                } catch (error) {
                                  setErrorMsg(
                                    error.message ||
                                      "Failed to create PayPal order",
                                  );
                                  throw error;
                                }
                              }}
                              onApprove={async (data) => {
                                try {
                                  await captureOrderMutation.mutateAsync(
                                    data.orderID,
                                  );
                                } catch (error) {
                                  setErrorMsg(
                                    error.message ||
                                      "An error occurred with PayPal. Please try again.",
                                  );
                                }
                              }}
                              onError={(err) => {
                                console.error("PayPal error:", err);
                                console.error(
                                  "Error details:",
                                  JSON.stringify(err, null, 2),
                                );
                                setErrorMsg(
                                  "PayPal payment failed. This is usually a sandbox account issue. Please try: 1) Creating a new sandbox test account at developer.paypal.com, or 2) Using a different sandbox account.",
                                );
                              }}
                              onCancel={() => setErrorMsg("Payment canceled.")}
                            />
                          </PayPalScriptProvider>
                        ) : (
                          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                            <p className="text-destructive text-sm">
                              Payment system is currently unavailable. Please
                              try again later.
                            </p>
                          </div>
                        )
                      ) : (
                        <Button
                          className="w-full h-12"
                          size="lg"
                          onClick={handleGatewayRedirectPayment}
                          disabled={isGatewayRedirecting}
                        >
                          {isGatewayRedirecting ? (
                            <span className="inline-flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Redirecting to payment gateway...
                            </span>
                          ) : (
                            `Pay with ${paymentGateway === "esewa" ? "eSewa" : "Khalti"}`
                          )}
                        </Button>
                      )}

                      {isGatewayRedirecting ? (
                        <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
                          <div className="flex items-center gap-3 text-primary">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <p className="text-sm font-medium">
                              Preparing secure checkout. Please wait...
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {!user && (
                      <div className="rounded-xl border border-chart-4/20 bg-chart-4/8 p-4">
                        <div className="flex items-center gap-2 text-chart-4">
                          <Clock className="h-5 w-5" />
                          <span className="text-sm">
                            You'll need to{" "}
                            <Link
                              to={`${ROUTES.LOGIN}?redirect=/donate/${campaignId}`}
                              className="font-medium underline hover:text-amber-900"
                            >
                              sign in
                            </Link>{" "}
                            to complete your donation.
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">Your Impact</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Every donation, no matter the size, brings this campaign
                  closer to its goal and creates real, positive change in the
                  lives of those who need it most.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
