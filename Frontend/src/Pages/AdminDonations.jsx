import { useContext, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/Context/AuthContext";
import ROUTES from "@/routes/routes";
import { adminQueryKeys, getAdminDonations } from "@/services/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  HandCoins,
  CircleDollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

function StatusBadge({ status }) {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "COMPLETED") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        COMPLETED
      </Badge>
    );
  }
  if (normalized === "PENDING") {
    return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-200">
        <Clock className="h-3 w-3 mr-1" />
        PENDING
      </Badge>
    );
  }
  return (
    <Badge className="bg-rose-100 text-rose-700 border-rose-200">
      <AlertTriangle className="h-3 w-3 mr-1" />
      {normalized || "UNKNOWN"}
    </Badge>
  );
}

export default function AdminDonations() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate(`${ROUTES.LOGIN}?redirect=${ROUTES.ADMIN_DONATIONS}`);
      } else if (user.role !== "admin") {
        navigate(ROUTES.HOME);
      }
    }
  }, [loading, navigate, user]);

  const queryParams = useMemo(() => ({ status, page }), [status, page]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: adminQueryKeys.donations(queryParams),
    queryFn: () => getAdminDonations(queryParams),
    enabled: Boolean(user?.role === "admin"),
  });

  const donations = data?.donations || [];
  const total = Number(data?.total || 0);
  const totalPages = Number(data?.totalPages || 1);

  const completedAmount = useMemo(
    () =>
      donations
        .filter((d) => String(d.status || "").toUpperCase() === "COMPLETED")
        .reduce((sum, d) => sum + Number(d.amount || 0), 0),
    [donations],
  );

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(120deg,#f8fafc_0%,#ecfeff_45%,#eef2ff_100%)] px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">
              Donation Tracking
            </h1>
            <p className="text-slate-600 mt-1">
              Monitor all donation transactions and payment statuses.
            </p>
          </div>
          <Button
            variant="outline"
            disabled={isFetching}
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ["admin", "donations"],
              })
            }
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Refresh
          </Button>
        </section>

        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500">
                Visible records
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <HandCoins className="h-5 w-5 text-cyan-600" />
              {donations.length}
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500">
                Total records
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-slate-900">
              {total}
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500">
                Completed amount (visible)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-emerald-700 flex items-center gap-2">
              <CircleDollarSign className="h-5 w-5" />$
              {completedAmount.toFixed(2)}
            </CardContent>
          </Card>
        </section>

        <Card className="border-0 shadow-lg bg-white/90">
          <CardContent className="pt-6 flex flex-col md:flex-row md:items-end gap-3">
            <div className="w-full md:w-64">
              <p className="text-sm font-medium mb-1">Status filter</p>
              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="FAILED">FAILED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3">
          {donations.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-14 text-center text-slate-600">
                No donations found for this filter.
              </CardContent>
            </Card>
          ) : (
            donations.map((donation) => (
              <Card key={donation._id} className="shadow-sm">
                <CardContent className="py-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {donation.campaign?.title || "Unknown Campaign"}
                      </h3>
                      <p className="text-sm text-slate-600">
                        Donor: {donation.donor?.name || "N/A"} (
                        {donation.donor?.email || donation.donorEmail || "N/A"})
                      </p>
                      <p className="text-xs text-slate-500">
                        TXN: {donation.transactionId || "N/A"} |{" "}
                        {new Date(donation.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-xl font-bold text-slate-900">
                        ${Number(donation.amount || 0).toFixed(2)}
                      </p>
                      <StatusBadge status={donation.status} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card>
          <CardContent className="py-4 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
