import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "@/Context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ROUTES from "@/routes/routes";
import { NOTIFICATION_QUERY_KEYS } from "@/hooks/useUnreadNotificationCount";
import { EmptyState } from "@/components/admin/AdminUtils";
import { Bell, CheckCheck, Loader2, RefreshCw, AlertTriangle } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : "/api";

// ─── NotificationCard ─────────────────────────────────────────────────────────

function NotificationCard({ item, onMarkRead, isPending }) {
  const isUnread = !item.readAt;
  return (
    <div
      className={[
        "relative rounded-lg border bg-card px-4 py-3.5 transition-colors hover:bg-accent/20",
        isUnread
          ? "border-primary/30 shadow-sm"
          : "border-border",
      ].join(" ")}
    >
      {isUnread && (
        <span className="absolute right-3 top-3.5 h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
      )}
      <div className="flex items-start justify-between gap-4 pr-4">
        <div className="min-w-0 flex-1 space-y-1">
          <p className={`text-sm font-semibold ${isUnread ? "text-foreground" : "text-muted-foreground"}`}>
            {item.title}
          </p>
          <p className="text-sm text-muted-foreground">{item.message}</p>
          <p className="text-xs text-muted-foreground/60">
            {new Date(item.createdAt).toLocaleString()}
          </p>
        </div>
        {isUnread && (
          <Button
            size="sm"
            variant="ghost"
            className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => onMarkRead(item._id)}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5" />
            )}
            <span className="ml-1 hidden sm:inline">Mark read</span>
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Notifications() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.list,
    enabled: Boolean(user),
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/notifications/me?limit=30`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "Failed to fetch notifications");
      return data;
    },
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });

  const markReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      const res = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "Failed to mark notification as read");
      return data;
    },
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_QUERY_KEYS.list });
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_QUERY_KEYS.unreadCount });

      const previousListData = queryClient.getQueryData(NOTIFICATION_QUERY_KEYS.list);
      const previousUnreadCount = queryClient.getQueryData(NOTIFICATION_QUERY_KEYS.unreadCount);

      const wasUnread =
        previousListData?.notifications?.find((item) => item._id === notificationId)?.readAt == null;

      if (previousListData?.notifications) {
        queryClient.setQueryData(NOTIFICATION_QUERY_KEYS.list, (current = {}) => {
          const notifications = Array.isArray(current.notifications) ? current.notifications : [];
          return {
            ...current,
            notifications: notifications.map((item) =>
              item._id !== notificationId || item.readAt
                ? item
                : { ...item, readAt: new Date().toISOString() },
            ),
            unreadCount: Math.max(0, Number(current.unreadCount ?? 0) - (wasUnread ? 1 : 0)),
          };
        });
      }

      if (wasUnread) {
        queryClient.setQueryData(
          NOTIFICATION_QUERY_KEYS.unreadCount,
          (count = 0) => Math.max(0, Number(count ?? 0) - 1),
        );
      }

      return { previousListData, previousUnreadCount };
    },
    onError: (_error, _id, context) => {
      if (context?.previousListData) {
        queryClient.setQueryData(NOTIFICATION_QUERY_KEYS.list, context.previousListData);
      }
      if (typeof context?.previousUnreadCount !== "undefined") {
        queryClient.setQueryData(NOTIFICATION_QUERY_KEYS.unreadCount, context.previousUnreadCount);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.list });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.unreadCount });
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.NOTIFICATIONS)}`);
    }
  }, [loading, user, navigate]);

  if (!loading && !user) return null;

  // Loading state
  if (loading || notificationsQuery.isLoading) {
    return (
      <div className="surface-page min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-border border-t-foreground animate-spin" />
          <p className="text-sm text-muted-foreground">Loading notifications…</p>
        </div>
      </div>
    );
  }

  // Error state
  if (notificationsQuery.isError) {
    return (
      <div className="surface-page min-h-screen flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-lg shadow-sm max-w-md w-full p-8 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Unable to load notifications</h2>
          <p className="text-sm text-muted-foreground">{notificationsQuery.error.message}</p>
          <Button variant="outline" size="sm" onClick={() => notificationsQuery.refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;
  const notifications = notificationsQuery.data?.notifications ?? [];

  return (
    <div className="surface-page min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Inbox
            </p>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-primary">{unreadCount}</span> unread
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => notificationsQuery.refetch()}
            disabled={notificationsQuery.isFetching}
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-2 ${notificationsQuery.isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* List */}
        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You're all caught up. New notifications will appear here."
          />
        ) : (
          <div className="space-y-2">
            {notifications.map((item) => (
              <NotificationCard
                key={item._id}
                item={item}
                onMarkRead={(id) => markReadMutation.mutate(id)}
                isPending={markReadMutation.isPending && markReadMutation.variables === item._id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
