import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "@/Context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : "/api";

export const NOTIFICATION_QUERY_KEYS = {
  list: ["notifications", "me"],
  unreadCount: ["notifications", "unread-count"],
};

export function formatUnreadCount(unreadCount) {
  if (unreadCount > 99) return "99+";
  return `${unreadCount}`;
}

export default function useUnreadNotificationCount() {
  const { user } = useContext(AuthContext);

  const query = useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.unreadCount,
    enabled: Boolean(user),
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/notifications/me?limit=1`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        return 0;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch unread notifications");
      }

      return Number(data.unreadCount || 0);
    },
    staleTime: 15000,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  return {
    ...query,
    unreadCount: query.data ?? 0,
  };
}
