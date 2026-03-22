import { useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "@/Context/AuthContext";
import ROUTES from "@/routes/routes";
import { adminQueryKeys, getAdminDashboardStats } from "@/services/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  HandCoins,
  FolderKanban,
  ArrowDownCircle,
  UserCheck,
  Loader2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const number = new Intl.NumberFormat("en-US");

function StatCard({ title, value, subtitle, icon: Icon, tone }) {
  const toneMap = {
    blue: "from-cyan-500 to-blue-600",
    emerald: "from-emerald-500 to-green-600",
    orange: "from-amber-500 to-orange-600",
    rose: "from-rose-500 to-red-600",
    violet: "from-indigo-500 to-violet-600",
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          </div>
          <div
            className={`h-10 w-10 rounded-xl bg-gradient-to-br ${toneMap[tone]} text-white flex items-center justify-center`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-lg w-full border-0 shadow-lg">
          <CardContent className="p-8 text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Unable to load admin stats
            </h1>
            <p className="text-slate-600">
              {error?.message || "Please try again."}
            </p>
            <Button onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#dbeafe_0%,_#f8fafc_45%,_#fef9c3_100%)] py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Badge className="bg-slate-900 text-white mb-3">
              Admin Command Center
            </Badge>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Platform health at a glance
            </h1>
            <p className="text-slate-600 mt-2">
              Monitor users, donations, campaigns, applications, and payouts in
              one place.
            </p>
          </div>
          <Button
            variant="outline"
            disabled={isFetching}
            onClick={() => refetch()}
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Refresh Stats
          </Button>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total Users"
            value={number.format(data?.users?.total || 0)}
            subtitle={`${number.format(data?.users?.donors || 0)} donors | ${number.format(data?.users?.organizers || 0)} organizers`}
            icon={Users}
            tone="blue"
          />
          <StatCard
            title="Completed Donations"
            value={number.format(data?.donations?.count || 0)}
            subtitle={currency.format(data?.donations?.totalAmount || 0)}
            icon={HandCoins}
            tone="emerald"
          />
          <StatCard
            title="Campaigns"
            value={number.format(data?.campaigns?.total || 0)}
            subtitle={`${number.format(data?.campaigns?.active || 0)} active`}
            icon={FolderKanban}
            tone="orange"
          />
          <StatCard
            title="Pending Withdrawals"
            value={number.format(data?.withdrawals?.pending || 0)}
            subtitle={`Total withdrawn: ${currency.format(data?.withdrawals?.totalWithdrawn || 0)}`}
            icon={ArrowDownCircle}
            tone="rose"
          />
          <StatCard
            title="Pending Applications"
            value={number.format(data?.applications?.pending || 0)}
            subtitle="Organizer onboarding queue"
            icon={UserCheck}
            tone="violet"
          />
        </section>

        <section>
          <Card className="border-0 shadow-lg bg-white/85">
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <Link to={ROUTES.ADMIN_APPLICATIONS}>
                <Button className="w-full justify-between" variant="secondary">
                  Review Applications
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to={ROUTES.ADMIN_CAMPAIGNS}>
                <Button className="w-full justify-between" variant="secondary">
                  Campaign Moderation
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to={ROUTES.ADMIN_WITHDRAWALS}>
                <Button className="w-full justify-between" variant="secondary">
                  Manage Withdrawals
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to={ROUTES.ADMIN_USERS}>
                <Button className="w-full justify-between" variant="secondary">
                  User Management
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to={ROUTES.ADMIN_DONATIONS}>
                <Button className="w-full justify-between" variant="secondary">
                  Donation Tracking
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
