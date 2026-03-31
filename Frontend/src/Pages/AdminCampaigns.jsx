import { useContext, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "@/Context/AuthContext";
import ROUTES from "@/routes/routes";
import {
  adminQueryKeys,
  deleteAdminCampaign,
  getAdminCampaignDetails,
  getAdminCampaigns,
} from "@/services/adminApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminDialogSkeleton, AdminPageSkeleton } from "@/components/admin/AdminSkeletons";
import {
  PageHeader,
  RefreshButton,
  StatusBadge,
  EmptyState,
  Pagination,
  FilterCard,
  InfoRow,
  DetailSection,
} from "@/components/admin/AdminUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Eye,
  Trash2,
  AlertTriangle,
  FolderKanban,
  Search,
  Loader2,
  HandCoins,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

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
      if (!user) navigate(`${ROUTES.LOGIN}?redirect=${ROUTES.ADMIN_CAMPAIGNS}`);
      else if (user.role !== "admin") navigate(ROUTES.HOME);
    }
  }, [loading, navigate, user]);

  const queryParams = useMemo(() => ({ page, search: searchTerm }), [page, searchTerm]);

  const { data: campaignsData, isLoading, isFetching } = useQuery({
    queryKey: adminQueryKeys.campaigns(queryParams),
    queryFn: () => getAdminCampaigns(queryParams),
    enabled: Boolean(user?.role === "admin"),
  });

  const campaigns = campaignsData?.campaigns ?? [];
  const totalPages = Number(campaignsData?.totalPages ?? 1);

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
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.campaignDetails(campaignId) }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboardStats }),
      ]);
      toast.success("Campaign deleted successfully");
      setCampaignToDelete(null);
      setDeleteConfirmText("");
      if (selectedCampaignId === campaignId) setSelectedCampaignId(null);
    },
    onError: (error) => toast.error(error.message || "Failed to delete campaign"),
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

  if (loading || isLoading) return <AdminPageSkeleton statCount={0} listCount={5} variant="list" />;

  return (
    <div className="surface-page min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">

        <PageHeader
          label="Admin · Campaigns"
          title="Campaign Moderation"
          description="Inspect campaign activity and remove campaigns when required."
          action={
            <RefreshButton
              disabled={isFetching}
              onClick={() => queryClient.invalidateQueries({ queryKey: ["admin", "campaigns"] })}
            />
          }
        />

        {/* Search filter */}
        <FilterCard>
          <form className="grid gap-3 md:grid-cols-[1fr_auto]" onSubmit={handleSearch}>
            <div>
              <Label htmlFor="campaign-search" className="text-xs font-medium text-muted-foreground">
                Search campaigns
              </Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="campaign-search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by title or description…"
                  className="pl-9 h-9"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button type="submit" size="sm">
                <Search className="h-3.5 w-3.5 mr-2" />
                Search
              </Button>
            </div>
          </form>
        </FilterCard>

        {/* Campaign list */}
        <div className="space-y-2">
          {campaigns.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No campaigns found"
              description={searchTerm ? `No results for "${searchTerm}". Try a different search.` : "There are no campaigns on this platform yet."}
            />
          ) : (
            campaigns.map((campaign) => {
              const raised = Number(campaign.raised ?? 0);
              const target = Number(campaign.target ?? 0);
              const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;

              return (
                <Card key={campaign._id} className="surface-card shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-foreground truncate">
                            {campaign.title}
                          </h3>
                          <StatusBadge status={campaign.status} />
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {campaign.description}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{campaign.owner?.name ?? "N/A"}</span>
                          <span className="text-border">·</span>
                          <span>{campaign.owner?.email ?? "N/A"}</span>
                        </div>
                        {/* Progress bar */}
                        <div className="flex items-center gap-2 pt-1">
                          <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-medium text-muted-foreground w-10 text-right shrink-0">
                            {currency.format(raised)} / {currency.format(target)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {/* Details dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedCampaignId(campaign._id)}>
                              <Eye className="h-3.5 w-3.5 mr-1.5" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Campaign details</DialogTitle>
                              <DialogDescription>
                                Review donations and withdrawals before taking moderation actions.
                              </DialogDescription>
                            </DialogHeader>

                            {isDetailsLoading ? (
                              <AdminDialogSkeleton />
                            ) : campaignDetails?.campaign ? (
                              <div className="space-y-5">
                                <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-base font-semibold text-foreground">
                                      {campaignDetails.campaign.title}
                                    </h3>
                                    <StatusBadge status={campaignDetails.campaign.status} />
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {campaignDetails.campaign.description}
                                  </p>
                                  <p className="text-sm text-foreground">
                                    <span className="text-muted-foreground">Raised: </span>
                                    <span className="font-semibold">{currency.format(Number(campaignDetails.campaign.raised ?? 0))}</span>
                                    <span className="text-muted-foreground"> of </span>
                                    <span className="font-semibold">{currency.format(Number(campaignDetails.campaign.target ?? 0))}</span>
                                  </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-3">
                                  <div className="rounded-lg border border-border bg-background p-4">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Donations linked</p>
                                    <p className="text-2xl font-bold text-foreground mt-1">
                                      {campaignDetails.donations?.length ?? 0}
                                    </p>
                                  </div>
                                  <div className="rounded-lg border border-border bg-background p-4">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Withdrawal requests</p>
                                    <p className="text-2xl font-bold text-foreground mt-1">
                                      {campaignDetails.withdrawalRequests?.length ?? 0}
                                    </p>
                                  </div>
                                </div>

                                {campaignDetails.donations?.length > 0 && (
                                  <DetailSection icon={HandCoins} title="Campaign Donors">
                                    <div className="space-y-2">
                                      {campaignDetails.donations.map((donation) => (
                                        <div key={donation._id} className="grid grid-cols-2 md:grid-cols-4 gap-3 rounded-md border border-border bg-background p-3">
                                          <InfoRow
                                            label="Donor"
                                            value={
                                              donation.isAnonymous ? "Anonymous" :
                                              donation.donor?.name ?? "N/A"
                                            }
                                          />
                                          <InfoRow label="Email" value={donation.donorEmail ?? "N/A"} />
                                          <InfoRow label="Amount" value={`$${Number(donation.amount).toFixed(2)}`} />
                                          <InfoRow label="Date" value={format(new Date(donation.createdAt), "PP")} />
                                        </div>
                                      ))}
                                    </div>
                                  </DetailSection>
                                )}
                              </div>
                            ) : (
                              <EmptyState title="Unable to load campaign details" />
                            )}
                          </DialogContent>
                        </Dialog>

                        {/* Delete dialog */}
                        <Dialog
                          open={campaignToDelete?._id === campaign._id}
                          onOpenChange={(open) => {
                            if (open) { setCampaignToDelete(campaign); setDeleteConfirmText(""); }
                            else { setCampaignToDelete(null); setDeleteConfirmText(""); }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                              Delete
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-sm">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="h-5 w-5" />
                                Delete campaign
                              </DialogTitle>
                              <DialogDescription>
                                This action is permanent and cannot be undone. Type the exact campaign title to confirm.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3">
                              <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
                                <p className="text-xs text-muted-foreground">Confirm by typing:</p>
                                <p className="text-sm font-semibold text-foreground mt-0.5">{campaign.title}</p>
                              </div>
                              <Input
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="Type campaign title…"
                              />
                            </div>
                            <DialogFooter>
                              <Button variant="outline" size="sm" onClick={() => setCampaignToDelete(null)}>
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleDelete}
                                disabled={deleteMutation.isPending || deleteConfirmText !== campaign.title}
                              >
                                {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                Delete permanently
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          isFetching={isFetching}
          onPrev={() => setPage((p) => Math.max(p - 1, 1))}
          onNext={() => setPage((p) => p + 1)}
        />
      </div>
    </div>
  );
}
