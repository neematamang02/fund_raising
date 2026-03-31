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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AdminPageSkeleton } from "@/components/admin/AdminSkeletons";
import {
  PageHeader,
  RefreshButton,
  StatusBadge,
  EmptyState,
  Pagination,
  FilterCard,
  InfoRow,
} from "@/components/admin/AdminUtils";
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
import {
  CheckCircle,
  Clock,
  Search,
  Shield,
  XCircle,
  AlertTriangle,
  Building2,
  User,
} from "lucide-react";
import { toast } from "sonner";

// ─── Stat tile ────────────────────────────────────────────────────────────────

function StatTile({ label, value, accent }) {
  const map = {
    amber: "text-chart-4",
    green: "text-primary",
    red: "text-destructive",
    muted: "text-muted-foreground",
  };
  return (
    <div className="rounded-lg border border-border bg-card p-4 text-center shadow-sm">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${map[accent] ?? "text-foreground"}`}>{value}</p>
    </div>
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
      if (!user) navigate(`${ROUTES.LOGIN}?redirect=${ROUTES.ADMIN_ORGANIZER_PROFILES}`);
      else if (user.role !== "admin") navigate(ROUTES.HOME);
    }
  }, [loading, user, navigate]);

  const listQuery = useQuery({
    queryKey: adminQueryKeys.organizerProfiles({ page, status: statusFilter, search: searchTerm }),
    enabled: Boolean(user?.role === "admin"),
    queryFn: () => getAdminOrganizerProfiles({ page, status: statusFilter, search: searchTerm }),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, verificationStatus, reason }) =>
      verifyAdminOrganizerProfile(id, { verificationStatus, rejectionReason: reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "organizerProfiles"] });
      setVerifyDialogOpen(false);
      setSelectedProfile(null);
      setRejectionReason("");
      toast.success("Organizer profile updated");
    },
    onError: (error) => toast.error(error.message || "Failed to update organizer profile"),
  });

  const profiles = listQuery.data?.organizerProfiles ?? [];
  const pagination = listQuery.data?.pagination;

  const statusCounts = useMemo(() => {
    const counts = { pending: 0, verified: 0, rejected: 0 };
    profiles.forEach((item) => {
      if (item.verificationStatus in counts) counts[item.verificationStatus]++;
    });
    return counts;
  }, [profiles]);

  const openDecisionDialog = (profile, defaultDecision) => {
    setSelectedProfile(profile);
    setDecision(defaultDecision);
    setRejectionReason(profile?.rejectionReason ?? "");
    setVerifyDialogOpen(true);
  };

  const submitDecision = () => {
    if (!selectedProfile) return;
    if (decision === "rejected" && !rejectionReason.trim()) {
      toast.error("Rejection reason is required"); return;
    }
    verifyMutation.mutate({ id: selectedProfile._id, verificationStatus: decision, reason: rejectionReason });
  };

  if (loading || listQuery.isLoading) return <AdminPageSkeleton statCount={4} listCount={4} variant="list" />;

  if (listQuery.isError) {
    return (
      <div className="surface-page min-h-screen flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-lg shadow-sm max-w-md w-full p-8 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Unable to load profiles</h2>
          <p className="text-sm text-muted-foreground">{listQuery.error.message}</p>
          <Button variant="outline" size="sm" onClick={() => listQuery.refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-page min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">

        <PageHeader
          label="Admin · Verification"
          title="Organizer Profile Reviews"
          description="Review KYC and bank profile submissions before enabling withdrawals."
          action={
            <RefreshButton
              disabled={listQuery.isFetching}
              onClick={() => listQuery.refetch()}
            />
          }
        />

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatTile label="Pending" value={statusCounts.pending} accent="amber" />
          <StatTile label="Verified" value={statusCounts.verified} accent="green" />
          <StatTile label="Rejected" value={statusCounts.rejected} accent="red" />
          <StatTile label="Visible" value={profiles.length} accent="muted" />
        </div>

        {/* Filters */}
        <FilterCard>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Search</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 h-9"
                  placeholder="Name, email, or legal name…"
                  value={searchTerm}
                  onChange={(e) => { setPage(1); setSearchTerm(e.target.value); }}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Status</Label>
              <Select value={statusFilter} onValueChange={(v) => { setPage(1); setStatusFilter(v); }}>
                <SelectTrigger className="mt-1 h-9">
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
          </div>
        </FilterCard>

        {/* Profile list */}
        <div className="space-y-2">
          {profiles.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No profiles found"
              description="Try adjusting the filters."
            />
          ) : (
            profiles.map((profile) => (
              <Card key={profile._id} className="surface-card shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 space-y-4">
                  {/* Header row */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {profile.organizerUser?.name ?? "Unknown organizer"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {profile.organizerUser?.email ?? "No email"}
                      </p>
                    </div>
                    <StatusBadge status={profile.verificationStatus ?? "pending"} />
                  </div>

                  {/* KYC + bank info grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 rounded-lg border border-border bg-muted/20 p-3">
                    <InfoRow label="Legal Name" value={profile.kycInfo?.fullLegalName} />
                    <InfoRow
                      label="Bank"
                      value={profile.bankDetails?.bankName
                        ? `${profile.bankDetails.bankName} (${profile.bankDetails.accountType ?? "—"})`
                        : undefined}
                    />
                    <InfoRow label="Account last 4" value={profile.bankDetails?.accountNumberLast4} />
                    <InfoRow label="Submitted" value={new Date(profile.createdAt).toLocaleDateString()} />
                  </div>

                  {/* Rejection note */}
                  {profile.rejectionReason && (
                    <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive whitespace-pre-wrap">
                      {profile.rejectionReason}
                    </div>
                  )}

                  {/* Actions */}
                  {profile.verificationStatus === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => openDecisionDialog(profile, "verified")}
                        disabled={verifyMutation.isPending}
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-destructive/30 text-destructive hover:bg-destructive/10"
                        onClick={() => openDecisionDialog(profile, "rejected")}
                        disabled={verifyMutation.isPending}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1.5" />
                        Reject
                      </Button>
                    </div>
                  )}
                  {profile.verificationStatus !== "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDecisionDialog(profile, "verified")}
                      disabled={verifyMutation.isPending}
                    >
                      Update decision
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {pagination && pagination.pages > 1 && (
          <Pagination
            page={page}
            totalPages={pagination.pages}
            isFetching={listQuery.isFetching}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(pagination.pages, p + 1))}
          />
        )}
      </div>

      {/* Decision dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Organizer Profile</DialogTitle>
            <DialogDescription>
              Choose whether to verify or reject this organizer profile submission.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Decision</Label>
              <Select value={decision} onValueChange={setDecision}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verified">Verify</SelectItem>
                  <SelectItem value="rejected">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {decision === "rejected" && (
              <div>
                <Label className="text-xs text-muted-foreground">Rejection reason *</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why the profile was rejected…"
                  rows={3}
                  className="mt-1"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setVerifyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant={decision === "rejected" ? "destructive" : "default"}
              className={decision === "verified" ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
              onClick={submitDecision}
              disabled={verifyMutation.isPending}
            >
              {decision === "verified" ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
