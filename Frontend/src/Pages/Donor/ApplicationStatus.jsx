import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "@/Context/AuthContext";
import ROUTES from "@/routes/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FundraisingButton } from "@/components/ui/fundraising-button";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : "/api";

function statusBadgeClass(status) {
  if (status === "approved") return "bg-emerald-100 text-emerald-800";
  if (status === "rejected" || status === "revoked")
    return "bg-red-100 text-red-800";
  if (status === "pending") return "bg-amber-100 text-amber-800";
  return "bg-slate-100 text-slate-800";
}

export default function ApplicationStatus() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const statusQuery = useQuery({
    queryKey: ["organizerApplicationStatus"],
    enabled: Boolean(user?.role === "donor"),
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/organizer/application-status`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to load application status.");
      }

      return res.json();
    },
    refetchInterval: (query) => {
      const currentStatus = query.state.data?.application?.status;
      return currentStatus === "pending" ? 15000 : false;
    },
    refetchOnWindowFocus: true,
  });

  if (statusQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" />
      </div>
    );
  }

  if (statusQuery.isError) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Organizer Application Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-600">{statusQuery.error.message}</p>
            <FundraisingButton
              variant="trust"
              onClick={() => statusQuery.refetch()}
            >
              Retry
            </FundraisingButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = statusQuery.data;
  const application = data?.application;

  if (!data?.hasApplication || !application) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Organizer Application Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700">
              You have not submitted an organizer application yet.
            </p>
            <FundraisingButton
              variant="donate"
              onClick={() => navigate(ROUTES.APPLY_ORGANIZER)}
            >
              Start Application
            </FundraisingButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canResubmit = data?.canResubmit === true;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-4">
            <span>Organizer Application Status</span>
            <Badge className={statusBadgeClass(application.status)}>
              {(application.status || "unknown").toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-slate-500">Organization</p>
            <p className="font-medium text-slate-900">
              {application.organizationName}
            </p>
          </div>

          {application.rejectionReason && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800 font-medium">Review Reason</p>
              <p className="text-red-700 mt-1 whitespace-pre-wrap">
                {application.rejectionReason}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {canResubmit && (
              <FundraisingButton
                variant="trust"
                onClick={() =>
                  navigate(
                    `${ROUTES.APPLY_ORGANIZER}?resubmit=${application._id}`,
                  )
                }
              >
                Resubmit Application
              </FundraisingButton>
            )}

            <FundraisingButton
              variant="warm"
              onClick={() => statusQuery.refetch()}
            >
              Refresh
            </FundraisingButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
