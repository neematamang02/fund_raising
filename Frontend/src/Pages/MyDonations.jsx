import { useContext, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "@/Context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Heart,
  TrendingUp,
  Calendar,
  DollarSign,
  Target,
  Award,
  Download,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  Gift,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// ── Status badge helpers ─────────────────────────────────────────────────────

function DonationStatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  if (s === "completed")
    return (
      <Badge className="bg-primary/15 text-primary border-primary/25">
        <CheckCircle className="h-3 w-3 mr-1" />
        Completed
      </Badge>
    );
  if (s === "pending")
    return (
      <Badge className="bg-chart-4/15 text-chart-4 border-chart-4/25">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  if (s === "failed")
    return (
      <Badge className="bg-destructive/15 text-destructive border-destructive/25">
        <AlertCircle className="h-3 w-3 mr-1" />
        Failed
      </Badge>
    );
  return (
    <Badge className="bg-muted text-muted-foreground border-border">
      {status || "Unknown"}
    </Badge>
  );
}

function PayoutStatusBadge({ status }) {
  if (status === "paid_out")
    return (
      <Badge className="bg-primary/15 text-primary border-primary/25">
        Paid Out
      </Badge>
    );
  if (status === "scheduled" || status === "pending")
    return (
      <Badge className="bg-chart-2/15 text-chart-2 border-chart-2/25">
        Pending
      </Badge>
    );
  if (status === "processing")
    return (
      <Badge className="bg-chart-4/15 text-chart-4 border-chart-4/25">
        Processing
      </Badge>
    );
  return (
    <Badge className="bg-muted text-muted-foreground border-border">
      No Payout Yet
    </Badge>
  );
}

function CampaignEndedBadge({ campaign }) {
  if (!campaign) return null;
  const ended =
    campaign.status === "expired" ||
    campaign.status === "inactive" ||
    campaign.isDonationEnabled === false;
  if (!ended) return null;
  return (
    <Badge className="bg-muted text-muted-foreground border-border">
      Campaign Ended
    </Badge>
  );
}

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

function buildCurrencySummary({ totalsByCurrency, countsByCurrency, mode }) {
  const nprTotal = Number(totalsByCurrency.NPR || 0);
  const usdTotal = Number(totalsByCurrency.USD || 0);

  if (mode === "average") {
    const nprCount = Number(countsByCurrency.NPR || 0);
    const usdCount = Number(countsByCurrency.USD || 0);
    const parts = [];

    if (nprCount > 0) {
      parts.push(
        `NPR ${(nprTotal / nprCount).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      );
    }

    if (usdCount > 0) {
      parts.push(
        `USD ${(usdTotal / usdCount).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      );
    }

    return parts.length ? parts.join(" | ") : "-";
  }

  const totals = [];
  if (nprTotal > 0) totals.push(`NPR ${nprTotal.toLocaleString()}`);
  if (usdTotal > 0) totals.push(`USD ${usdTotal.toLocaleString()}`);
  return totals.length ? totals.join(" | ") : "-";
}

// ── Stat tile ────────────────────────────────────────────────────────────────

const STAT_CONFIGS = [
  {
    key: "totalAmountLabel",
    label: "Total Donated",
    icon: DollarSign,
    fmt: (v) => v,
    bg: "bg-primary/8 border-primary/15",
    icon_bg: "bg-primary/15",
    text: "text-primary",
  },
  {
    key: "totalDonations",
    label: "Donations Made",
    icon: Heart,
    fmt: (v) => v,
    bg: "bg-chart-4/8 border-chart-4/15",
    icon_bg: "bg-chart-4/15",
    text: "text-chart-4",
  },
  {
    key: "uniqueCampaigns",
    label: "Campaigns Supported",
    icon: Target,
    fmt: (v) => v,
    bg: "bg-chart-2/8 border-chart-2/15",
    icon_bg: "bg-chart-2/15",
    text: "text-chart-2",
  },
  {
    key: "averageDonationLabel",
    label: "Average Donation",
    icon: TrendingUp,
    fmt: (v) => v,
    bg: "bg-chart-3/8 border-chart-3/15",
    icon_bg: "bg-chart-3/15",
    text: "text-chart-3",
  },
];

function StatTile({ config, value }) {
  const { label, icon: Icon, fmt, bg, icon_bg, text } = config;
  return (
    <Card className={`border ${bg}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs font-medium mb-1 ${text}`}>{label}</p>
            <p className="text-2xl font-bold text-foreground">{fmt(value)}</p>
          </div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${icon_bg}`}
          >
            <Icon className={`h-5 w-5 ${text}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function MyDonations() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [timeFilter, setTimeFilter] = useState("all");
  const [copiedHash, setCopiedHash] = useState("");

  const copyToClipboard = async (value) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopiedHash(value);
      window.setTimeout(() => setCopiedHash(""), 1200);
    } catch (_err) {
      // Ignore clipboard failures in unsupported environments.
    }
  };

  const shortenHash = (value) => {
    if (!value || value.length < 16) return value || "N/A";
    return `${value.slice(0, 8)}...${value.slice(-8)}`;
  };

  const {
    data: donationsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["myDonations"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const res = await fetch("/api/donations/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 403)
          throw new Error(
            "Access denied. Please ensure you have donor role to view donations.",
          );
        throw new Error(
          errorData.message || `Failed to load donations (${res.status})`,
        );
      }

      const data = await res.json();
      return data;
    },
    enabled: !!user,
    retry: 1,
  });

  const donations = donationsData?.donations || [];

  const donationStats = useMemo(() => {
    if (!donations || donations.length === 0) return null;
    const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalDonations = donations.length;
    const totalsByCurrency = donations.reduce(
      (acc, donation) => {
        const currency = normalizeCurrency(donation.currency);
        acc[currency] =
          Number(acc[currency] || 0) + Number(donation.amount || 0);
        return acc;
      },
      { NPR: 0, USD: 0 },
    );
    const countsByCurrency = donations.reduce(
      (acc, donation) => {
        const currency = normalizeCurrency(donation.currency);
        acc[currency] = Number(acc[currency] || 0) + 1;
        return acc;
      },
      { NPR: 0, USD: 0 },
    );
    const completedDonations = donations.filter(
      (d) => d.status === "COMPLETED" || d.status === "completed",
    ).length;
    const successRate = (completedDonations / totalDonations) * 100;
    const uniqueCampaigns = new Set(
      donations.map((d) => d.campaign?._id).filter(Boolean),
    ).size;
    return {
      totalAmount,
      totalDonations,
      totalAmountLabel: buildCurrencySummary({
        totalsByCurrency,
        countsByCurrency,
        mode: "total",
      }),
      averageDonationLabel: buildCurrencySummary({
        totalsByCurrency,
        countsByCurrency,
        mode: "average",
      }),
      successRate,
      uniqueCampaigns,
      recentDonation: donations[0]?.createdAt,
    };
  }, [donations]);

  const filteredDonations = useMemo(() => {
    if (!donations || donations.length === 0) return [];

    const filtered = donations.filter((donation) => {
      const campaignTitle = donation.campaign?.title || "";
      const matchesSearch = campaignTitle
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const donationStatus = (donation.status || "").toLowerCase();
      const matchesStatus =
        statusFilter === "all" || donationStatus === statusFilter.toLowerCase();

      let matchesTime = true;
      if (timeFilter !== "all") {
        const donationDate = new Date(donation.createdAt);
        const now = new Date();
        switch (timeFilter) {
          case "week":
            matchesTime = now - donationDate <= 7 * 24 * 60 * 60 * 1000;
            break;
          case "month":
            matchesTime = now - donationDate <= 30 * 24 * 60 * 60 * 1000;
            break;
          case "year":
            matchesTime = now - donationDate <= 365 * 24 * 60 * 60 * 1000;
            break;
        }
      }
      return matchesSearch && matchesStatus && matchesTime;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "amount-high":
          return (b.amount || 0) - (a.amount || 0);
        case "amount-low":
          return (a.amount || 0) - (b.amount || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [donations, searchTerm, statusFilter, sortBy, timeFilter]);

  // ── Early returns ────────────────────────────────────────────────────────

  if (!user) {
    return (
      <div className="min-h-screen surface-page flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Sign In Required
          </h2>
          <p className="text-muted-foreground mb-6">
            Please log in to view your donation history
          </p>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => navigate("/login")}
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen surface-page py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">
              Loading your donation history…
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded animate-pulse mb-4" />
                  <div className="h-8 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen surface-page flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Error Loading Donations
          </h2>
          <p className="text-muted-foreground mb-6">{error.message}</p>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (donations.length === 0) {
    return (
      <div className="min-h-screen surface-page py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">
              <Heart className="h-3.5 w-3.5 mr-1.5" />
              Donation History
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Your Giving Journey
            </h1>
          </div>

          {/* Empty state */}
          <Card className="border">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Start Your Impact Journey
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                You haven't made any donations yet. Discover meaningful causes
                and start making a difference in communities around the world.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/donate">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Heart className="h-4 w-4 mr-2" />
                    Browse Campaigns
                  </Button>
                </Link>
                <Link to="/campaigns">
                  <Button variant="outline">
                    <Target className="h-4 w-4 mr-2" />
                    Explore Causes
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── Main view ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen surface-page py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page header */}
        <div>
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">
            <Heart className="h-3.5 w-3.5 mr-1.5" />
            Your Impact Dashboard
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Donation History
          </h1>
          <p className="text-muted-foreground mt-1.5 max-w-xl">
            Track your giving journey and see the positive impact you've created
            in communities worldwide.
          </p>
        </div>

        {/* Stat tiles */}
        {donationStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STAT_CONFIGS.map((cfg) => (
              <StatTile
                key={cfg.key}
                config={cfg}
                value={donationStats[cfg.key]}
              />
            ))}
          </div>
        )}

        {/* Impact summary */}
        {donationStats && (
          <Card className="border bg-primary/5 border-primary/15">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-primary/15 rounded-full flex items-center justify-center">
                  <Award className="h-4.5 w-4.5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  Your Impact Summary
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {donationStats.successRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Success Rate
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {donationStats.uniqueCampaigns}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Campaigns Supported
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {donationStats.recentDonation
                      ? Math.floor(
                          (new Date() -
                            new Date(donationStats.recentDonation)) /
                            (1000 * 60 * 60 * 24),
                        )
                      : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Days Since Last Donation
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="border bg-card">
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search campaigns…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Status */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              {/* Time */}
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="amount-high">Highest Amount</SelectItem>
                  <SelectItem value="amount-low">Lowest Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {filteredDonations.length} of {donations.length}{" "}
                donations
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                <Download className="h-4 w-4 mr-2" />
                Export History
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Donation list */}
        <div className="space-y-3">
          {filteredDonations.map((donation) => {
            return (
              <Card
                key={donation._id}
                className="border bg-card hover:bg-accent/20 transition-colors"
              >
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Campaign info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <img
                          src={
                            donation.campaign?.imageURL || "/placeholder.svg"
                          }
                          alt={donation.campaign?.title || "Campaign"}
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-border"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-base text-foreground mb-1.5 line-clamp-1">
                            {donation.campaign?.title || "Unknown Campaign"}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>
                                {new Date(
                                  donation.createdAt,
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              <span>
                                {new Date(
                                  donation.createdAt,
                                ).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Amount + status */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="text-center lg:text-right">
                        <div className="text-xl font-bold text-foreground">
                          {formatDonationAmount(
                            donation.amount,
                            donation.currency,
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          ID: {donation.transactionId || "N/A"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex items-center justify-center lg:justify-end gap-1.5">
                          <span>
                            Hash:{" "}
                            {shortenHash(
                              donation.transactionHash ||
                                donation.transactionId,
                            )}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() =>
                              copyToClipboard(
                                donation.transactionHash ||
                                  donation.transactionId,
                              )
                            }
                          >
                            {copiedHash ===
                            (donation.transactionHash ||
                              donation.transactionId) ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-col items-center lg:items-end gap-2">
                        <DonationStatusBadge status={donation.status} />
                        <CampaignEndedBadge campaign={donation.campaign} />
                        {donation.campaign?._id && (
                          <Link to={`/donate/${donation.campaign._id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:bg-primary/10 h-7 px-2.5 text-xs"
                            >
                              <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                              View Campaign
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Transparency row */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <p className="text-sm font-medium text-foreground">
                        Fund transparency
                      </p>
                      <PayoutStatusBadge
                        status={
                          donation.payoutStatus === "Paid Out"
                            ? "paid_out"
                            : "pending"
                        }
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 text-sm">
                      <div className="rounded-lg bg-muted/50 border border-border/50 p-3">
                        <p className="text-muted-foreground text-xs mb-1">
                          Donated Amount
                        </p>
                        <p className="font-semibold text-foreground">
                          {formatDonationAmount(
                            donation.amount,
                            donation.currency,
                          )}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/50 border border-border/50 p-3">
                        <p className="text-muted-foreground text-xs mb-1">
                          Payout Status
                        </p>
                        <p className="font-semibold text-foreground">
                          {donation.payoutStatus || "Pending"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/50 border border-border/50 p-3">
                        <p className="text-muted-foreground text-xs mb-1">
                          Payout Date
                        </p>
                        <p className="font-semibold text-foreground">
                          {donation.payoutDate
                            ? new Date(donation.payoutDate).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )
                            : "Not yet"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/50 border border-border/50 p-3">
                        <p className="text-muted-foreground text-xs mb-1">
                          Traceability
                        </p>
                        <p className="font-semibold text-foreground break-all">
                          {donation.traceability?.isLinked
                            ? `${shortenHash(donation.traceability?.donationHash)} -> ${shortenHash(donation.traceability?.payoutHash)}`
                            : `${shortenHash(donation.traceability?.donationHash || donation.transactionHash)} -> Pending payout`}
                        </p>
                        {donation.traceability?.payoutHash ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 mt-1"
                            onClick={() =>
                              copyToClipboard(donation.traceability?.payoutHash)
                            }
                          >
                            {copiedHash ===
                            donation.traceability?.payoutHash ? (
                              <Check className="h-3.5 w-3.5 mr-1" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 mr-1" />
                            )}
                            Copy payout hash
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <Card className="border bg-primary/5 border-primary/15">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold text-foreground">
                Continue Making a Difference
              </h3>
            </div>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Your generosity has already created positive change. Discover more
              campaigns and continue your impact journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/donate">
                <Button className="bg-primary hover:bg-primary/90">
                  <Heart className="h-4 w-4 mr-2" />
                  Donate to New Causes
                </Button>
              </Link>
              <Link to="/campaigns">
                <Button variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Browse All Campaigns
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
