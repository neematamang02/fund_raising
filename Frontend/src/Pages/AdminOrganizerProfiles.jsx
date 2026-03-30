import { useContext, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/Context/AuthContext";
import ROUTES from "@/routes/routes";
import {
  adminQueryKeys,
  getAdminOrganizerProfiles,
  verifyAdminOrganizerProfile,
} from "@/services/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FundraisingButton } from "@/components/ui/fundraising-button";
import { AdminPageSkeleton } from "@/components/admin/AdminSkeletons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, Clock, Search, Shield, XCircle } from "lucide-react";
import { toast } from "sonner";

function statusBadge(status) {
  if (status === "verified") {
    return (
      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Verified
      </Badge>
    );
  }
  if (status === "rejected") {
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200">
        <XCircle className="h-3 w-3 mr-1" />
        Rejected
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-100 text-amber-800 border-amber-200">
      <Clock className="h-3 w-3 mr-1" />
      Pending
    </Badge>
  );
}

export default function AdminOrganizerProfiles() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [decision, setDecision] = useState("verified");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate(`${ROUTES.LOGIN}?redirect=${ROUTES.ADMIN_ORGANIZER_PROFILES}`);
      } else if (user.role !== "admin") {
        navigate(ROUTES.HOME);
      }
    }
  }, [loading, user, navigate]);

  const listQuery = useQuery({
    queryKey: adminQueryKeys.organizerProfiles({
      page,
      status: statusFilter,
      search: searchTerm,
    }),
    enabled: Boolean(user?.role === "admin"),
    queryFn: () =>
      getAdminOrganizerProfiles({
        page,
        status: statusFilter,
        search: searchTerm,
      }),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, verificationStatus, reason }) =>
      verifyAdminOrganizerProfile(id, {
        verificationStatus,
        rejectionReason: reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "organizerProfiles"],
      });
      setVerifyDialogOpen(false);
      setSelectedProfile(null);
      setRejectionReason("");
      toast.success("Organizer profile updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update organizer profile");
    },
  });

  const profiles = listQuery.data?.organizerProfiles || [];
  const pagination = listQuery.data?.pagination;

  const statusCounts = useMemo(() => {
    const counts = { pending: 0, verified: 0, rejected: 0 };
    profiles.forEach((item) => {
      if (item.verificationStatus in counts) {
        counts[item.verificationStatus] += 1;
      }
    });
    return counts;
  }, [profiles]);

  const openDecisionDialog = (profile, defaultDecision) => {
    setSelectedProfile(profile);
    setDecision(defaultDecision);
    setRejectionReason(profile?.rejectionReason || "");
    setVerifyDialogOpen(true);
  };

  const submitDecision = () => {
    if (!selectedProfile) return;
    if (decision === "rejected" && !rejectionReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    verifyMutation.mutate({
      id: selectedProfile._id,
      verificationStatus: decision,
      reason: rejectionReason,
    });
  };

  if (loading || listQuery.isLoading) {
    return <AdminPageSkeleton statCount={4} listCount={4} />;
  }

  if (listQuery.isError) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Organizer Profile Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-600">{listQuery.error.message}</p>
            <FundraisingButton
              variant="trust"
              onClick={() => listQuery.refetch()}
            >
              Retry
            </FundraisingButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <Badge className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-2 text-sm font-medium mb-5">
            <Shield className="h-4 w-4 mr-2" />
            Admin Verification
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900">
            Organizer Profile Reviews
          </h1>
          <p className="text-gray-600 mt-2">
            Review KYC and bank profile submissions before enabling withdrawals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-amber-600">
                {statusCounts.pending}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Verified</p>
              <p className="text-2xl font-bold text-emerald-600">
                {statusCounts.verified}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {statusCounts.rejected}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Visible Rows</p>
              <p className="text-2xl font-bold text-slate-700">
                {profiles.length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm text-gray-600">Search</Label>
              <div className="relative mt-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-9"
                  placeholder="Name, email, or legal name"
                  value={searchTerm}
                  onChange={(e) => {
                    setPage(1);
                    setSearchTerm(e.target.value);
                  }}
                />
              </div>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setPage(1);
                  setStatusFilter(value);
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <FundraisingButton
                variant="warm"
                onClick={() => listQuery.refetch()}
              >
                Refresh
              </FundraisingButton>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {profiles.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center text-slate-600">
                No organizer profiles found for the selected filters.
              </CardContent>
            </Card>
          ) : (
            profiles.map((profile) => (
              <Card key={profile._id} className="bg-white/90">
                <CardContent className="p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">
                        {profile.organizerUser?.name || "Unknown organizer"}
                      </p>
                      <p className="text-sm text-slate-600">
                        {profile.organizerUser?.email || "No email"}
                      </p>
                    </div>
                    {statusBadge(profile.verificationStatus)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Full Legal Name</p>
                      <p className="font-medium text-slate-800">
                        {profile.kycInfo?.fullLegalName || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Bank</p>
                      <p className="font-medium text-slate-800">
                        {profile.bankDetails?.bankName || "-"} (
                        {profile.bankDetails?.accountType || "-"})
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Account Last 4</p>
                      <p className="font-medium text-slate-800">
                        {profile.bankDetails?.accountNumberLast4 || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Submitted</p>
                      <p className="font-medium text-slate-800">
                        {new Date(profile.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {profile.rejectionReason && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 whitespace-pre-wrap">
                      {profile.rejectionReason}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <FundraisingButton
                      variant="trust"
                      onClick={() => openDecisionDialog(profile, "verified")}
                      disabled={
                        verifyMutation.isPending ||
                        profile.verificationStatus !== "pending"
                      }
                    >
                      Verify
                    </FundraisingButton>
                    <FundraisingButton
                      variant="destructive"
                      onClick={() => openDecisionDialog(profile, "rejected")}
                      disabled={
                        verifyMutation.isPending ||
                        profile.verificationStatus !== "pending"
                      }
                    >
                      Reject
                    </FundraisingButton>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <FundraisingButton
              variant="ghost-trust"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
            >
              Previous
            </FundraisingButton>
            <Badge>
              {page} / {pagination.pages}
            </Badge>
            <FundraisingButton
              variant="ghost-trust"
              onClick={() =>
                setPage((prev) => Math.min(pagination.pages, prev + 1))
              }
              disabled={page >= pagination.pages}
            >
              Next
            </FundraisingButton>
          </div>
        )}
      </div>

      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Organizer Profile</DialogTitle>
            <DialogDescription>
              Choose whether to verify or reject this organizer profile
              submission.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Label>Decision</Label>
            <Select value={decision} onValueChange={setDecision}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="verified">Verify</SelectItem>
                <SelectItem value="rejected">Reject</SelectItem>
              </SelectContent>
            </Select>

            {decision === "rejected" && (
              <div>
                <Label>Rejection Reason</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why the profile was rejected"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <FundraisingButton
              variant="ghost-trust"
              onClick={() => setVerifyDialogOpen(false)}
            >
              Cancel
            </FundraisingButton>
            <FundraisingButton
              variant={decision === "verified" ? "trust" : "destructive"}
              onClick={submitDecision}
              disabled={verifyMutation.isPending}
            >
              Confirm
            </FundraisingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
