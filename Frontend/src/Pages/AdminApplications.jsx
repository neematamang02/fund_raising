import React, { useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import ROUTES from "@/routes/routes";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FundraisingButton } from "@/components/ui/fundraising-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Search,
  Filter,
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
    queryKey: ["applications"],
    queryFn: async () => {
      const res = await fetch("/api/admin/applications", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    },
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (appId) => {
      const res = await fetch(`/api/admin/applications/${appId}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Approve failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["applications"]);
      toast.success("Application approved successfully! 🎉");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve application");
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ appId, reason }) => {
      const res = await fetch(`/api/admin/applications/${appId}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ rejectionReason: reason }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Reject failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["applications"]);
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
    mutationFn: async ({ appId, reason }) => {
      const res = await fetch(`/api/admin/applications/${appId}/revoke`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Revoke failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["applications"]);
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

  // Render status badges
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case "revoked":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <XCircle className="h-3 w-3 mr-1" />
            Revoked
          </Badge>
        );
      default:
        return null;
    }
  };

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (appsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Applications
          </h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-2 text-sm font-medium mb-6">
            <Settings className="h-4 w-4 mr-2" />
            Admin Dashboard
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-red-700 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Organizer
            </span>
            <br />
            <span className="text-gray-800">Applications</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Review and manage organizer applications to maintain platform
            quality and trust.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {statusCounts.total}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-amber-600">
                {statusCounts.pending}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {statusCounts.approved}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">
                {statusCounts.rejected}
              </div>
              <div className="text-sm text-gray-600">Rejected</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <XCircle className="h-5 w-5 text-gray-600" />
              </div>
              <div className="text-2xl font-bold text-gray-600">
                {statusCounts.revoked}
              </div>
              <div className="text-sm text-gray-600">Revoked</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  <Search className="h-4 w-4 inline mr-2" />
                  Search Applications
                </Label>
                <Input
                  placeholder="Search by name, email, or organization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-11 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  <Filter className="h-4 w-4 inline mr-2" />
                  Filter by Status
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-blue-500 rounded-xl">
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
          </CardContent>
        </Card>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Applications Found
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No organizer applications have been submitted yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredApplications.map((app) => (
              <Card
                key={app._id}
                className="bg-white shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl text-gray-900 mb-2">
                        {app.user.name || app.user.email}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">
                          {app.organizationName}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(app.status)}
                      <div className="text-sm text-gray-500 flex items-center gap-1">
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
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                        Contact Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span>{app.contactEmail || app.user.email}</span>
                        </div>
                        {app.phoneNumber && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span>{app.phoneNumber}</span>
                          </div>
                        )}
                        {app.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-3 w-3 text-gray-400" />
                            <a
                              href={app.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {app.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {app.experience && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          Experience
                        </h4>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {app.experience}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-600" />
                      Organization Description
                    </h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-gray-800 leading-relaxed">
                        {app.description}
                      </p>
                    </div>
                  </div>

                  {/* Verification Documents */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-600" />
                      Verification Documents
                    </h4>

                    {app.documents ? (
                      <div className="grid gap-4 md:grid-cols-3">
                        {/* Government ID */}
                        {app.documents.governmentId?.url && (
                          <div className="border rounded-lg p-3 bg-gray-50">
                            <div className="text-sm font-medium text-gray-700 mb-2">Government ID</div>
                            {/\.(png|jpe?g|gif|webp)$/i.test(app.documents.governmentId.url) ? (
                              <a href={app.documents.governmentId.url} target="_blank" rel="noopener noreferrer">
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
                                className="text-blue-600 hover:underline break-all"
                              >
                                View file
                              </a>
                            )}
                          </div>
                        )}

                        {/* Selfie with ID */}
                        {app.documents.selfieWithId?.url && (
                          <div className="border rounded-lg p-3 bg-gray-50">
                            <div className="text-sm font-medium text-gray-700 mb-2">Selfie with ID</div>
                            {/\.(png|jpe?g|gif|webp)$/i.test(app.documents.selfieWithId.url) ? (
                              <a href={app.documents.selfieWithId.url} target="_blank" rel="noopener noreferrer">
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
                                className="text-blue-600 hover:underline break-all"
                              >
                                View file
                              </a>
                            )}
                          </div>
                        )}

                        {/* Registration Certificate */}
                        {app.documents.registrationCertificate?.url && (
                          <div className="border rounded-lg p-3 bg-gray-50">
                            <div className="text-sm font-medium text-gray-700 mb-2">Registration Certificate</div>
                            {/\.(png|jpe?g|gif|webp)$/i.test(app.documents.registrationCertificate.url) ? (
                              <a href={app.documents.registrationCertificate.url} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={app.documents.registrationCertificate.url}
                                  alt="Registration Certificate"
                                  className="w-full h-40 object-cover rounded"
                                />
                              </a>
                            ) : (
                              <a
                                href={app.documents.registrationCertificate.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline break-all"
                              >
                                View file
                              </a>
                            )}
                          </div>
                        )}

                        {/* Tax ID */}
                        {app.documents.taxId?.url && (
                          <div className="border rounded-lg p-3 bg-gray-50">
                            <div className="text-sm font-medium text-gray-700 mb-2">Tax ID / EIN</div>
                            {/\.(png|jpe?g|gif|webp)$/i.test(app.documents.taxId.url) ? (
                              <a href={app.documents.taxId.url} target="_blank" rel="noopener noreferrer">
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
                                className="text-blue-600 hover:underline break-all"
                              >
                                View file
                              </a>
                            )}
                          </div>
                        )}

                        {/* Address Proof */}
                        {app.documents.addressProof?.url && (
                          <div className="border rounded-lg p-3 bg-gray-50">
                            <div className="text-sm font-medium text-gray-700 mb-2">Address Proof</div>
                            {/\.(png|jpe?g|gif|webp)$/i.test(app.documents.addressProof.url) ? (
                              <a href={app.documents.addressProof.url} target="_blank" rel="noopener noreferrer">
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
                                className="text-blue-600 hover:underline break-all"
                              >
                                View file
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">No documents uploaded.</div>
                    )}

                    {/* Additional Documents */}
                    {app.documents?.additionalDocuments?.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">Additional Documents</div>
                        <div className="grid gap-3 md:grid-cols-3">
                          {app.documents.additionalDocuments.map((doc, idx) => (
                            <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                              {/\.(png|jpe?g|gif|webp)$/i.test(doc.url) ? (
                                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                  <img
                                    src={doc.url}
                                    alt={doc.name || `Additional Document ${idx + 1}`}
                                    className="w-full h-40 object-cover rounded"
                                  />
                                </a>
                              ) : (
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline break-all text-sm"
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
                        <h4 className="font-semibold text-red-800 flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          {app.status === "rejected"
                            ? "Rejection Reason"
                            : "Revocation Reason"}
                        </h4>
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                          <p className="text-red-800">{app.rejectionReason}</p>
                        </div>
                      </div>
                    )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                    {app.status === "pending" && (
                      <>
                        <FundraisingButton
                          variant="success"
                          size="lg"
                          onClick={() => approveMutation.mutate(app._id)}
                          loading={approveMutation.isPending}
                          loadingText="Approving..."
                          disabled={
                            approveMutation.isPending ||
                            rejectMutation.isPending
                          }
                          className="flex-1"
                        >
                          <CheckCircle className="h-5 w-5" />
                          Approve Application
                        </FundraisingButton>

                        <FundraisingButton
                          variant="destructive"
                          size="lg"
                          onClick={() => handleReject(app)}
                          disabled={
                            approveMutation.isPending ||
                            rejectMutation.isPending
                          }
                          className="flex-1"
                        >
                          <XCircle className="h-5 w-5" />
                          Reject Application
                        </FundraisingButton>
                      </>
                    )}

                    {app.status === "approved" && (
                      <FundraisingButton
                        variant="destructive"
                        size="lg"
                        onClick={() => handleRevoke(app)}
                        disabled={revokeMutation.isPending}
                        className="flex-1"
                      >
                        <XCircle className="h-5 w-5" />
                        Revoke Organizer
                      </FundraisingButton>
                    )}

                    {app.status === "revoked" && (
                      <FundraisingButton
                        variant="ghost-trust"
                        size="lg"
                        disabled
                        className="flex-1"
                      >
                        <XCircle className="h-5 w-5" />
                        Already Revoked
                      </FundraisingButton>
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
                <XCircle className="h-5 w-5 text-red-600" />
                Reject Application
              </DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this application. This
                will be sent to the applicant.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="rejection-reason"
                  className="text-sm font-medium text-gray-700"
                >
                  Rejection Reason *
                </Label>
                <Textarea
                  id="rejection-reason"
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please explain why this application is being rejected..."
                  className="mt-2 border-2 border-gray-200 focus:border-red-500 rounded-xl resize-none"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <FundraisingButton
                variant="ghost-trust"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionReason("");
                  setSelectedApp(null);
                }}
              >
                Cancel
              </FundraisingButton>
              <FundraisingButton
                variant="destructive"
                onClick={confirmReject}
                loading={rejectMutation.isPending}
                loadingText="Rejecting..."
                disabled={!rejectionReason.trim() || rejectMutation.isPending}
              >
                <XCircle className="h-4 w-4" />
                Reject Application
              </FundraisingButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Revoke Dialog */}
        <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Revoke Organizer Role
              </DialogTitle>
              <DialogDescription>
                You are about to revoke this user’s organizer rights, sending
                them back to “donor.” Optionally provide a reason.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="revoke-reason"
                  className="text-sm font-medium text-gray-700"
                >
                  Revocation Reason (optional)
                </Label>
                <Textarea
                  id="revoke-reason"
                  rows={4}
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="Explain why you are revoking organizer status…"
                  className="mt-2 border-2 border-gray-200 focus:border-red-500 rounded-xl resize-none"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <FundraisingButton
                variant="ghost-trust"
                onClick={() => {
                  setShowRevokeDialog(false);
                  setRevokeReason("");
                  setRevokeTargetAppId(null);
                }}
              >
                Cancel
              </FundraisingButton>
              <FundraisingButton
                variant="destructive"
                onClick={confirmRevoke}
                loading={revokeMutation.isPending}
                loadingText="Revoking..."
                disabled={revokeMutation.isPending}
              >
                <XCircle className="h-4 w-4" />
                Revoke Organizer
              </FundraisingButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
