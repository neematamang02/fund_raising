import { useState, useEffect, useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/Context/AuthContext";
import ROUTES from "@/routes/routes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AdminDialogSkeleton,
  AdminPageSkeleton,
} from "@/components/admin/AdminSkeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Clock,
  Eye,
  FileText,
  Building2,
  User,
  Calendar,
} from "lucide-react";
import {
  adminQueryKeys,
  getAdminWithdrawalDetails,
  getAdminWithdrawals,
  updateAdminWithdrawalStatus,
} from "@/services/adminApi";

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

  const {
    data: withdrawalsData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: adminQueryKeys.withdrawals(scopedStatus),
    queryFn: () => getAdminWithdrawals({ status: scopedStatus }),
    enabled: Boolean(user?.role === "admin"),
  });

  const withdrawals = withdrawalsData?.withdrawalRequests || [];

  const { data: selectedWithdrawal, isFetching: isDetailsLoading } = useQuery({
    queryKey: adminQueryKeys.withdrawalDetails(selectedWithdrawalId),
    queryFn: () => getAdminWithdrawalDetails(selectedWithdrawalId),
    enabled: Boolean(selectedWithdrawalId),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ withdrawalId, payload }) =>
      updateAdminWithdrawalStatus(withdrawalId, payload),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "withdrawals"] }),
        queryClient.invalidateQueries({
          queryKey: adminQueryKeys.withdrawalDetails(variables.withdrawalId),
        }),
      ]);
      toast.success("Withdrawal request updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update withdrawal status");
    },
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate(`${ROUTES.LOGIN}?redirect=${ROUTES.ADMIN_WITHDRAWALS}`);
      } else if (user.role !== "admin") {
        navigate(ROUTES.HOME);
        toast.error("Access denied. Admin only.");
      }
    }
  }, [user, authLoading, navigate]);

  const handleStatusUpdate = async (withdrawalId, newStatus) => {
    if (newStatus === "rejected" && !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    if (newStatus === "completed" && !transactionReference.trim()) {
      toast.error("Please provide a transaction reference");
      return;
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

      setReviewNotes("");
      setRejectionReason("");
      setTransactionReference("");
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-500", label: "Pending", icon: Clock },
      under_review: { color: "bg-blue-500", label: "Under Review", icon: Eye },
      approved: { color: "bg-green-500", label: "Approved", icon: CheckCircle },
      rejected: { color: "bg-red-500", label: "Rejected", icon: XCircle },
      completed: {
        color: "bg-purple-500",
        label: "Completed",
        icon: CheckCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const processing = updateStatusMutation.isPending;

  if (isLoading) {
    return <AdminPageSkeleton statCount={0} listCount={5} />;
  }

  return (
    <div className="surface-page min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-slate-900">
                Withdrawal Requests
              </h1>
              <p className="text-slate-600">
                Review and manage organizer withdrawal requests
              </p>
            </div>
            <Button
              variant="outline"
              disabled={isFetching}
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: ["admin", "withdrawals"],
                })
              }
            >
              {isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter */}
        <Card className="surface-card mb-6 shadow-sm">
          <CardHeader>
            <CardTitle>Filter Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="status-filter">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger
                    id="status-filter"
                    className="h-11 rounded-lg border-slate-300"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Requests</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawals List */}
        {withdrawals.length === 0 ? (
          <Card className="surface-card">
            <CardContent className="py-12 text-center">
              <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No withdrawal requests
              </h3>
              <p className="text-slate-600">
                {statusFilter === "all"
                  ? "There are no withdrawal requests yet"
                  : `No ${statusFilter} withdrawal requests`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {withdrawals.map((withdrawal) => (
              <Card
                key={withdrawal._id}
                className="surface-card shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {withdrawal.campaign?.title || "Unknown Campaign"}
                      </CardTitle>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{withdrawal.organizer?.name || "Unknown"}</span>
                          <span className="text-xs">
                            ({withdrawal.organizer?.email})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Submitted:{" "}
                            {new Date(
                              withdrawal.createdAt,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        ${withdrawal.amount.toFixed(2)}
                      </div>
                      {getStatusBadge(withdrawal.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setSelectedWithdrawalId(withdrawal._id)
                          }
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent
                        className="max-w-4xl max-h-[90vh] overflow-y-auto"
                        onPointerDownOutside={() =>
                          setSelectedWithdrawalId(null)
                        }
                      >
                        <DialogHeader>
                          <DialogTitle>Withdrawal Request Details</DialogTitle>
                          <DialogDescription>
                            Review all information before making a decision
                          </DialogDescription>
                        </DialogHeader>

                        {isDetailsLoading ? (
                          <AdminDialogSkeleton />
                        ) : selectedWithdrawal ? (
                          <div className="space-y-6">
                            {/* Basic Info */}
                            <div>
                              <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Request Information
                              </h3>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-slate-500">
                                    Amount:
                                  </span>
                                  <p className="font-semibold text-lg text-green-600">
                                    ${selectedWithdrawal.amount.toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-500">
                                    Status:
                                  </span>
                                  <div className="mt-1">
                                    {getStatusBadge(selectedWithdrawal.status)}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-slate-500">
                                    Campaign:
                                  </span>
                                  <p className="font-medium">
                                    {selectedWithdrawal.campaign?.title}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-500">
                                    Organizer:
                                  </span>
                                  <p className="font-medium">
                                    {selectedWithdrawal.organizer?.name}
                                  </p>
                                </div>
                              </div>
                            </div>
                            {/* Bank Details */}
                            <div>
                              <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Bank Account Details
                              </h3>
                              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <div>
                                  <span className="text-slate-500">
                                    Account Holder:
                                  </span>
                                  <p className="font-medium">
                                    {
                                      selectedWithdrawal.bankDetails
                                        ?.accountHolderName
                                    }
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-500">
                                    Bank Name:
                                  </span>
                                  <p className="font-medium">
                                    {selectedWithdrawal.bankDetails?.bankName}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-500">
                                    Account Number:
                                  </span>
                                  <p className="font-medium">
                                    {
                                      selectedWithdrawal.bankDetails
                                        ?.accountNumber
                                    }
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-500">
                                    Account Type:
                                  </span>
                                  <p className="font-medium capitalize">
                                    {
                                      selectedWithdrawal.bankDetails
                                        ?.accountType
                                    }
                                  </p>
                                </div>
                                {selectedWithdrawal.bankDetails
                                  ?.routingNumber && (
                                  <div>
                                    <span className="text-slate-500">
                                      Routing Number:
                                    </span>
                                    <p className="font-medium">
                                      {
                                        selectedWithdrawal.bankDetails
                                          .routingNumber
                                      }
                                    </p>
                                  </div>
                                )}
                                {selectedWithdrawal.bankDetails?.swiftCode && (
                                  <div>
                                    <span className="text-slate-500">
                                      SWIFT Code:
                                    </span>
                                    <p className="font-medium">
                                      {selectedWithdrawal.bankDetails.swiftCode}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* KYC Information */}
                            <div>
                              <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <User className="h-5 w-5" />
                                KYC Information
                              </h3>
                              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <div>
                                  <span className="text-slate-500">
                                    Full Legal Name:
                                  </span>
                                  <p className="font-medium">
                                    {selectedWithdrawal.kycInfo?.fullLegalName}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-500">
                                    Date of Birth:
                                  </span>
                                  <p className="font-medium">
                                    {new Date(
                                      selectedWithdrawal.kycInfo?.dateOfBirth,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-500">
                                    Nationality:
                                  </span>
                                  <p className="font-medium">
                                    {selectedWithdrawal.kycInfo?.nationality}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-500">Phone:</span>
                                  <p className="font-medium">
                                    {selectedWithdrawal.kycInfo?.phoneNumber}
                                  </p>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-slate-500">
                                    Address:
                                  </span>
                                  <p className="font-medium">
                                    {
                                      selectedWithdrawal.kycInfo?.address
                                        ?.street
                                    }
                                    ,{" "}
                                    {selectedWithdrawal.kycInfo?.address?.city},{" "}
                                    {
                                      selectedWithdrawal.kycInfo?.address
                                        ?.postalCode
                                    }
                                    ,{" "}
                                    {
                                      selectedWithdrawal.kycInfo?.address
                                        ?.country
                                    }
                                  </p>
                                </div>
                              </div>
                            </div>
                            {/* Documents */}
                            <div>
                              <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Submitted Documents
                              </h3>
                              <div className="space-y-2">
                                {selectedWithdrawal.documents?.governmentId
                                  ?.url && (
                                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                    <span className="text-sm">
                                      Government ID (
                                      {
                                        selectedWithdrawal.documents
                                          .governmentId.type
                                      }
                                      )
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        window.open(
                                          selectedWithdrawal.documents
                                            .governmentId.url,
                                          "_blank",
                                        )
                                      }
                                    >
                                      View Document
                                    </Button>
                                  </div>
                                )}
                                {selectedWithdrawal.documents?.bankProof
                                  ?.url && (
                                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                    <span className="text-sm">
                                      Bank Proof (
                                      {
                                        selectedWithdrawal.documents.bankProof
                                          .type
                                      }
                                      )
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        window.open(
                                          selectedWithdrawal.documents.bankProof
                                            .url,
                                          "_blank",
                                        )
                                      }
                                    >
                                      View Document
                                    </Button>
                                  </div>
                                )}
                                {selectedWithdrawal.documents?.addressProof
                                  ?.url && (
                                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                    <span className="text-sm">
                                      Address Proof (
                                      {
                                        selectedWithdrawal.documents
                                          .addressProof.type
                                      }
                                      )
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        window.open(
                                          selectedWithdrawal.documents
                                            .addressProof.url,
                                          "_blank",
                                        )
                                      }
                                    >
                                      View Document
                                    </Button>
                                  </div>
                                )}

                                {(selectedWithdrawal.status === "pending" ||
                                  selectedWithdrawal.status ===
                                    "under_review") && (
                                  <div className="space-y-4 border-t pt-4">
                                    <div>
                                      <Label htmlFor="review-notes">
                                        Review Notes
                                      </Label>
                                      <Textarea
                                        id="review-notes"
                                        value={reviewNotes}
                                        onChange={(e) =>
                                          setReviewNotes(e.target.value)
                                        }
                                        placeholder="Add any notes about this review..."
                                        rows={3}
                                      />
                                    </div>

                                    <div className="flex gap-2">
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button
                                            variant="outline"
                                            className="flex-1"
                                          >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reject
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>
                                              Reject Withdrawal Request
                                            </DialogTitle>
                                            <DialogDescription>
                                              Please provide a reason for
                                              rejection
                                            </DialogDescription>
                                          </DialogHeader>
                                          <div className="space-y-4">
                                            <div>
                                              <Label htmlFor="rejection-reason">
                                                Rejection Reason *
                                              </Label>
                                              <Textarea
                                                id="rejection-reason"
                                                value={rejectionReason}
                                                onChange={(e) =>
                                                  setRejectionReason(
                                                    e.target.value,
                                                  )
                                                }
                                                placeholder="Explain why this request is being rejected..."
                                                rows={4}
                                                required
                                              />
                                            </div>
                                          </div>
                                          <DialogFooter>
                                            <Button
                                              variant="outline"
                                              onClick={() =>
                                                setRejectionReason("")
                                              }
                                            >
                                              Cancel
                                            </Button>
                                            <Button
                                              variant="destructive"
                                              onClick={() =>
                                                handleStatusUpdate(
                                                  selectedWithdrawal._id,
                                                  "rejected",
                                                )
                                              }
                                              disabled={processing}
                                            >
                                              {processing ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                              ) : (
                                                "Confirm Rejection"
                                              )}
                                            </Button>
                                          </DialogFooter>
                                        </DialogContent>
                                      </Dialog>

                                      <Button
                                        className="flex-1"
                                        onClick={() =>
                                          handleStatusUpdate(
                                            selectedWithdrawal._id,
                                            "approved",
                                          )
                                        }
                                        disabled={processing}
                                      >
                                        {processing ? (
                                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                        )}
                                        Approve
                                      </Button>
                                    </div>
                                  </div>
                                )}
                                {selectedWithdrawal.status === "approved" && (
                                  <div className="space-y-4 border-t pt-4">
                                    <div>
                                      <Label htmlFor="transaction-ref">
                                        Transaction Reference *
                                      </Label>
                                      <Input
                                        id="transaction-ref"
                                        value={transactionReference}
                                        onChange={(e) =>
                                          setTransactionReference(
                                            e.target.value,
                                          )
                                        }
                                        placeholder="Enter transaction/transfer reference number"
                                        required
                                      />
                                    </div>
                                    <Button
                                      className="w-full"
                                      onClick={() =>
                                        handleStatusUpdate(
                                          selectedWithdrawal._id,
                                          "completed",
                                        )
                                      }
                                      disabled={processing}
                                    >
                                      {processing ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      ) : (
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                      )}
                                      Mark as Completed
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                            )
                          </div>
                        ) : (
                          <div className="py-8 text-center text-slate-500">
                            Unable to load withdrawal details.
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {withdrawal.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            await handleStatusUpdate(
                              withdrawal._id,
                              "under_review",
                            );
                          }}
                          disabled={processing}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Start Review
                        </Button>
                      </>
                    )}
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
