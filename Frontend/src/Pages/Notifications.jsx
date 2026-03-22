import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "@/Context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ROUTES from "@/routes/routes";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : "/api";

export default function Notifications() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ["notifications", "me"],
    enabled: Boolean(user),
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/notifications/me?limit=30`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch notifications");
      }
      return data;
    },
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const markReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      const res = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to mark notification as read");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "me"] });
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate(
        `${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.NOTIFICATIONS)}`,
      );
    }
  }, [loading, user, navigate]);

  if (!loading && !user) {
    return null;
  }

  if (loading || notificationsQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" />
      </div>
    );
  }

  if (notificationsQuery.isError) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-red-600">{notificationsQuery.error.message}</p>
            <Button onClick={() => notificationsQuery.refetch()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const unreadCount = notificationsQuery.data?.unreadCount || 0;
  const notifications = notificationsQuery.data?.notifications || [];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Notifications</span>
            <Badge className="bg-blue-100 text-blue-800">
              Unread: {unreadCount}
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-slate-600">
              You have no notifications yet.
            </CardContent>
          </Card>
        ) : (
          notifications.map((item) => {
            const isUnread = !item.readAt;
            return (
              <Card
                key={item._id}
                className={isUnread ? "border-blue-300" : ""}
              >
                <CardContent className="py-4 space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    {isUnread ? (
                      <Badge className="bg-blue-600 text-white">New</Badge>
                    ) : (
                      <Badge variant="outline">Read</Badge>
                    )}
                  </div>

                  <p className="text-slate-700">{item.message}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>

                  {isUnread && (
                    <div>
                      <Button
                        size="sm"
                        onClick={() => markReadMutation.mutate(item._id)}
                        disabled={markReadMutation.isPending}
                      >
                        Mark as read
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
