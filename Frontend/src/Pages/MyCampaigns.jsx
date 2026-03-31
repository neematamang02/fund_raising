import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "@/Context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  Plus,
  Calendar,
  Target,
  Users,
  DollarSign,
  Loader2,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import ROUTES from "@/routes/routes";
import { toast } from "sonner";

// ─── API helpers ──────────────────────────────────────────────────────────────

const fetchMyCampaigns = async (token, userId) => {
  const res = await fetch(`/api/campaigns?owner=${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch campaigns");
  const data = await res.json();
  return data.campaigns || [];
};

const updateCampaign = async ({ campaignId, token, data }) => {
  const res = await fetch(`/api/campaigns/${campaignId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update campaign");
  }
  return res.json();
};

const deleteCampaign = async ({ campaignId, token }) => {
  const res = await fetch(`/api/campaigns/${campaignId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete campaign");
  }
  return res.json();
};

const fetchDonors = async (token, campaignId) => {
  const res = await fetch(`/api/campaigns/${campaignId}/donors`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch donor list");
  }
  return res.json();
};

const toDateTimeLocalValue = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const offsetMs = parsed.getTimezoneOffset() * 60000;
  return new Date(parsed.getTime() - offsetMs).toISOString().slice(0, 16);
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

const getProgress = (raised, target) =>
  target > 0 ? Math.min((raised / target) * 100, 100) : 0;

// ─── Status badge ─────────────────────────────────────────────────────────────

function CampaignStatusBadge({ raised, target }) {
  const pct = getProgress(raised, target);
  if (pct >= 100)
    return <Badge className="bg-primary/15 text-primary border-primary/25">Completed</Badge>;
  if (pct >= 75)
    return <Badge className="bg-chart-2/15 text-chart-2 border-chart-2/25">Almost There</Badge>;
  if (pct >= 25)
    return <Badge className="bg-chart-4/15 text-chart-4 border-chart-4/25">In Progress</Badge>;
  return <Badge variant="secondary">Just Started</Badge>;
}

// ─── Campaign card ────────────────────────────────────────────────────────────

function CampaignCard({ campaign, token, onEdit, onDelete, onShowDonors }) {
  const pct = getProgress(campaign.raised, campaign.target);

  return (
    <Card className="overflow-hidden border bg-card flex flex-col transition-shadow hover:shadow-md">
      <div className="relative">
        <img
          src={campaign.imageURL || "/placeholder.svg"}
          alt={campaign.title}
          className="w-full h-44 object-cover"
        />
        <div className="absolute top-3 right-3">
          <CampaignStatusBadge raised={campaign.raised} target={campaign.target} />
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold line-clamp-2 text-foreground">
          {campaign.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {campaign.description}
        </p>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pt-0">
        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-muted-foreground">
            <span className="text-primary font-semibold">{formatCurrency(campaign.raised)} raised</span>
            <span>Goal: {formatCurrency(campaign.target)}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground text-right">{pct.toFixed(0)}%</p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          Created {new Date(campaign.createdAt).toLocaleDateString()}
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 pt-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(campaign)}
        >
          <Edit className="h-3.5 w-3.5 mr-1.5" />
          Edit
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onShowDonors(campaign._id)}
            >
              <Users className="h-3.5 w-3.5 mr-1.5" />
              Donors
            </Button>
          </DialogTrigger>
        </Dialog>

        {campaign.raised > 0 && (
          <Link to={`/withdrawal-request/${campaign._id}`} className="flex-1">
            <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
              <DollarSign className="h-3.5 w-3.5 mr-1.5" />
              Withdraw
            </Button>
          </Link>
        )}

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Campaign</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>"{campaign.title}"</strong>? This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm">Cancel</Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(campaign._id)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function MyCampaigns() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editingCampaign, setEditingCampaign] = useState(null);
  const [showDonorsFor, setShowDonorsFor] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    imageURL: "",
    target: 0,
    deadlineAt: "",
  });

  useEffect(() => {
    if (!user || !token) navigate(ROUTES.LOGIN);
    else if (user.role !== "organizer") navigate(ROUTES.HOME);
  }, [user, token, navigate]);

  const { data: campaigns = [], isLoading, error } = useQuery({
    queryKey: ["myCampaigns", user?.userId],
    queryFn: () => fetchMyCampaigns(token, user.userId),
    enabled: !!user && !!token && user.role === "organizer",
  });

  const updateMutation = useMutation({
    mutationFn: updateCampaign,
    onSuccess: () => {
      toast.success("Campaign updated successfully");
      setEditingCampaign(null);
      queryClient.invalidateQueries(["myCampaigns", user.userId]);
    },
    onError: (err) => toast.error(`Failed to update: ${err.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCampaign,
    onSuccess: () => {
      toast.success("Campaign deleted");
      queryClient.invalidateQueries(["myCampaigns", user.userId]);
    },
    onError: (err) => toast.error(`Failed to delete: ${err.message}`),
  });

  const { data: donors = [], isLoading: isDonorsLoading, error: donorsError } = useQuery({
    queryKey: ["donors", showDonorsFor],
    queryFn: () => fetchDonors(token, showDonorsFor),
    enabled: !!showDonorsFor,
  });

  const handleEdit = useCallback((campaign) => {
    setEditingCampaign(campaign);
    setEditImageFile(null);
    setEditImagePreview(campaign.imageURL || "");
    setEditForm({
      title: campaign.title,
      description: campaign.description,
      imageURL: campaign.imageURL,
      target: campaign.target,
      deadlineAt: toDateTimeLocalValue(campaign.deadlineAt),
    });
  }, []);

  useEffect(() => {
    if (!editingCampaign) { setEditImagePreview(""); return; }
    if (editImageFile) {
      const url = URL.createObjectURL(editImageFile);
      setEditImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setEditImagePreview(editForm.imageURL || "");
  }, [editImageFile, editForm.imageURL, editingCampaign]);

  const normalizeImageUrl = (value) => {
    if (!value?.trim()) return "";
    try {
      const parsed = new URL(value.trim());
      if (!["http:", "https:"].includes(parsed.protocol)) return null;
      return parsed.toString();
    } catch { return null; }
  };

  const handleUpdate = () => {
    if (!editingCampaign) return;
    const normalizedUrl = normalizeImageUrl(editForm.imageURL);
    const hasFile = Boolean(editImageFile);
    const hasUrl = Boolean(normalizedUrl);
    if (normalizedUrl === null) { toast.error("Please provide a valid image URL (http/https)."); return; }
    if (hasFile === hasUrl) { toast.error("Choose exactly one image source: upload a file or provide a URL."); return; }
    const payload = new FormData();
    payload.append("title", editForm.title);
    payload.append("description", editForm.description);
    payload.append("target", String(Number(editForm.target)));
    if (editForm.deadlineAt) payload.append("deadlineAt", new Date(editForm.deadlineAt).toISOString());
    if (hasFile) payload.append("imageFile", editImageFile);
    else payload.append("imageURL", normalizedUrl);
    updateMutation.mutate({ campaignId: editingCampaign._id, token, data: payload });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen surface-page p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen surface-page p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
          <p className="text-lg font-semibold text-foreground">Error loading campaigns</p>
          <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen surface-page px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Organizer</p>
            <h1 className="text-2xl font-bold text-foreground">My Campaigns</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage and track your fundraising campaigns</p>
          </div>
          <Link to={ROUTES.CREATE_CAMPAIGN}>
            <Button className="bg-primary hover:bg-primary/90" size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Create Campaign
            </Button>
          </Link>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Total", value: campaigns.length, icon: Target, accent: "text-foreground" },
            { label: "Total Raised", value: formatCurrency(campaigns.reduce((s, c) => s + (c.raised || 0), 0)), icon: TrendingUp, accent: "text-primary" },
            { label: "Goals Set", value: formatCurrency(campaigns.reduce((s, c) => s + (c.target || 0), 0)), icon: DollarSign, accent: "text-chart-2" },
          ].map(({ label, value, icon: Icon, accent }) => (
            <Card key={label} className="border bg-card">
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className={`h-5 w-5 shrink-0 ${accent}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={`text-lg font-bold ${accent}`}>{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty state */}
        {campaigns.length === 0 ? (
          <Card className="border bg-card">
            <CardContent className="py-16 text-center">
              <Target className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-lg font-semibold text-foreground">No campaigns yet</p>
              <p className="text-sm text-muted-foreground mt-1 mb-6">
                Start your fundraising journey by creating your first campaign.
              </p>
              <Link to={ROUTES.CREATE_CAMPAIGN}>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Create Your First Campaign
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign._id}
                campaign={campaign}
                token={token}
                onEdit={handleEdit}
                onDelete={(id) => deleteMutation.mutate({ campaignId: id, token })}
                onShowDonors={setShowDonorsFor}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editingCampaign} onOpenChange={() => setEditingCampaign(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
            <DialogDescription>Update your campaign details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-title">Campaign Title</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea
                id="edit-desc"
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-url">Image URL</Label>
              <Input
                id="edit-url"
                value={editForm.imageURL}
                onChange={(e) => { setEditImageFile(null); setEditForm({ ...editForm, imageURL: e.target.value }); }}
                placeholder="https://example.com/image.jpg"
              />
              <div className="flex items-center gap-2 py-1">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-file">Upload Image</Label>
                <Input
                  id="edit-file"
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setEditImageFile(f);
                    if (f) setEditForm((prev) => ({ ...prev, imageURL: "" }));
                  }}
                />
              </div>
              {editImagePreview && (
                <img src={editImagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg border" />
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-target">Target Amount ($)</Label>
              <Input
                id="edit-target"
                type="number"
                value={editForm.target}
                onChange={(e) => setEditForm({ ...editForm, target: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-deadline">Campaign End Date</Label>
              <Input
                id="edit-deadline"
                type="datetime-local"
                min={new Date().toISOString().slice(0, 16)}
                value={editForm.deadlineAt}
                onChange={(e) => setEditForm({ ...editForm, deadlineAt: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingCampaign(null)}>Cancel</Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Update Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Donors dialog */}
      <Dialog open={!!showDonorsFor} onOpenChange={() => setShowDonorsFor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Donor List</DialogTitle>
            <DialogDescription>
              {isDonorsLoading ? "Loading donors…" : donorsError ? `Error: ${donorsError.message}` : `${donors.length} donor(s)`}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2">
            {isDonorsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : donorsError ? (
              <p className="text-sm text-destructive py-4">Failed to load donors.</p>
            ) : donors.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No donors yet for this campaign.</p>
            ) : (
              <div className="overflow-auto max-h-80 rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      {["Name", "Email", "Amount", "Date"].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {donors.map((donation) => {
                      const isAnon = donation.isAnonymous === true;
                      return (
                        <tr key={donation._id} className="hover:bg-accent/30 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-foreground">
                            {isAnon ? "Anonymous" : donation.donor?.name || donation.payerName || "–"}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">
                            {isAnon ? "Hidden" : donation.donor?.email || donation.donorEmail || "–"}
                          </td>
                          <td className="px-4 py-2.5 font-semibold text-primary">
                            {formatCurrency(donation.amount)}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">
                            {new Date(donation.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDonorsFor(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
