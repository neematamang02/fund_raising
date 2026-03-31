import { useContext, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/Context/AuthContext";
import ROUTES from "@/routes/routes";
import { adminQueryKeys, getAdminActivities } from "@/services/adminApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPageSkeleton } from "@/components/admin/AdminSkeletons";
import {
  PageHeader,
  RefreshButton,
  StatusBadge,
  EmptyState,
  Pagination,
  FilterCard,
} from "@/components/admin/AdminUtils";
import { Activity, UserCircle2 } from "lucide-react";

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
      if (!user) navigate(`${ROUTES.LOGIN}?redirect=${ROUTES.ADMIN_ACTIVITIES}`);
      else if (user.role !== "admin") navigate(ROUTES.HOME);
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

  const activities = data?.activities ?? [];
  const totalPages = Number(data?.totalPages ?? 1);

  const applyFilters = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedType(activityType.trim());
    setAppliedUserId(userId.trim());
  };

  if (loading || isLoading) return <AdminPageSkeleton statCount={0} listCount={5} variant="list" />;

  return (
    <div className="surface-page min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">

        <PageHeader
          label="Admin · Audit"
          title="Activity Logs"
          description="Track platform actions for operations and auditing."
          action={
            <RefreshButton
              disabled={isFetching}
              onClick={() => queryClient.invalidateQueries({ queryKey: ["admin", "activities"] })}
            />
          }
        />

        {/* Filters */}
        <FilterCard>
          <form className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3" onSubmit={applyFilters}>
            <div>
              <Label htmlFor="activity-type" className="text-xs font-medium text-muted-foreground">
                Activity type
              </Label>
              <Input
                id="activity-type"
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                placeholder="e.g. profile_updated"
                className="mt-1 h-9"
              />
            </div>
            <div>
              <Label htmlFor="activity-user" className="text-xs font-medium text-muted-foreground">
                User ID
              </Label>
              <Input
                id="activity-user"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="MongoDB user id"
                className="mt-1 h-9"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" size="sm">
                Apply filters
              </Button>
            </div>
          </form>
        </FilterCard>

        {/* Activity list */}
        <div className="space-y-2">
          {activities.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No activities found"
              description={appliedType || appliedUserId ? "No results for the applied filters." : "No platform activity recorded yet."}
            />
          ) : (
            activities.map((activity) => (
              <Card key={activity._id} className="surface-card shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      {/* User */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <UserCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="font-medium text-foreground">
                          {activity.user?.name ?? "Unknown user"}
                        </span>
                        <span className="text-border">·</span>
                        <span>{activity.user?.email ?? "N/A"}</span>
                      </div>
                      {/* Description */}
                      <p className="text-sm text-foreground">
                        {activity.description ?? "No description"}
                      </p>
                      {/* Timestamp */}
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-chart-2/20 bg-chart-2/10 px-2.5 py-0.5 text-[11px] font-semibold text-chart-2">
                        <Activity className="h-3 w-3" />
                        {activity.activityType ?? "unknown"}
                      </span>
                      {activity.user?.role && (
                        <StatusBadge status={activity.user.role} />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

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
