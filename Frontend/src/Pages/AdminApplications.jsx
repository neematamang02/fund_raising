import { useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/Context/AuthContext";
import ROUTES from "@/routes/routes";
import {
  adminQueryKeys,
  approveOrganizerApplication,
  getAdminApplications,
  rejectOrganizerApplication,
  revokeOrganizerApplication,
} from "@/services/adminApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminPageSkeleton } from "@/components/admin/AdminSkeletons";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, StatusBadge, FilterCard, EmptyState } from "@/components/admin/AdminUtils";
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
  Settings,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Globe,
  Calendar,
  FileText,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminApplications() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // Revoke dialog state
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [revokeTargetAppId, setRevokeTargetAppId] = useState(null);
  const [revokeReason, setRevokeReason] = useState("");

  // Redirect non-admins away
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate(ROUTES.LOGIN + "?redirect=" + ROUTES.ADMIN_APPLICATIONS);
      } else if (user.role !== "admin") {
        navigate(ROUTES.HOME);
      }
    }
  }, [user, loading, navigate]);

  // Fetch all organizer applications
  const {
    data: applications = [],
    isLoading: isAppsLoading,
    isError: appsError,
  } = useQuery({
    queryKey: adminQueryKeys.applications,
    queryFn: () => getAdminApplications(),
    enabled: Boolean(user?.role === "admin"),
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (appId) => approveOrganizerApplication(appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.applications });
      toast.success("Application approved successfully! 🎉");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve application");
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ appId, reason }) =>
      rejectOrganizerApplication(appId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.applications });
      setShowRejectDialog(false);
      setRejectionReason("");
      setSelectedApp(null);
      toast.success("Application rejected");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reject application");
    },
  });

  // Revoke mutation
  const revokeMutation = useMutation({
    mutationFn: ({ appId, reason }) =>
      revokeOrganizerApplication(appId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.applications });
      setShowRevokeDialog(false);
      setRevokeReason("");
      setRevokeTargetAppId(null);
      toast.success("Organizer role revoked");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to revoke organizer");
    },
  });

  // Filter applications based on search and status
  const filteredApplications = applications.filter((app) => {
    // Skip applications with missing user data
    if (!app.user) return false;

    const matchesSearch =
      app.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.organizationName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handlers for reject
  const handleReject = (app) => {
    setSelectedApp(app);
    setShowRejectDialog(true);
  };
  const confirmReject = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    rejectMutation.mutate({ appId: selectedApp._id, reason: rejectionReason });
  };

  // Handlers for revoke
  const handleRevoke = (app) => {
    setRevokeTargetAppId(app._id);
    setShowRevokeDialog(true);
  };
  const confirmRevoke = () => {
    if (revokeReason && !revokeReason.trim()) {
      toast.error("Please provide a valid reason or leave it blank");
      return;
    }
    revokeMutation.mutate({ appId: revokeTargetAppId, reason: revokeReason });
  };

  const getStatusBadge = (status) => <StatusBadge status={status} />;

  // Compute status counts
  const getStatusCounts = () => ({
    total: applications.length,
    pending: applications.filter((app) => app.status === "pending").length,
    approved: applications.filter((app) => app.status === "approved").length,
    rejected: applications.filter((app) => app.status === "rejected").length,
    revoked: applications.filter((app) => app.status === "revoked").length,
  });
  const statusCounts = getStatusCounts();

  if (loading || isAppsLoading) {
    return <AdminPageSkeleton statCount={5} listCount={3} />;
  }

  if (appsError) {
    return (
      <div className="surface-page min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Error Loading Applications
          </h2>
          <p className="text-slate-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-page min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader
          label="Admin"
          title="Organizer Applications"
          description="Review and manage organizer applications to maintain platform quality and trust."
        />

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total", value: statusCounts.total, cls: "text-foreground", iconCls: "bg-chart-2/10 text-chart-2", Icon: FileText },
            { label: "Pending", value: statusCounts.pending, cls: "text-chart-4", iconCls: "bg-chart-4/10 text-chart-4", Icon: Clock },
            { label: "Approved", value: statusCounts.approved, cls: "text-primary", iconCls: "bg-primary/10 text-primary", Icon: CheckCircle },
            { label: "Rejected", value: statusCounts.rejected, cls: "text-destructive", iconCls: "bg-destructive/10 text-destructive", Icon: XCircle },
            { label: "Revoked", value: statusCounts.revoked, cls: "text-muted-foreground", iconCls: "bg-muted text-muted-foreground", Icon: XCircle },
          ].map(({ label, value, cls, iconCls, Icon }) => (
            <Card key={label} className="border bg-card">
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${iconCls}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className={`text-2xl font-bold ${cls}`}>{value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <FilterCard>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Search Applications
              </Label>
              <Input
                placeholder="Search by name, email, or organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Filter by Status
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Applications</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </FilterCard>

        {filteredApplications.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Applications Found"
            description={searchTerm || statusFilter !== "all" ? "Try adjusting your search or filter criteria" : "No organizer applications have been submitted yet"}
          />
        ) : (
          <div className="space-y-6">
            {filteredApplications.map((app) => (
              <Card
                key={app._id}
                className="surface-card shadow-sm overflow-hidden"
              >
                <CardHeader className="bg-muted/30 border-b border-border">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl text-foreground mb-2">
                        {app.user?.name || app.user?.email || "Unknown User"}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">
                          {app.organizationName || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(app.status)}
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Contact Information */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4 text-chart-2" />
                        Contact Information
                      </h4>
                      <div className="space-y-2 text-sm text-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {app.contactEmail || app.user?.email || "N/A"}
                          </span>
                        </div>
                        {app.phoneNumber && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{app.phoneNumber}</span>
                          </div>
                        )}
                        {app.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-3 w-3 text-muted-foreground" />
                            <a
                              href={app.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {app.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {app.experience && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          Experience
                        </h4>
                        <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border border-border">
                          {app.experience}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4 text-chart-2" />
                      Organization Description
                    </h4>
                    <div className="bg-chart-2/5 border border-chart-2/20 rounded-xl p-4">
                      <p className="text-foreground leading-relaxed">
                        {app.description}
                      </p>
                    </div>
                  </div>

                  {/* Verification Documents */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4 text-chart-2" />
                      Verification Documents
                    </h4>

                    {app.documents ? (
                      <div className="grid gap-4 md:grid-cols-3">
                        {/* Government ID */}
                        {app.documents.governmentId?.url && (
                          <div className="border border-border rounded-lg p-3 bg-muted/30">
                            <div className="text-sm font-medium text-foreground mb-2">
                              Government ID
                            </div>
                            {/\.(png|jpe?g|gif|webp)$/i.test(
                              app.documents.governmentId.url,
                            ) ? (
                              <a
                                href={app.documents.governmentId.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={app.documents.governmentId.url}
                                  alt="Government ID"
                                  className="w-full h-40 object-cover rounded"
                                />
                              </a>
                            ) : (
                              <a
                                href={app.documents.governmentId.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline break-all"
                              >
                                View file
                              </a>
                            )}
                          </div>
                        )}

                        {/* Selfie with ID */}
                        {app.documents.selfieWithId?.url && (
                          <div className="border border-border rounded-lg p-3 bg-muted/30">
                            <div className="text-sm font-medium text-foreground mb-2">
                              Selfie with ID
                            </div>
                            {/\.(png|jpe?g|gif|webp)$/i.test(
                              app.documents.selfieWithId.url,
                            ) ? (
                              <a
                                href={app.documents.selfieWithId.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={app.documents.selfieWithId.url}
                                  alt="Selfie with ID"
                                  className="w-full h-40 object-cover rounded"
                                />
                              </a>
                            ) : (
                              <a
                                href={app.documents.selfieWithId.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline break-all"
                              >
                                View file
                              </a>
                            )}
                          </div>
                        )}

                        {/* Registration Certificate */}
                        {app.documents.registrationCertificate?.url && (
                          <div className="border border-border rounded-lg p-3 bg-muted/30">
                            <div className="text-sm font-medium text-foreground mb-2">
                              Registration Certificate
                            </div>
                            {/\.(png|jpe?g|gif|webp)$/i.test(
                              app.documents.registrationCertificate.url,
                            ) ? (
                              <a
                                href={app.documents.registrationCertificate.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={
                                    app.documents.registrationCertificate.url
                                  }
                                  alt="Registration Certificate"
                                  className="w-full h-40 object-cover rounded"
                                />
                              </a>
                            ) : (
                              <a
                                href={app.documents.registrationCertificate.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline break-all"
                              >
                                View file
                              </a>
                            )}
                          </div>
                        )}

                        {/* Tax ID */}
                        {app.documents.taxId?.url && (
                          <div className="border border-border rounded-lg p-3 bg-muted/30">
                            <div className="text-sm font-medium text-foreground mb-2">
                              Tax ID / EIN
                            </div>
                            {/\.(png|jpe?g|gif|webp)$/i.test(
                              app.documents.taxId.url,
                            ) ? (
                              <a
                                href={app.documents.taxId.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={app.documents.taxId.url}
                                  alt="Tax ID"
                                  className="w-full h-40 object-cover rounded"
                                />
                              </a>
                            ) : (
                              <a
                                href={app.documents.taxId.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline break-all"
                              >
                                View file
                              </a>
                            )}
                          </div>
                        )}

                        {/* Address Proof */}
                        {app.documents.addressProof?.url && (
                          <div className="border border-border rounded-lg p-3 bg-muted/30">
                            <div className="text-sm font-medium text-foreground mb-2">
                              Address Proof
                            </div>
                            {/\.(png|jpe?g|gif|webp)$/i.test(
                              app.documents.addressProof.url,
                            ) ? (
                              <a
                                href={app.documents.addressProof.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={app.documents.addressProof.url}
                                  alt="Address Proof"
                                  className="w-full h-40 object-cover rounded"
                                />
                              </a>
                            ) : (
                              <a
                                href={app.documents.addressProof.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline break-all"
                              >
                                View file
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No documents uploaded.
                      </div>
                    )}

                    {/* Additional Documents */}
                    {app.documents?.additionalDocuments?.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-foreground">
                          Additional Documents
                        </div>
                        <div className="grid gap-3 md:grid-cols-3">
                          {app.documents.additionalDocuments.map((doc, idx) => (
                            <div
                              key={idx}
                              className="border border-border rounded-lg p-3 bg-muted/30"
                            >
                              {/\.(png|jpe?g|gif|webp)$/i.test(doc.url) ? (
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <img
                                    src={doc.url}
                                    alt={
                                      doc.name ||
                                      `Additional Document ${idx + 1}`
                                    }
                                    className="w-full h-40 object-cover rounded"
                                  />
                                </a>
                              ) : (
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline break-all text-sm"
                                >
                                  {doc.name || doc.url}
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rejection/Revocation Reason */}
                  {(app.status === "rejected" || app.status === "revoked") &&
                    app.rejectionReason && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-destructive flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          {app.status === "rejected"
                            ? "Rejection Reason"
                            : "Revocation Reason"}
                        </h4>
                        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
                          <p className="text-destructive">{app.rejectionReason}</p>
                        </div>
                      </div>
                    )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                    {app.status === "pending" && (
                      <>
                        <Button
                          size="lg"
                          className="flex-1 bg-primary hover:bg-primary/90"
                          onClick={() => approveMutation.mutate(app._id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                        >
                          {approveMutation.isPending ? "Approving..." : <><CheckCircle className="h-4 w-4 mr-2" />Approve Application</>}
                        </Button>

                        <Button
                          variant="destructive"
                          size="lg"
                          className="flex-1"
                          onClick={() => handleReject(app)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Application
                        </Button>
                      </>
                    )}

                    {app.status === "approved" && (
                      <Button
                        variant="destructive"
                        size="lg"
                        className="flex-1"
                        onClick={() => handleRevoke(app)}
                        disabled={revokeMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Revoke Organizer
                      </Button>
                    )}

                    {app.status === "revoked" && (
                      <Button variant="outline" size="lg" disabled className="flex-1">
                        <XCircle className="h-4 w-4 mr-2" />
                        Already Revoked
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                Reject Application
              </DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this application. This
                will be sent to the applicant.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                <Textarea
                  id="rejection-reason"
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please explain why this application is being rejected..."
                  className="resize-none"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionReason("");
                  setSelectedApp(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmReject}
                disabled={!rejectionReason.trim() || rejectMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                {rejectMutation.isPending ? "Rejecting..." : "Reject Application"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Revoke Dialog */}
        <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                Revoke Organizer Role
              </DialogTitle>
              <DialogDescription>
                You are about to revoke this user’s organizer rights, sending
                them back to “donor.” Optionally provide a reason.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="revoke-reason">Revocation Reason (optional)</Label>
                <Textarea
                  id="revoke-reason"
                  rows={4}
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="Explain why you are revoking organizer status…"
                  className="resize-none"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRevokeDialog(false);
                  setRevokeReason("");
                  setRevokeTargetAppId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmRevoke}
                disabled={revokeMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                {revokeMutation.isPending ? "Revoking..." : "Revoke Organizer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
