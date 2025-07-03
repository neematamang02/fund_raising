import { useContext, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FundraisingButton } from "@/components/ui/fundraising-button";
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
} from "lucide-react";

export default function Donate() {
  const { campaignId } = useParams();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [bill, setBill] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedPreset, setSelectedPreset] = useState(null);

  // Preset donation amounts
  const presetAmounts = [25, 50, 100, 250, 500, 1000];

  const {
    data: campaign,
    isLoading: loadingCampaign,
    error: campaignError,
  } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: async () => {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/campaigns/${campaignId}`, { headers });
      if (!res.ok) {
        throw new Error("Could not fetch campaign");
      }
      return res.json();
    },
    enabled: !!campaignId,
    retry: false,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (amountValue) => {
      try {
        const res = await fetch("/api/paypal/create-order", {
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
      const res = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ orderID, campaignId }),
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

  // If campaignId is missing or loading
  if (!campaignId || loadingCampaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  // If campaign fetch failed
  if (campaignError || !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Campaign Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {campaignError?.message ||
              "The campaign you're looking for doesn't exist."}
          </p>
          <Link to="/donate">
            <FundraisingButton variant="trust">
              <ArrowLeft className="h-4 w-4" />
              Back to Campaigns
            </FundraisingButton>
          </Link>
        </div>
      </div>
    );
  }

  // If donation is successful
  if (bill) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Thank You!
            </h1>
            <p className="text-lg text-gray-600">
              Your donation has been successfully processed
            </p>
          </div>

          {/* Receipt Card */}
          <Card className="bg-white shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Sparkles className="h-6 w-6" />
                Donation Receipt
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Campaign
                  </Label>
                  <p className="text-lg font-semibold text-gray-900">
                    {bill.campaignTitle}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Amount
                  </Label>
                  <p className="text-2xl font-bold text-green-600">
                    ${bill.amount} {bill.currency}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Transaction ID
                  </Label>
                  <p className="text-sm font-mono text-gray-700 bg-gray-100 px-3 py-1 rounded">
                    {bill.transactionId}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Date & Time
                  </Label>
                  <p className="text-sm text-gray-700">
                    {new Date(bill.timestamp).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>

              <div className="border-t pt-6">
                <Label className="text-sm font-medium text-gray-500">
                  Donor Information
                </Label>
                <p className="text-lg text-gray-900">{bill.payerName}</p>
                <p className="text-sm text-gray-600">{bill.payerEmail}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <FundraisingButton
                  variant="trust"
                  size="lg"
                  fullWidth
                  onClick={() => navigate(ROUTES.MY_DONATIONS)}
                >
                  <TrendingUp className="h-5 w-5" />
                  View Donation History
                </FundraisingButton>
                <Link to="/donate" className="flex-1">
                  <FundraisingButton
                    variant="outline-donate"
                    size="lg"
                    fullWidth
                  >
                    <Heart className="h-5 w-5" />
                    Donate to Another Cause
                  </FundraisingButton>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <div className="pt-6 pb-4 px-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/donate">
            <FundraisingButton variant="ghost-trust" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Campaigns
            </FundraisingButton>
          </Link>
        </div>
      </div>

      {/* Page Body */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* ───────── Campaign Information ───────── */}
          <div className="space-y-6">
            {/* Header & Badge */}
            <div>
              <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white mb-4">
                <Heart className="h-4 w-4 mr-2" />
                Support This Cause
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {campaign.title}
              </h1>
            </div>

            {/* Campaign Image */}
            <div className="relative group">
              <img
                src={campaign.imageURL || "/placeholder.svg"}
                alt={campaign.title}
                className="w-full h-64 object-cover rounded-2xl shadow-lg group-hover:scale-[1.02] transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            </div>

            {/* Campaign Details & Progress */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <p className="text-gray-700 leading-relaxed mb-6">
                  {campaign.description}
                </p>

                {/* Progress Bar */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Progress
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      {progressPercentage}%
                    </span>
                  </div>

                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                        style={{ width: `${progressPercentage}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">
                        ${campaign.raised.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Raised</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-gray-900">
                        ${campaign.target.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Goal</div>
                    </div>
                  </div>

                  {remainingAmount > 0 ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-amber-800">
                        <Target className="h-5 w-5" />
                        <span className="font-medium">
                          ${remainingAmount.toLocaleString()} still needed to
                          reach the goal
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">
                          Donation Target Completed
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ───────── Donation Form ───────── */}
          <div className="space-y-6">
            <Card className="bg-white shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                <CardTitle className="flex items-center gap-3">
                  <Heart className="h-6 w-6" />
                  Make Your Donation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {errorMsg && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-800 text-sm">{errorMsg}</p>
                  </div>
                )}

                {/* If target is already met, show disabled button instead of the form */}
                {remainingAmount <= 0 ? (
                  <div className="text-center">
                    <FundraisingButton
                      variant="outline-donate"
                      size="lg"
                      fullWidth
                      disabled
                    >
                      Donation Target Completed
                    </FundraisingButton>
                  </div>
                ) : (
                  <>
                    {/* Preset Amounts */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">
                        Choose an amount or enter custom
                      </Label>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {presetAmounts.map((preset) => (
                          <button
                            key={preset}
                            onClick={() => handlePresetAmount(preset)}
                            className={`p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                              selectedPreset === preset
                                ? "border-orange-500 bg-orange-50 text-orange-700"
                                : "border-gray-200 hover:border-orange-300 text-gray-700"
                            }`}
                          >
                            <div className="text-lg font-bold">${preset}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Amount */}
                    <div>
                      <Label
                        htmlFor="donation-amount"
                        className="text-sm font-medium text-gray-700"
                      >
                        Custom Amount (USD)
                      </Label>
                      <div className="relative mt-2">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="donation-amount"
                          type="number"
                          step="0.01"
                          placeholder="Enter amount"
                          value={amount}
                          onChange={(e) => handleCustomAmount(e.target.value)}
                          className="pl-10 h-12 text-lg border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Security Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-blue-800">
                        <Shield className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          Secure payment powered by PayPal. Your information is
                          protected.
                        </span>
                      </div>
                    </div>

                    {/* PayPal Buttons */}
                    <div className="space-y-4">
                      <PayPalScriptProvider
                        options={{
                          "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
                          currency: "USD",
                          intent: "capture",
                          components: "buttons",
                          "disable-funding": "credit",
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
                                await createOrderMutation.mutateAsync(amount);
                              return orderID;
                            } catch (error) {
                              setErrorMsg(
                                error.message || "Failed to create PayPal order"
                              );
                              throw error;
                            }
                          }}
                          onApprove={async (data) => {
                            try {
                              await captureOrderMutation.mutateAsync(
                                data.orderID
                              );
                            } catch (error) {
                              setErrorMsg(
                                error.message ||
                                  "An error occurred with PayPal. Please try again."
                              );
                            }
                          }}
                          onError={(err) => {
                            console.error("PayPal error:", err);
                            setErrorMsg(
                              "An error occurred with PayPal. Please try again."
                            );
                          }}
                          onCancel={() => setErrorMsg("Payment canceled.")}
                        />
                      </PayPalScriptProvider>
                    </div>

                    {!user && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-amber-800">
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

            {/* Impact Message */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-green-800">Your Impact</h3>
                </div>
                <p className="text-green-700 text-sm leading-relaxed">
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
