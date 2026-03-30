import { useContext, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/Context/AuthContext";
import ROUTES from "@/routes/routes";
import { adminQueryKeys, getAdminActivities } from "@/services/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AdminPageSkeleton } from "@/components/admin/AdminSkeletons";
import { Loader2, ShieldCheck, UserCircle2 } from "lucide-react";

export default function AdminActivities() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [activityType, setActivityType] = useState("");
  const [userId, setUserId] = useState("");
  const [appliedType, setAppliedType] = useState("");
  const [appliedUserId, setAppliedUserId] = useState("");

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate(`${ROUTES.LOGIN}?redirect=${ROUTES.ADMIN_ACTIVITIES}`);
      } else if (user.role !== "admin") {
        navigate(ROUTES.HOME);
      }
    }
  }, [loading, navigate, user]);

  const params = useMemo(
    () => ({ page, activityType: appliedType, userId: appliedUserId }),
    [appliedType, appliedUserId, page],
  );

  const { data, isLoading, isFetching } = useQuery({
    queryKey: adminQueryKeys.activities(params),
    queryFn: () => getAdminActivities(params),
    enabled: Boolean(user?.role === "admin"),
  });

  const activities = data?.activities || [];
  const totalPages = Number(data?.totalPages || 1);

  const applyFilters = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedType(activityType.trim());
    setAppliedUserId(userId.trim());
  };

  if (loading || isLoading) {
    return <AdminPageSkeleton statCount={0} listCount={5} />;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(120deg,#f8fafc_0%,#eef2ff_45%,#ecfdf5_100%)] px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">
              Activity Logs
            </h1>
            <p className="text-slate-600 mt-1">
              Track platform actions for operations and auditing.
            </p>
          </div>
          <Button
            variant="outline"
            disabled={isFetching}
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ["admin", "activities"],
              })
            }
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Refresh
          </Button>
        </section>

        <Card className="border-0 shadow-lg bg-white/90">
          <CardContent className="pt-6">
            <form className="grid md:grid-cols-3 gap-3" onSubmit={applyFilters}>
              <div>
                <Label htmlFor="activity-type">Activity type</Label>
                <Input
                  id="activity-type"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  placeholder="e.g. profile_updated"
                />
              </div>
              <div>
                <Label htmlFor="activity-user">User ID</Label>
                <Input
                  id="activity-user"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="MongoDB user id"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full md:w-auto">
                  Apply filters
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-3">
          {activities.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-14 text-center text-slate-600">
                No activities found for selected filters.
              </CardContent>
            </Card>
          ) : (
            activities.map((activity) => (
              <Card key={activity._id} className="shadow-sm">
                <CardContent className="py-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-slate-600 flex items-center gap-2">
                        <UserCircle2 className="h-4 w-4" />
                        {activity.user?.name || "Unknown user"} (
                        {activity.user?.email || "N/A"})
                      </p>
                      <p className="text-sm text-slate-700">
                        {activity.description || "No description"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        {activity.activityType || "unknown"}
                      </Badge>
                      {activity.user?.role ? (
                        <Badge variant="outline">{activity.user.role}</Badge>
                      ) : null}
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
