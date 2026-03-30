import { useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "@/Context/AuthContext";
import ROUTES from "@/routes/routes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Clock3,
  DollarSign,
  PlusCircle,
  ShieldCheck,
  Wallet,
} from "lucide-react";

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

  if (!campaignsRes.ok) {
    throw new Error("Failed to load organizer campaigns");
  }

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

function getProfileBadgeClass(status) {
  if (status === "verified") return "bg-emerald-100 text-emerald-800";
  if (status === "pending") return "bg-amber-100 text-amber-800";
  if (status === "rejected") return "bg-red-100 text-red-800";
  return "bg-slate-100 text-slate-800";
}

export default function OrganizerDashboard() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const dashboardQuery = useQuery({
    queryKey: ["organizerDashboard", user?.userId],
    enabled: Boolean(token && user?.role === "organizer"),
    queryFn: () => fetchOrganizerDashboard(token, user.userId),
    refetchInterval: 30000,
  });

  const campaigns = dashboardQuery.data?.campaigns || [];
  const withdrawals = dashboardQuery.data?.withdrawals || [];
  const profile = dashboardQuery.data?.profile || {
    hasProfile: false,
    verificationStatus: null,
  };

  const stats = useMemo(() => {
    const totalRaised = campaigns.reduce(
      (sum, campaign) => sum + Number(campaign?.raised || 0),
      0,
    );
    const activeCampaigns = campaigns.filter(
      (campaign) => campaign?.status === "active",
    ).length;
    const pendingWithdrawals = withdrawals.filter(
      (item) => item?.status === "pending" || item?.status === "under_review",
    ).length;

    return {
      totalCampaigns: campaigns.length,
      totalRaised,
      activeCampaigns,
      pendingWithdrawals,
    };
  }, [campaigns, withdrawals]);

  if (dashboardQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" />
      </div>
    );
  }

  if (dashboardQuery.isError) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Organizer Dashboard</CardTitle>
            <CardDescription>
              We could not load your dashboard right now.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-600">{dashboardQuery.error.message}</p>
            <FundraisingButton
              variant="trust"
              onClick={() => dashboardQuery.refetch()}
            >
              Retry
            </FundraisingButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="surface-page min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-secondary">
                Organizer Workspace
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-1">
                Welcome back, {user?.name}
              </h1>
              <p className="text-slate-600 mt-2">
                Manage campaigns, monitor funding, and handle withdrawals from
                one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => navigate(ROUTES.CREATE_CAMPAIGN)}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
              <Button
                className="bg-secondary hover:bg-secondary/90"
                onClick={() => navigate(ROUTES.MY_CAMPAIGNS)}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Manage Campaigns
              </Button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="surface-card">
            <CardHeader className="pb-2">
              <CardDescription>Total Campaigns</CardDescription>
              <CardTitle className="text-3xl">{stats.totalCampaigns}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">All campaigns you own</p>
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader className="pb-2">
              <CardDescription>Active Campaigns</CardDescription>
              <CardTitle className="text-3xl">
                {stats.activeCampaigns}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">
                Currently accepting donations
              </p>
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader className="pb-2">
              <CardDescription>Total Raised</CardDescription>
              <CardTitle className="text-3xl">
                ${stats.totalRaised.toFixed(2)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">
                Across all your campaigns
              </p>
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader className="pb-2">
              <CardDescription>Pending Withdrawals</CardDescription>
              <CardTitle className="text-3xl">
                {stats.pendingWithdrawals}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">Awaiting admin review</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-700" />
                Verification Status
              </CardTitle>
              <CardDescription>
                Complete organizer profile verification to unlock withdrawals.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-slate-700">Profile status</p>
                <Badge
                  className={getProfileBadgeClass(profile?.verificationStatus)}
                >
                  {(
                    profile?.verificationStatus || "not_submitted"
                  ).toUpperCase()}
                </Badge>
              </div>
              <Button
                className="bg-secondary hover:bg-secondary/90"
                onClick={() => navigate(ROUTES.ORGANIZER_PROFILE)}
              >
                <ShieldCheck className="h-4 w-4 mr-2" />
                Open Organizer Profile
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-cyan-700" />
                Latest Campaigns
              </CardTitle>
              <CardDescription>
                Snapshot of your most recently updated campaigns.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-600">
                  No campaigns yet. Start by creating your first campaign.
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.slice(0, 4).map((campaign) => (
                    <div
                      key={campaign._id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {campaign.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          ${Number(campaign.raised || 0).toFixed(2)} raised
                        </p>
                      </div>
                      <Badge className="bg-slate-100 text-slate-800">
                        {(campaign.status || "active").toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to={ROUTES.MY_CAMPAIGNS}>
            <Card className="h-full bg-white/90 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5 text-blue-700" />
                  Campaign Operations
                </CardTitle>
                <CardDescription>
                  Edit, track, and manage all active and historical campaigns.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to={ROUTES.NOTIFICATIONS}>
            <Card className="h-full bg-white/90 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock3 className="h-5 w-5 text-amber-700" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Review verification and withdrawal status updates in real
                  time.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to={ROUTES.ORGANIZER_PROFILE}>
            <Card className="h-full bg-white/90 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5 text-emerald-700" />
                  Payout Readiness
                </CardTitle>
                <CardDescription>
                  Keep your KYC and banking profile updated for smooth payouts.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </section>
      </div>
    </div>
  );
}
