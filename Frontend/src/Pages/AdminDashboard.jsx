import { useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "@/Context/AuthContext";
import ROUTES from "@/routes/routes";
import { adminQueryKeys, getAdminDashboardStats } from "@/services/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminPageSkeleton } from "@/components/admin/AdminSkeletons";
import {
  Users,
  HandCoins,
  FolderKanban,
  ArrowDownCircle,
  UserCheck,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  ClipboardList,
  Shield,
  Activity,
  TrendingUp,
} from "lucide-react";

// ─── Formatters ─────────────────────────────────────────────────────────────

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat("en-US");

// ─── Accent colour map ───────────────────────────────────────────────────────
// Maps a semantic name to Tailwind classes derived from CSS design tokens.
// green = primary | blue = chart-2 | amber = chart-4 | red = destructive

const ACCENT = {
  green: {
    bar: "bg-primary",
    icon: "bg-primary/15 text-primary-foreground",
    iconText: "text-primary",
  },
  blue: {
    bar: "bg-chart-2",
    icon: "bg-chart-2/10 text-chart-2",
    iconText: "text-chart-2",
  },
  amber: {
    bar: "bg-chart-4",
    icon: "bg-chart-4/10 text-chart-4",
    iconText: "text-chart-4",
  },
  red: {
    bar: "bg-destructive",
    icon: "bg-destructive/10 text-destructive",
    iconText: "text-destructive",
  },
};

// ─── StatCard ────────────────────────────────────────────────────────────────

function StatCard({ title, value, subtitle, icon: Icon, accent = "blue", urgent }) {
  const a = ACCENT[accent] ?? ACCENT.blue;
  return (
    <div className="relative bg-card border border-border rounded-lg shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md">
      {/* top accent strip */}
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
            <p className="mt-1.5 text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${a.icon}`}
        >
          <Icon className={`h-4 w-4 ${a.iconText}`} />
        </div>
      </div>
      {urgent && urgent > 0 ? (
        <div className="px-5 pb-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
            <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
            {urgent} need attention
          </span>
        </div>
      ) : null}
    </div>
  );
}

// ─── QuickActionCard ─────────────────────────────────────────────────────────

function QuickActionCard({ to, icon: Icon, title, description, accent = "blue" }) {
  const a = ACCENT[accent] ?? ACCENT.blue;
  return (
    <Link to={to} className="group block">
      <div className="h-full bg-card border border-border rounded-lg p-4 transition-all hover:border-ring/40 hover:shadow-sm hover:bg-accent/30 flex flex-col gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${a.icon}`}>
          <Icon className={`h-4 w-4 ${a.iconText}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{description}</p>
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          Open <ArrowRight className="h-3 w-3" />
        </div>
      </div>
    </Link>
  );
}

// ─── ApprovalQueueRow ─────────────────────────────────────────────────────────

function ApprovalQueueRow({ label, count, description, to, urgent }) {
  return (
    <Link to={to} className="group block">
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 transition-colors hover:bg-accent/40">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-2 text-xs font-bold ${
              urgent && count > 0
                ? "bg-destructive/10 text-destructive"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {count}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </div>
    </Link>
  );
}

// ─── PlatformHealthTile ───────────────────────────────────────────────────────

function PlatformHealthTile({ label, value, sub }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="mt-1 text-lg font-bold text-foreground">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate(`${ROUTES.LOGIN}?redirect=${ROUTES.ADMIN_DASHBOARD}`);
      } else if (user.role !== "admin") {
        navigate(ROUTES.HOME);
      }
    }
  }, [loading, navigate, user]);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: adminQueryKeys.dashboardStats,
    queryFn: () => getAdminDashboardStats(),
    enabled: Boolean(user && user.role === "admin"),
  });

  if (loading || isLoading) {
    return <AdminPageSkeleton statCount={5} variant="dashboard" />;
  }

  if (isError) {
    return (
      <div className="surface-page min-h-screen flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-lg shadow-sm max-w-md w-full p-8 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">Unable to load dashboard</h2>
            <p className="text-sm text-muted-foreground">
              {error?.message || "Something went wrong. Please try again."}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const totalUsers = data?.users?.total ?? 0;
  const totalDonors = data?.users?.donors ?? 0;
  const totalOrganizers = data?.users?.organizers ?? 0;
  const donationCount = data?.donations?.count ?? 0;
  const donationAmount = data?.donations?.totalAmount ?? 0;
  const totalCampaigns = data?.campaigns?.total ?? 0;
  const activeCampaigns = data?.campaigns?.active ?? 0;
  const pendingWithdrawals = data?.withdrawals?.pending ?? 0;
  const totalWithdrawn = data?.withdrawals?.totalWithdrawn ?? 0;
  const pendingApplications = data?.applications?.pending ?? 0;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="surface-page min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">

        {/* ── Page header ───────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Admin · Platform Overview
            </p>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Operations Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">{today}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={isFetching}
            onClick={() => refetch()}
            className="shrink-0 self-start"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* ── Stat cards ────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatCard
            title="Total Users"
            value={number.format(totalUsers)}
            subtitle={`${number.format(totalDonors)} donors · ${number.format(totalOrganizers)} organizers`}
            icon={Users}
            accent="blue"
          />
          <StatCard
            title="Completed Donations"
            value={number.format(donationCount)}
            subtitle={currency.format(donationAmount) + " total"}
            icon={HandCoins}
            accent="green"
          />
          <StatCard
            title="Campaigns"
            value={number.format(totalCampaigns)}
            subtitle={`${number.format(activeCampaigns)} active`}
            icon={FolderKanban}
            accent="amber"
          />
          <StatCard
            title="Pending Withdrawals"
            value={number.format(pendingWithdrawals)}
            subtitle={`${currency.format(totalWithdrawn)} withdrawn total`}
            icon={ArrowDownCircle}
            accent="red"
            urgent={pendingWithdrawals}
          />
          <StatCard
            title="Pending Applications"
            value={number.format(pendingApplications)}
            subtitle="Organizer onboarding queue"
            icon={UserCheck}
            accent="blue"
            urgent={pendingApplications}
          />
        </section>

        {/* ── Two-column middle section ─────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Approval Queue */}
          <Card className="surface-card shadow-sm">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                Approval Queue
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Items requiring your review right now.
              </p>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-2.5">
              <ApprovalQueueRow
                label="Organizer Applications"
                description="New applicants waiting for approval or rejection"
                count={pendingApplications}
                to={ROUTES.ADMIN_APPLICATIONS}
                urgent
              />
              <ApprovalQueueRow
                label="Withdrawal Requests"
                description="Payouts pending release to organizers"
                count={pendingWithdrawals}
                to={ROUTES.ADMIN_WITHDRAWALS}
                urgent
              />
              <ApprovalQueueRow
                label="Organizer Profiles"
                description="KYC verification documents awaiting review"
                count={totalOrganizers}
                to={ROUTES.ADMIN_ORGANIZER_PROFILES}
              />
            </CardContent>
          </Card>

          {/* Platform Health */}
          <Card className="surface-card shadow-sm">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                Platform Health
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Key metrics summarised at a glance.
              </p>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="grid grid-cols-2 gap-3">
                <PlatformHealthTile
                  label="Total Donors"
                  value={number.format(totalDonors)}
                  sub="Registered donor accounts"
                />
                <PlatformHealthTile
                  label="Organizers"
                  value={number.format(totalOrganizers)}
                  sub="Approved organizer accounts"
                />
                <PlatformHealthTile
                  label="Active Campaigns"
                  value={number.format(activeCampaigns)}
                  sub={`of ${number.format(totalCampaigns)} total`}
                />
                <PlatformHealthTile
                  label="Funds Disbursed"
                  value={currency.format(totalWithdrawn)}
                  sub="Total paid out to organizers"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Quick actions ─────────────────────────────────────────────── */}
        <section>
          <Card className="surface-card shadow-sm">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Quick Actions
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Jump directly to any management area.
              </p>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <QuickActionCard
                  to={ROUTES.ADMIN_APPLICATIONS}
                  icon={UserCheck}
                  title="Applications"
                  description="Review and action organizer onboarding requests"
                  accent="blue"
                />
                <QuickActionCard
                  to={ROUTES.ADMIN_CAMPAIGNS}
                  icon={FolderKanban}
                  title="Campaigns"
                  description="Moderate active and pending fundraising campaigns"
                  accent="amber"
                />
                <QuickActionCard
                  to={ROUTES.ADMIN_WITHDRAWALS}
                  icon={ArrowDownCircle}
                  title="Withdrawals"
                  description="Approve or reject organizer payout requests"
                  accent="red"
                />
                <QuickActionCard
                  to={ROUTES.ADMIN_USERS}
                  icon={Users}
                  title="Users"
                  description="Manage roles, status, and donor accounts"
                  accent="blue"
                />
                <QuickActionCard
                  to={ROUTES.ADMIN_ACTIVITIES}
                  icon={Activity}
                  title="Activity Log"
                  description="Audit trail of all platform actions and events"
                  accent="green"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Secondary management row ──────────────────────────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to={ROUTES.ADMIN_DONATIONS} className="group block">
            <div className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3.5 transition-all hover:border-ring/40 hover:shadow-sm hover:bg-accent/30">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-chart-2/10">
                <HandCoins className="h-4 w-4 text-chart-2" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">Donation Tracking</p>
                <p className="text-xs text-muted-foreground truncate">All donations and payment records</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </div>
          </Link>
          <Link to={ROUTES.ADMIN_ORGANIZER_PROFILES} className="group block">
            <div className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3.5 transition-all hover:border-ring/40 hover:shadow-sm hover:bg-accent/30">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">Organizer Profiles</p>
                <p className="text-xs text-muted-foreground truncate">KYC and payout configuration</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </div>
          </Link>
          <Link to={ROUTES.ADMIN_USERS} className="group block">
            <div className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3.5 transition-all hover:border-ring/40 hover:shadow-sm hover:bg-accent/30">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-chart-2/10">
                <ClipboardList className="h-4 w-4 text-chart-2" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">User Management</p>
                <p className="text-xs text-muted-foreground truncate">Roles, status, and access control</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </div>
          </Link>
        </section>

      </div>
    </div>
  );
}
