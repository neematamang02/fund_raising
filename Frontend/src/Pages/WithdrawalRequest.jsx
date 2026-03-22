import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import ROUTES from "@/routes/routes";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : "/api";

const WithdrawalRequest = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [campaign, setCampaign] = useState(null);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [profileStatus, setProfileStatus] = useState(null);
  const [profileRejectionReason, setProfileRejectionReason] = useState("");
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [amount, setAmount] = useState("");
  const submitKeyRef = useRef(null);
  const submitSignatureRef = useRef(null);

  useEffect(() => {
    fetchPageData();
  }, [campaignId]);

  const fetchPageData = async () => {
    setBootLoading(true);
    try {
      const token = localStorage.getItem("token");

      const [campaignRes, balanceRes, profileRes, historyRes] =
        await Promise.all([
          fetch(`${API_BASE_URL}/campaigns/${campaignId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(
            `${API_BASE_URL}/withdrawal-requests/available-balance/${campaignId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
          fetch(`${API_BASE_URL}/organizer/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/withdrawal-requests/my-requests`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      if (campaignRes.ok) {
        const campaignData = await campaignRes.json();
        setCampaign(campaignData);
      }

      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setAvailableBalance(balanceData.availableBalance || 0);
      }

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfileStatus(profileData.verificationStatus);
        setProfileRejectionReason(profileData.profile?.rejectionReason || "");
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setWithdrawalHistory(Array.isArray(historyData) ? historyData : []);
      }
    } catch (error) {
      console.error("Error loading withdrawal page:", error);
      toast.error("Failed to load withdrawal data");
    } finally {
      setBootLoading(false);
    }
  };

  const statusBadgeClass = (status) => {
    if (status === "verified") return "bg-emerald-100 text-emerald-800";
    if (status === "pending") return "bg-amber-100 text-amber-800";
    if (status === "rejected") return "bg-red-100 text-red-800";
    return "bg-slate-100 text-slate-800";
  };

  const campaignWithdrawalHistory = withdrawalHistory.filter(
    (item) =>
      item?.campaign?._id === campaignId || item?.campaign === campaignId,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const parsed = Number.parseFloat(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("Please enter a valid withdrawal amount");
      return;
    }

    if (parsed > availableBalance) {
      toast.error(
        `Amount exceeds available balance of $${availableBalance.toFixed(2)}`,
      );
      return;
    }

    if (profileStatus !== "verified") {
      toast.error(
        "Organizer profile must be verified before requesting withdrawals",
      );
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const requestSignature = `${campaignId}:${parsed.toFixed(2)}`;
      if (submitSignatureRef.current !== requestSignature) {
        const generatedKey =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `withdrawal-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        submitSignatureRef.current = requestSignature;
        submitKeyRef.current = generatedKey;
      }
      const response = await fetch(`${API_BASE_URL}/withdrawal-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Idempotency-Key": submitKeyRef.current,
        },
        body: JSON.stringify({
          campaignId,
          amount: parsed,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        toast.success("Withdrawal request submitted successfully");
        submitSignatureRef.current = null;
        submitKeyRef.current = null;
        navigate(ROUTES.MY_CAMPAIGNS);
        return;
      }

      if (
        data.code === "ORGANIZER_PROFILE_REQUIRED" ||
        data.code === "ORGANIZER_PROFILE_NOT_VERIFIED"
      ) {
        toast.error(
          data.message || "Organizer profile verification is required",
        );
        navigate(ROUTES.ORGANIZER_PROFILE);
        return;
      }

      toast.error(data.message || "Failed to submit withdrawal request");
    } catch (error) {
      console.error("Error submitting withdrawal request:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (bootLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const profileVerified = profileStatus === "verified";

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Request Withdrawal</h1>
        <p className="text-muted-foreground">
          Withdraw campaign funds using your verified organizer profile.
        </p>
      </div>

      {campaign && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{campaign.title}</CardTitle>
            <CardDescription>
              Available Balance: ${availableBalance.toFixed(2)}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Organizer Profile Verification
            </span>
            <Badge className={statusBadgeClass(profileStatus)}>
              {(profileStatus || "not_submitted").toUpperCase()}
            </Badge>
          </CardTitle>
          <CardDescription>
            Bank and KYC details are pulled from your one-time organizer
            profile.
          </CardDescription>
        </CardHeader>
        {!profileVerified && (
          <CardContent className="space-y-4">
            {profileStatus === "rejected" && profileRejectionReason && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
                <p className="font-medium">Profile review feedback</p>
                <p className="mt-1 whitespace-pre-wrap">
                  {profileRejectionReason}
                </p>
              </div>
            )}
            <Button onClick={() => navigate(ROUTES.ORGANIZER_PROFILE)}>
              Complete Organizer Profile
            </Button>
          </CardContent>
        )}
      </Card>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Amount</CardTitle>
            <CardDescription>
              Enter an amount up to your currently available balance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!profileVerified || loading}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !profileVerified}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Withdrawal Request
            </Button>
          </CardContent>
        </Card>
      </form>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
          <CardDescription>
            Recent withdrawal requests for this campaign.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {campaignWithdrawalHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No withdrawal requests submitted for this campaign yet.
            </p>
          ) : (
            campaignWithdrawalHistory.slice(0, 10).map((item) => (
              <div
                key={item._id}
                className="rounded-lg border border-slate-200 p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">
                    ${Number(item.amount || 0).toFixed(2)}
                  </p>
                  <Badge className={statusBadgeClass(item.status)}>
                    {(item.status || "unknown").toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  Requested {new Date(item.createdAt).toLocaleString()}
                </p>
                {item.rejectionReason && (
                  <p className="text-sm text-red-700 whitespace-pre-wrap">
                    Reason: {item.rejectionReason}
                  </p>
                )}
                {item.reviewNotes && (
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    Notes: {item.reviewNotes}
                  </p>
                )}
                {item.transactionReference && (
                  <p className="text-xs text-slate-500">
                    Transaction Ref: {item.transactionReference}
                  </p>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WithdrawalRequest;
