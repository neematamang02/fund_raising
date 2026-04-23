import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { AuthContext } from "@/Context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ROUTES from "@/routes/routes";
import { base64Decode } from "@/utils/helpers";
import { verifyPaymentStatus } from "@/services/paymentApi";

export default function PaymentFailure() {
  const { token } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [transactionId, setTransactionId] = useState("");

  const query = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  useEffect(() => {
    let cancelled = false;

    async function markFailed() {
      try {
        if (!token) {
          navigate(
            `${ROUTES.LOGIN}?redirect=${encodeURIComponent(location.pathname + location.search)}`,
          );
          return;
        }

        let productId = "";

        if (query.get("data")) {
          const decoded = base64Decode(query.get("data"));
          productId = decoded?.transaction_uuid || "";
        }

        if (!productId) {
          productId =
            query.get("purchase_order_id") || query.get("product_id") || "";
        }

        if (!productId) {
          productId = sessionStorage.getItem("current_transaction_id") || "";
        }

        if (!cancelled) {
          setTransactionId(productId || "N/A");
        }

        if (!productId) {
          return;
        }

        await verifyPaymentStatus(
          {
            product_id: productId,
            status: "FAILED",
          },
          token,
          `payment-failure:${productId}`,
        );
      } catch {
        // Best-effort update only.
      }
    }

    markFailed();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, location.search, navigate, query, token]);

  return (
    <div className="surface-page flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Payment Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your payment was not completed. Any amount deducted by gateway will
            be refunded based on gateway settlement policy.
          </p>

          <div className="rounded bg-muted px-3 py-2 text-sm">
            Transaction Reference:{" "}
            <span className="font-mono">{transactionId || "N/A"}</span>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => navigate(ROUTES.DONATE)}>
              Back to Campaigns
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
