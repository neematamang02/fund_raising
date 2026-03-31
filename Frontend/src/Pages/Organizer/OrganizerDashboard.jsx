import { useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "@/Context/AuthContext";
import ROUTES from "@/routes/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminPageSkeleton } from "@/components/admin/AdminSkeletons";
import {
  BarChart3,
  PlusCircle,
  ShieldCheck,
  Wallet,
  DollarSign,
  Bell,
  ArrowRight,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Target,
} from "lucide-react";

// ─── API ─────────────────────────────────────────────────────────────────────

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : "/api";

async function fetchOrganizerDashboard(token, userId) {
  const [campaignsRes, withdrawalsRes, profileRes] = await Promise.all([
    fetch(`${API_BASE_URL}/campaigns?owner=${userId}&limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch(`${API_BASE_URL}/withdrawal-requests/my-requests`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch(`${API_BASE_URL}/organizer/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ]);

  if (!campaignsRes.ok) throw new Error("Failed to load organizer campaigns");

  const campaignsData = await campaignsRes.json();
  const withdrawalsData = withdrawalsRes.ok ? await withdrawalsRes.json() : [];
  const profileData = profileRes.ok
    ? await profileRes.json()
    : { verificationStatus: null, hasProfile: false };

  return {
    campaigns: campaignsData?.campaigns || [],
    withdrawals: Array.isArray(withdrawalsData) ? withdrawalsData : [],
    profile: profileData,
  };
}

// ─── Formatters ──────────────────────────────────────────────────────────────

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

// ─── Accent map (mirrors AdminDashboard) ─────────────────────────────────────

const ACCENT = {
  green: {
    bar: "bg-primary",
    icon: "bg-primary/15",
    iconText: "text-primary",
  },
  blue: {
    bar: "bg-chart-2",
    icon: "bg-chart-2/10",
    iconText: "text-chart-2",
  },
  amber: {
    bar: "bg-chart-4",
    icon: "bg-chart-4/10",
    iconText: "text-chart-4",
  },
  red: {
    bar: "bg-destructive",
    icon: "bg-destructive/10",
    iconText: "text-destructive",
  },
};

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ title, value, subtitle, icon: Icon, accent = "blue" }) {
  const a = ACCENT[accent] ?? ACCENT.blue;
  return (
    <div className="relative bg-card border border-border rounded-lg shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md">
      <div className={`h-[3px] w-full ${a.bar}`} />
      <div className="flex items-start justify-between gap-3 p-5 flex-1">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">
            {title}
          </p>
          <p className="mt-1.5 text-2xl font-bold text-foreground leading-none">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${a.icon}`}>
          <Icon className={`h-4 w-4 ${a.iconText}`} />
        </div>
      </div>
    </div>
  );
}

// ─── VerificationStatusBadge ──────────────────────────────────────────────────

function VerificationStatusBadge({ status }) {
  const map = {
    verified: "bg-primary/15 text-primary border-primary/20",
    pending: "bg-chart-4/15 text-chart-4 border-chart-4/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
  };
  const cls = map[status] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {status === "verified" && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
      {status === "pending" && <span className="h-1.5 w-1.5 rounded-full bg-chart-4 animate-pulse" />}
      {status === "rejected" && <span className="h-1.5 w-1.5 rounded-full bg-destructive" />}
      {!status && <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />}
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Not submitted"}
    </span>
  );
}

// ─── StatusBadge (campaign list) ─────────────────────────────────────────────

function StatusBadge({ status }) {
  const s = status?.toLowerCase();
  const map = {
    active: "bg-primary/10 text-primary",
    completed: "bg-chart-2/10 text-chart-2",
    expired: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${map[s] ?? "bg-muted text-muted-foreground"}`}>
      {s ?? "unknown"}
    </span>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon = Target, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 py-10 px-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground max-w-[220px]">{message}</p>
      {action}
    </div>
  );
}

// ─── CampaignProgressRow ──────────────────────────────────────────────────────

