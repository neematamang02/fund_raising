import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { AuthContext } from "@/Context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ROUTES from "@/routes/routes";
import { base64Decode } from "@/utils/helpers";
import { verifyPaymentStatus } from "@/services/paymentApi";

function formatCurrencyAmount(amount, currency) {
  const parsed = Number.parseFloat(amount);
  const safeAmount = Number.isFinite(parsed) ? parsed : 0;
  const normalizedCurrency = currency === "USD" ? "USD" : "NPR";

  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: normalizedCurrency,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

export default function PaymentSuccess() {
  const { token } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [systemError, setSystemError] = useState("");
  const [bill, setBill] = useState(null);

  const query = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  useEffect(() => {
    let cancelled = false;

    async function runVerification() {
      try {
        if (!token) {
          navigate(
            `${ROUTES.LOGIN}?redirect=${encodeURIComponent(location.pathname + location.search)}`,
          );
          return;
        }

        let productId = "";
        let pidx = "";

        if (query.get("data")) {
          const decoded = base64Decode(query.get("data"));
          productId = decoded?.transaction_uuid || "";
        }

        if (!productId) {
          productId = query.get("purchase_order_id") || "";
        }

        if (!productId) {
          productId = sessionStorage.getItem("current_transaction_id") || "";
        }

        pidx = query.get("pidx") || "";

        if (!productId) {
          setSystemError("Missing transaction reference in callback URL.");
          setLoading(false);
          return;
        }

        const result = await verifyPaymentStatus(
          {
            product_id: productId,
            pidx,
          },
          token,
          `payment-success:${productId}:${pidx || "none"}`,
        );

        if (cancelled) {
          return;
        }

        if (result.status === "FAILED") {
          navigate(
            `${ROUTES.PAYMENT_FAILURE}?product_id=${encodeURIComponent(productId)}`,
          );
          return;
        }

        setBill(result.billReceipt || null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        navigate(ROUTES.PAYMENT_FAILURE);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    runVerification();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, location.search, navigate, query, token]);

  if (loading) {
    return (
      <div className="surface-page flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <p className="mt-3 text-muted-foreground">
            Verifying payment status...
          </p>
        </div>
      </div>
    );
  }

  if (systemError || !bill) {
    return (
      <div className="surface-page flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>System Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {systemError ||
                "Payment verification failed due to a network/system issue."}
            </p>
            <Button onClick={() => navigate(ROUTES.DONATE)}>
              Back to Campaigns
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="surface-page px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/15">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>
          <h1 className="mb-2 text-4xl font-bold text-foreground">
            Payment Successful
          </h1>
          <p className="text-lg text-muted-foreground">
            Your payment has been verified.
          </p>
        </div>

        <Card className="surface-card overflow-hidden rounded-xl border shadow-lg">
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle>Donation Receipt</CardTitle>
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
                  {formatCurrencyAmount(bill.amount, bill.currency)}
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

            <Button
              className="w-full"
              onClick={() => navigate(ROUTES.MY_DONATIONS)}
            >
              View Donation History
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
