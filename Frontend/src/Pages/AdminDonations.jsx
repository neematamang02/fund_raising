import { useContext, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/Context/AuthContext";
import ROUTES from "@/routes/routes";
import { adminQueryKeys, getAdminDonations } from "@/services/adminApi";
import { Card, CardContent } from "@/components/ui/card";
import { AdminPageSkeleton } from "@/components/admin/AdminSkeletons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  PageHeader,
  RefreshButton,
  StatusBadge,
  EmptyState,
  Pagination,
  FilterCard,
} from "@/components/admin/AdminUtils";
import { HandCoins, CircleDollarSign, Hash } from "lucide-react";

function normalizeCurrency(currency) {
  return String(currency || "USD").toUpperCase() === "NPR" ? "NPR" : "USD";
}

function formatDonationAmount(amount, currency, maximumFractionDigits = 2) {
  const parsed = Number(amount || 0);
  const safeAmount = Number.isFinite(parsed) ? parsed : 0;
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: normalizeCurrency(currency),
    maximumFractionDigits,
  }).format(safeAmount);
}

function formatCurrencySummary(totals) {
  const nprTotal = Number(totals?.NPR || 0);
  const usdTotal = Number(totals?.USD || 0);

  const parts = [];
  if (nprTotal > 0)
    parts.push(
      `NPR ${nprTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
    );
  if (usdTotal > 0)
    parts.push(
      `USD ${usdTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
    );
  return parts.length ? parts.join(" | ") : "-";
}

// ─── Stat tile ────────────────────────────────────────────────────────────────

function StatTile({ icon: Icon, label, value, accent }) {
  const accentMap = {
    primary: "text-primary bg-primary/8 border-primary/20",
    blue: "text-chart-2 bg-chart-2/8 border-chart-2/20",
    muted: "text-muted-foreground bg-muted border-border",
  };
  return (
    <Card className="border bg-card">
      <CardContent className="p-5 flex items-center gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${accentMap[accent ?? "muted"]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-bold text-foreground leading-tight">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Donation card ─────────────────────────────────────────────────────────────

function DonationCard({ donation }) {
  return (
    <Card className="border bg-card transition-colors hover:bg-accent/20">
      <CardContent className="py-4 px-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="font-semibold text-foreground truncate">
              {donation.campaign?.title || "Unknown Campaign"}
            </p>
            <p className="text-sm text-muted-foreground">
              Donor: {donation.donor?.name || "N/A"}{" "}
              <span className="text-muted-foreground/60">
                ({donation.donor?.email || donation.donorEmail || "N/A"})
              </span>
            </p>
            <p className="text-xs text-muted-foreground/60">
              TXN: {donation.transactionId || "N/A"} &bull;{" "}
              {new Date(donation.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <p className="text-xl font-bold text-primary">
              {formatDonationAmount(donation.amount, donation.currency)}
            </p>
            <StatusBadge status={donation.status?.toLowerCase()} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

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

  const completedTotalsByCurrency = useMemo(
    () =>
      donations
        .filter((d) => String(d.status || "").toUpperCase() === "COMPLETED")
        .reduce(
          (acc, donation) => {
            const currency = normalizeCurrency(donation.currency);
            acc[currency] =
              Number(acc[currency] || 0) + Number(donation.amount || 0);
            return acc;
          },
          { NPR: 0, USD: 0 },
        ),
    [donations],
  );

  if (loading || isLoading) {
    return <AdminPageSkeleton statCount={3} listCount={5} />;
  }

  return (
    <div className="min-h-screen surface-page px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <PageHeader
          label="Admin"
          title="Donation Tracking"
          description="Monitor all donation transactions and payment statuses."
          action={
            <RefreshButton
              disabled={isFetching}
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: ["admin", "donations"],
                })
              }
            />
          }
        />

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <StatTile
            icon={HandCoins}
            label="Visible records"
            value={donations.length}
            accent="muted"
          />
          <StatTile
            icon={Hash}
            label="Total records"
            value={total}
            accent="blue"
          />
          <StatTile
            icon={CircleDollarSign}
            label="Completed amount"
            value={formatCurrencySummary(completedTotalsByCurrency)}
            accent="primary"
          />
        </div>

        {/* Filter */}
        <FilterCard>
          <div className="w-full max-w-xs space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Status filter
            </Label>
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
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FilterCard>

        {/* List */}
        <div className="space-y-2">
          {donations.length === 0 ? (
            <EmptyState
              icon={HandCoins}
              title="No donations found"
              description="No donations match the current filter."
            />
          ) : (
            donations.map((donation) => (
              <DonationCard key={donation._id} donation={donation} />
            ))
          )}
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          isFetching={isFetching}
          onPrev={() => setPage((p) => Math.max(p - 1, 1))}
          onNext={() => setPage((p) => p + 1)}
        />
      </div>
    </div>
  );
}