function CampaignProgressRow({ campaign }) {
  const raised = Number(campaign.raised ?? 0);
  const goal = Number(campaign.goal ?? 0);
  const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-foreground truncate">
              {campaign.title}
            </p>
            <StatusBadge status={campaign.status} />
          </div>
        </div>
        <Link
          to={ROUTES.MY_CAMPAIGNS}
          className="shrink-0 text-xs font-medium text-chart-2 hover:text-foreground transition-colors flex items-center gap-0.5"
        >
          View <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-semibold text-muted-foreground w-10 text-right">
          {pct}%
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        {currency.format(raised)} raised of {goal > 0 ? currency.format(goal) : "—"} goal
      </p>
    </div>
  );
}

// ─── QuickActionCard ──────────────────────────────────────────────────────────

function QuickActionCard({ to, icon: Icon, title, description, accent = "blue" }) {
  const a = ACCENT[accent] ?? ACCENT.blue;
  return (
    <Link to={to} className="group block">
      <div className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3.5 transition-all hover:border-ring/40 hover:shadow-sm hover:bg-accent/30">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${a.icon}`}>
          <Icon className={`h-4 w-4 ${a.iconText}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
      </div>
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OrganizerDashboard() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const dashboardQuery = useQuery({
    queryKey: ["organizerDashboard", user?.userId],
    enabled: Boolean(token && user?.role === "organizer"),
    queryFn: () => fetchOrganizerDashboard(token, user.userId),
    refetchInterval: 30_000,
  });

  const campaigns = dashboardQuery.data?.campaigns ?? [];
  const withdrawals = dashboardQuery.data?.withdrawals ?? [];
  const profile = dashboardQuery.data?.profile ?? { hasProfile: false, verificationStatus: null };

  const stats = useMemo(() => {
    const totalRaised = campaigns.reduce((s, c) => s + Number(c?.raised ?? 0), 0);
    const activeCampaigns = campaigns.filter((c) => c?.status === "active").length;
    const pendingWithdrawals = withdrawals.filter(
      (w) => w?.status === "pending" || w?.status === "under_review",
    ).length;
    return { totalCampaigns: campaigns.length, totalRaised, activeCampaigns, pendingWithdrawals };
  }, [campaigns, withdrawals]);

  const topCampaigns = useMemo(() => {
    return [...campaigns]
      .sort((a, b) => Number(b.raised ?? 0) - Number(a.raised ?? 0))
      .slice(0, 4);
  }, [campaigns]);

  if (dashboardQuery.isLoading) {
    return <AdminPageSkeleton statCount={4} variant="dashboard" />;
  }

  if (dashboardQuery.isError) {
    return (
      <div className="surface-page min-h-screen flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-lg shadow-sm max-w-md w-full p-8 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">Unable to load dashboard</h2>
            <p className="text-sm text-muted-foreground">
              {dashboardQuery.error?.message || "Something went wrong. Please try again."}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => dashboardQuery.refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-page min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">

        {/* ── Welcome header ────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-lg shadow-sm p-6 md:p-7">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Organizer Workspace
                </p>
                <VerificationStatusBadge status={profile?.verificationStatus} />
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Welcome back, {user?.name?.split(" ")[0] ?? "Organizer"}
              </h1>
              <p className="text-sm text-muted-foreground max-w-lg">
                {stats.totalCampaigns === 0
                  ? "You have no campaigns yet. Create your first campaign to start fundraising."
                  : `You have ${stats.activeCampaigns} active campaign${stats.activeCampaigns !== 1 ? "s" : ""} and ${currency.format(stats.totalRaised)} raised across all campaigns.`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Button
                size="sm"
                onClick={() => navigate(ROUTES.CREATE_CAMPAIGN)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(ROUTES.MY_CAMPAIGNS)}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                My Campaigns
              </Button>
            </div>
          </div>
        </div>

        {/* ── Stat cards ────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Raised"
            value={currency.format(stats.totalRaised)}
            subtitle="Across all campaigns"
            icon={DollarSign}
            accent="green"
          />
          <StatCard
            title="Active Campaigns"
            value={stats.activeCampaigns}
            subtitle="Currently accepting donations"
            icon={TrendingUp}
            accent="blue"
          />
          <StatCard
            title="Total Campaigns"
            value={stats.totalCampaigns}
            subtitle="All campaigns you own"
            icon={BarChart3}
            accent="amber"
          />
          <StatCard
            title="Pending Withdrawals"
            value={stats.pendingWithdrawals}
            subtitle="Awaiting admin review"
            icon={Wallet}
            accent={stats.pendingWithdrawals > 0 ? "red" : "blue"}
          />
        </section>

        {/* ── Campaign progress ─────────────────────────────────────────── */}
        <section>
          <Card className="surface-card shadow-sm">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                Campaign Progress
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Goal completion across your top campaigns.
              </p>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {campaigns.length === 0 ? (
                <EmptyState
                  icon={Target}
                  message="No campaigns yet. Create your first campaign to start tracking progress."
                  action={
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => navigate(ROUTES.CREATE_CAMPAIGN)}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Campaign
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-5 divide-y divide-border">
                  {topCampaigns.map((campaign, i) => (
                    <div key={campaign._id} className={i > 0 ? "pt-5" : ""}>
                      <CampaignProgressRow campaign={campaign} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ── Two-column: verification + recent campaigns ───────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Verification & payout readiness */}
          <Card className="surface-card shadow-sm">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                Verification & Payout Readiness
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Keep your KYC profile up to date to unlock withdrawal payouts.
              </p>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Profile status</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {profile?.verificationStatus === "verified"
                      ? "Your profile is verified. Withdrawals are enabled."
                      : profile?.verificationStatus === "pending"
                      ? "Your profile is under review. Withdrawals are paused."
                      : profile?.verificationStatus === "rejected"
                      ? "Your profile was rejected. Please update and resubmit."
                      : "Submit your organizer profile to enable withdrawals."}
                  </p>
                </div>
                <VerificationStatusBadge status={profile?.verificationStatus} />
              </div>
              {profile?.verificationStatus !== "verified" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(ROUTES.ORGANIZER_PROFILE)}
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  {profile?.verificationStatus === "pending"
                    ? "View Organizer Profile"
                    : "Complete Organizer Profile"}
                </Button>
              )}
              {stats.pendingWithdrawals > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-chart-4/10 border border-chart-4/20 px-3 py-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-chart-4 animate-pulse shrink-0" />
                  <p className="text-xs text-chart-4 font-medium">
                    {stats.pendingWithdrawals} withdrawal{stats.pendingWithdrawals !== 1 ? "s" : ""} pending review
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent campaigns list */}
          <Card className="surface-card shadow-sm">
            <CardHeader className="pb-3 px-5 pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    Recent Campaigns
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Latest updates across your campaigns.
                  </p>
                </div>
                {campaigns.length > 0 && (
                  <Link
                    to={ROUTES.MY_CAMPAIGNS}
                    className="text-xs font-medium text-chart-2 hover:text-foreground transition-colors flex items-center gap-0.5 shrink-0"
                  >
                    View all <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {campaigns.length === 0 ? (
                <EmptyState
                  icon={BarChart3}
                  message="No campaigns to show. Start by creating your first campaign."
                />
              ) : (
                <div className="space-y-2">
                  {campaigns.slice(0, 5).map((campaign) => (
                    <div
                      key={campaign._id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5 hover:bg-accent/30 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {campaign.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {currency.format(Number(campaign.raised ?? 0))} raised
                        </p>
                      </div>
                      <StatusBadge status={campaign.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ── Quick actions strip ───────────────────────────────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickActionCard
            to={ROUTES.MY_CAMPAIGNS}
            icon={BarChart3}
            title="Campaign Operations"
            description="Edit, track, and manage all active and historical campaigns"
            accent="blue"
          />
          <QuickActionCard
            to={ROUTES.NOTIFICATIONS}
            icon={Bell}
            title="Notifications"
            description="Review verification and withdrawal status updates in real time"
            accent="amber"
          />
          <QuickActionCard
            to={ROUTES.ORGANIZER_PROFILE}
            icon={DollarSign}
            title="Payout Readiness"
            description="Keep your KYC and banking profile updated for smooth payouts"
            accent="green"
          />
        </section>

      </div>
    </div>
  );
}
