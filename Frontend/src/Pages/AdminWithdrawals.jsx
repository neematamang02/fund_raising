import { useState, useEffect, useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/Context/AuthContext";
import ROUTES from "@/routes/routes";
import { Card, CardContent } from "@/components/ui/card";
import { AdminDialogSkeleton, AdminPageSkeleton } from "@/components/admin/AdminSkeletons";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  PageHeader,
  RefreshButton,
  StatusBadge,
  EmptyState,
  FilterCard,
  InfoRow,
  DetailSection,
} from "@/components/admin/AdminUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Loader2,
  DollarSign,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Building2,
  User,
  Calendar,
  ArrowDownCircle,
} from "lucide-react";
import {
  adminQueryKeys,
  getAdminWithdrawalDetails,
  getAdminWithdrawals,
  updateAdminWithdrawalStatus,
} from "@/services/adminApi";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const AdminWithdrawals = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [reviewNotes, setReviewNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [transactionReference, setTransactionReference] = useState("");
  const scopedStatus = statusFilter === "all" ? undefined : statusFilter;

  const { data: withdrawalsData, isLoading, isFetching } = useQuery({
    queryKey: adminQueryKeys.withdrawals(scopedStatus),
    queryFn: () => getAdminWithdrawals({ status: scopedStatus }),
    enabled: Boolean(user?.role === "admin"),
  });

  const withdrawals = withdrawalsData?.withdrawalRequests ?? [];

  const { data: selectedWithdrawal, isFetching: isDetailsLoading } = useQuery({
    queryKey: adminQueryKeys.withdrawalDetails(selectedWithdrawalId),
    queryFn: () => getAdminWithdrawalDetails(selectedWithdrawalId),
    enabled: Boolean(selectedWithdrawalId),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ withdrawalId, payload }) => 
      updateAdminWithdrawalStatus(withdrawalId, payload),
    onSuccess: async (data, variables) => {
      // Invalidate ALL withdrawal-related queries
      await Promise.all([
        queryClient.invalidateQueries({ 
          queryKey: ["admin", "withdrawals"] 
        }),
        queryClient.invalidateQueries({ 
          queryKey: adminQueryKeys.withdrawalDetails(variables.withdrawalId) 
        }),
      ]);
      toast.success(data?.message || "Withdrawal request updated successfully");
    },
    onError: (error) => {
      console.error("Withdrawal update error:", error);
      toast.error(error.message || "Failed to update withdrawal status");
    },
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) navigate(`${ROUTES.LOGIN}?redirect=${ROUTES.ADMIN_WITHDRAWALS}`);
      else if (user.role !== "admin") { navigate(ROUTES.HOME); toast.error("Access denied. Admin only."); }
    }
  }, [user, authLoading, navigate]);

  const handleStatusUpdate = async (withdrawalId, newStatus) => {
    if (newStatus === "rejected" && !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason"); return;
    }
    if (newStatus === "completed" && !transactionReference.trim()) {
      toast.error("Please provide a transaction reference"); return;
    }
    try {
      await updateStatusMutation.mutateAsync({
        withdrawalId,
        payload: {
          status: newStatus,
          reviewNotes: reviewNotes.trim() || undefined,
          rejectionReason: rejectionReason.trim() || undefined,
          transactionReference: transactionReference.trim() || undefined,
        },
      });
      setReviewNotes(""); setRejectionReason(""); setTransactionReference("");
    } catch {}
  };

  const processing = updateStatusMutation.isPending;

  if (isLoading) return <AdminPageSkeleton statCount={0} listCount={5} variant="list" />;

  return (
    <div className="surface-page min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">

        <PageHeader
          label="Admin · Withdrawals"
          title="Withdrawal Requests"
          description="Review and approve organizer payout requests."
          action={
            <RefreshButton
              disabled={isFetching}
              onClick={() => queryClient.invalidateQueries({ queryKey: ["admin", "withdrawals"] })}
            />
          }
        />

        {/* Filter */}
        <FilterCard>
          <div>
            <Label htmlFor="status-filter" className="text-xs font-medium text-muted-foreground">
              Filter by status
            </Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter" className="mt-1 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FilterCard>

        {/* List */}
        {withdrawals.length === 0 ? (
          <EmptyState
            icon={ArrowDownCircle}
            title="No withdrawal requests"
            description={statusFilter === "all" ? "There are no withdrawal requests yet." : `No ${statusFilter} requests.`}
          />
        ) : (
          <div className="space-y-2">
            {withdrawals.map((withdrawal) => (
              <Card key={withdrawal._id} className="surface-card shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-foreground truncate">
                          {withdrawal.campaign?.title ?? "Unknown Campaign"}
                        </h3>
                        <StatusBadge status={withdrawal.status} />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                        <User className="h-3 w-3" />
                        <span>{withdrawal.organizer?.name ?? "Unknown"}</span>
                        <span className="text-border">·</span>
                        <span>{withdrawal.organizer?.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(withdrawal.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-lg font-bold text-primary">
                        {currency.format(withdrawal.amount)}
                      </span>
                      <div className="flex gap-2">
                        {/* Details dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedWithdrawalId(withdrawal._id)}>
                              <Eye className="h-3.5 w-3.5 mr-1.5" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent
                            className="max-w-4xl max-h-[90vh] overflow-y-auto"
                            onPointerDownOutside={() => setSelectedWithdrawalId(null)}
                          >
                            <DialogHeader>
                              <DialogTitle>Withdrawal Request</DialogTitle>
                              <DialogDescription>Review all information before making a decision.</DialogDescription>
                            </DialogHeader>

                            {isDetailsLoading ? (
                              <AdminDialogSkeleton />
                            ) : selectedWithdrawal ? (
                              <div className="space-y-5">
                                {/* Amount + status */}
                                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3">
                                  <div>
                                    <p className="text-xs text-muted-foreground">Requested amount</p>
                                    <p className="text-2xl font-bold text-primary mt-0.5">
                                      {currency.format(selectedWithdrawal.amount)}
                                    </p>
                                  </div>
                                  <StatusBadge status={selectedWithdrawal.status} />
                                </div>

                                {/* Request info */}
                                <DetailSection icon={DollarSign} title="Request Information">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InfoRow label="Campaign" value={selectedWithdrawal.campaign?.title} />
                                    <InfoRow label="Organizer" value={selectedWithdrawal.organizer?.name} />
                                  </div>
                                </DetailSection>

                                {/* Bank details */}
                                <DetailSection icon={Building2} title="Bank Account Details">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InfoRow label="Account Holder" value={selectedWithdrawal.bankDetails?.accountHolderName} />
                                    <InfoRow label="Bank Name" value={selectedWithdrawal.bankDetails?.bankName} />
                                    <InfoRow label="Account Number" value={selectedWithdrawal.bankDetails?.accountNumber} />
                                    <InfoRow label="Account Type" value={selectedWithdrawal.bankDetails?.accountType} />
                                    {selectedWithdrawal.bankDetails?.routingNumber && (
                                      <InfoRow label="Routing Number" value={selectedWithdrawal.bankDetails.routingNumber} />
                                    )}
                                    {selectedWithdrawal.bankDetails?.swiftCode && (
                                      <InfoRow label="SWIFT Code" value={selectedWithdrawal.bankDetails.swiftCode} />
                                    )}
                                  </div>
                                </DetailSection>

                                {/* KYC */}
                                <DetailSection icon={User} title="KYC Information">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InfoRow label="Full Legal Name" value={selectedWithdrawal.kycInfo?.fullLegalName} />
                                    <InfoRow label="Date of Birth" value={new Date(selectedWithdrawal.kycInfo?.dateOfBirth).toLocaleDateString()} />
                                    <InfoRow label="Nationality" value={selectedWithdrawal.kycInfo?.nationality} />
                                    <InfoRow label="Phone" value={selectedWithdrawal.kycInfo?.phoneNumber} />
                                    <InfoRow
                                      className="col-span-1 md:col-span-2"
                                      label="Address"
                                      value={[
                                        selectedWithdrawal.kycInfo?.address?.street,
                                        selectedWithdrawal.kycInfo?.address?.city,
                                        selectedWithdrawal.kycInfo?.address?.state,
                                        selectedWithdrawal.kycInfo?.address?.postalCode,
                                        selectedWithdrawal.kycInfo?.address?.country,
                                      ].filter(Boolean).join(", ")}
                                    />
                                  </div>
                                </DetailSection>

                                {/* Documents */}
                                <DetailSection icon={FileText} title="Submitted Documents">
                                  <div className="space-y-2">
                                    {[
                                      { key: "governmentId", label: "Government ID" },
                                      { key: "bankProof", label: "Bank Proof" },
                                      { key: "addressProof", label: "Address Proof" },
                                    ].map(({ key, label }) =>
                                      selectedWithdrawal.documents?.[key]?.url ? (
                                        <div key={key} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
                                          <span className="text-sm text-foreground">
                                            {label} ({selectedWithdrawal.documents[key].type})
                                          </span>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(selectedWithdrawal.documents[key].url, "_blank")}
                                          >
                                            View
                                          </Button>
                                        </div>
                                      ) : null
                                    )}
                                  </div>
                                </DetailSection>

                                {/* Action area for pending and under_review requests */}
                                {(selectedWithdrawal.status === "pending" || selectedWithdrawal.status === "under_review") && (
                                  <div className="space-y-3 border-t border-border pt-4">
                                    <div>
                                      <Label htmlFor="review-notes" className="text-xs font-medium text-muted-foreground">
                                        Review notes (optional)
                                      </Label>
                                      <Textarea
                                        id="review-notes"
                                        value={reviewNotes}
                                        onChange={(e) => setReviewNotes(e.target.value)}
                                        placeholder="Add any internal notes about this review…"
                                        rows={2}
                                        className="mt-1"
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      {/* Only show Start Review button if status is pending */}
                                      {selectedWithdrawal.status === "pending" && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="flex-1"
                                          onClick={() => handleStatusUpdate(selectedWithdrawal._id, "under_review")}
                                          disabled={processing}
                                        >
                                          <Eye className="h-4 w-4 mr-2" />
                                          Start Review
                                        </Button>
                                      )}
                                      
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button variant="outline" size="sm" className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10">
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reject
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-sm">
                                          <DialogHeader>
                                            <DialogTitle>Reject Withdrawal</DialogTitle>
                                            <DialogDescription>Provide a clear reason for rejection.</DialogDescription>
                                          </DialogHeader>
                                          <div>
                                            <Label htmlFor="rejection-reason" className="text-xs text-muted-foreground">
                                              Rejection reason *
                                            </Label>
                                            <Textarea
                                              id="rejection-reason"
                                              value={rejectionReason}
                                              onChange={(e) => setRejectionReason(e.target.value)}
                                              placeholder="Explain why this request is being rejected…"
                                              rows={4}
                                              className="mt-1"
                                            />
                                          </div>
                                          <DialogFooter>
                                            <Button variant="outline" size="sm" onClick={() => setRejectionReason("")}>Cancel</Button>
                                            <Button
                                              variant="destructive"
                                              size="sm"
                                              onClick={() => handleStatusUpdate(selectedWithdrawal._id, "rejected")}
                                              disabled={processing}
                                            >
                                              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Rejection"}
                                            </Button>
                                          </DialogFooter>
                                        </DialogContent>
                                      </Dialog>

                                      <Button
                                        size="sm"
                                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                                        onClick={() => handleStatusUpdate(selectedWithdrawal._id, "approved")}
                                        disabled={processing}
                                      >
                                        {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                        {selectedWithdrawal.status === "pending" ? "Directly Approve" : "Approve"}
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {selectedWithdrawal.status === "approved" && (
                                  <div className="space-y-3 border-t border-border pt-4">
                                    <div>
                                      <Label htmlFor="transaction-ref" className="text-xs text-muted-foreground">
                                        Transaction reference *
                                      </Label>
                                      <Input
                                        id="transaction-ref"
                                        value={transactionReference}
                                        onChange={(e) => setTransactionReference(e.target.value)}
                                        placeholder="Enter transaction / transfer reference number"
                                        className="mt-1"
                                      />
                                    </div>
                                    <Button
                                      size="sm"
                                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                      onClick={() => handleStatusUpdate(selectedWithdrawal._id, "completed")}
                                      disabled={processing}
                                    >
                                      {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                      Mark as Completed
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <EmptyState title="Unable to load withdrawal details" />
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWithdrawals;
