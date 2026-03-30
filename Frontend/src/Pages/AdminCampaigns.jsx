import { useContext, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/Context/AuthContext";
import ROUTES from "@/routes/routes";
import {
  adminQueryKeys,
  deleteAdminCampaign,
  getAdminCampaignDetails,
  getAdminCampaigns,
} from "@/services/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AdminDialogSkeleton,
  AdminPageSkeleton,
} from "@/components/admin/AdminSkeletons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Eye, Loader2, Search, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function AdminCampaigns() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate(`${ROUTES.LOGIN}?redirect=${ROUTES.ADMIN_CAMPAIGNS}`);
      } else if (user.role !== "admin") {
        navigate(ROUTES.HOME);
      }
    }
  }, [loading, navigate, user]);

  const queryParams = useMemo(
    () => ({ page, search: searchTerm }),
    [page, searchTerm],
  );

  const {
    data: campaignsData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: adminQueryKeys.campaigns(queryParams),
    queryFn: () => getAdminCampaigns(queryParams),
    enabled: Boolean(user?.role === "admin"),
  });

  const campaigns = campaignsData?.campaigns || [];
  const totalPages = Number(campaignsData?.totalPages || 1);

  const { data: campaignDetails, isFetching: isDetailsLoading } = useQuery({
    queryKey: adminQueryKeys.campaignDetails(selectedCampaignId),
    queryFn: () => getAdminCampaignDetails(selectedCampaignId),
    enabled: Boolean(selectedCampaignId),
  });

  const deleteMutation = useMutation({
    mutationFn: (campaignId) => deleteAdminCampaign(campaignId),
    onSuccess: async (_, campaignId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "campaigns"] }),
        queryClient.invalidateQueries({
          queryKey: adminQueryKeys.campaignDetails(campaignId),
        }),
        queryClient.invalidateQueries({
          queryKey: adminQueryKeys.dashboardStats,
        }),
      ]);
      toast.success("Campaign deleted successfully");
      setCampaignToDelete(null);
      setDeleteConfirmText("");
      if (selectedCampaignId === campaignId) {
        setSelectedCampaignId(null);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete campaign");
    },
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchTerm(searchInput.trim());
  };

  const handleDelete = async () => {
    if (!campaignToDelete) return;
    if (deleteConfirmText.trim() !== campaignToDelete.title) {
      toast.error("Type the exact campaign title to confirm deletion");
      return;
    }
    await deleteMutation.mutateAsync(campaignToDelete._id);
  };

  if (loading || isLoading) {
    return <AdminPageSkeleton statCount={0} listCount={5} />;
  }

  return (
    <div className="surface-page min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">
              Campaign Moderation
            </h1>
            <p className="text-slate-600 mt-1">
              Inspect campaign activity and remove campaigns when required.
            </p>
          </div>
          <Button
            variant="outline"
            disabled={isFetching}
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ["admin", "campaigns"],
              })
            }
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Refresh
          </Button>
        </section>

        <Card className="surface-card shadow-sm">
          <CardContent className="pt-6">
            <form
              className="grid gap-3 md:grid-cols-[1fr_auto]"
              onSubmit={handleSearch}
            >
              <div>
                <Label htmlFor="campaign-search">Search campaigns</Label>
                <Input
                  id="campaign-search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by title or description"
                  className="h-11 rounded-lg border-slate-300"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit">
                  <Search className="h-4 w-4 mr-2" />
                  Apply
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-3">
          {campaigns.length === 0 ? (
            <Card className="border-dashed border-slate-300">
              <CardContent className="py-14 text-center text-slate-600">
                No campaigns found.
              </CardContent>
            </Card>
          ) : (
            campaigns.map((campaign) => (
              <Card key={campaign._id} className="surface-card shadow-sm">
                <CardContent className="py-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {campaign.title}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {campaign.description}
                      </p>
                      <p className="text-xs text-slate-500">
                        Owner: {campaign.owner?.name || "N/A"} (
                        {campaign.owner?.email || "N/A"})
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        ${Number(campaign.raised || 0).toFixed(2)} raised
                      </Badge>
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                        Target ${Number(campaign.target || 0).toFixed(2)}
                      </Badge>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedCampaignId(campaign._id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Campaign details</DialogTitle>
                            <DialogDescription>
                              Review donations and withdrawals before moderation
                              actions.
                            </DialogDescription>
                          </DialogHeader>

                          {isDetailsLoading ? (
                            <AdminDialogSkeleton />
                          ) : campaignDetails?.campaign ? (
                            <div className="space-y-5">
                              <Card className="surface-card">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-base">
                                    {campaignDetails.campaign.title}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                  <p className="text-slate-600">
                                    {campaignDetails.campaign.description}
                                  </p>
                                  <p>
                                    Raised: $
                                    {Number(
                                      campaignDetails.campaign.raised || 0,
                                    ).toFixed(2)}{" "}
                                    of $
                                    {Number(
                                      campaignDetails.campaign.target || 0,
                                    ).toFixed(2)}
                                  </p>
                                </CardContent>
                              </Card>

                              <div className="grid md:grid-cols-2 gap-3">
                                <Card className="surface-card">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-slate-500">
                                      Donations linked
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="text-2xl font-bold text-slate-900">
                                    {campaignDetails.donations?.length || 0}
                                  </CardContent>
                                </Card>
                                <Card className="surface-card">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-slate-500">
                                      Withdrawal requests linked
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="text-2xl font-bold text-slate-900">
                                    {campaignDetails.withdrawalRequests
                                      ?.length || 0}
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          ) : (
                            <div className="py-8 text-center text-slate-500">
                              Unable to load campaign details.
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Dialog
                        open={campaignToDelete?._id === campaign._id}
                        onOpenChange={(open) => {
                          if (open) {
                            setCampaignToDelete(campaign);
                            setDeleteConfirmText("");
                          } else {
                            setCampaignToDelete(null);
                            setDeleteConfirmText("");
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-rose-700">
                              <AlertTriangle className="h-5 w-5" />
                              Confirm campaign deletion
                            </DialogTitle>
                            <DialogDescription>
                              This action is irreversible. Type the exact
                              campaign title to proceed.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3">
                            <p className="text-sm text-slate-600">
                              Confirmation text:{" "}
                              <span className="font-semibold">
                                {campaign.title}
                              </span>
                            </p>
                            <Input
                              value={deleteConfirmText}
                              onChange={(e) =>
                                setDeleteConfirmText(e.target.value)
                              }
                              placeholder="Type campaign title"
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setCampaignToDelete(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleDelete}
                              disabled={deleteMutation.isPending}
                            >
                              {deleteMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : null}
                              Delete campaign
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card className="surface-card">
          <CardContent className="py-4 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
