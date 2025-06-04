import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash, Plus, Calendar, Target } from "lucide-react";
import { Link } from "react-router-dom";
import ROUTES from "@/routes/routes";
import { FundraisingButton } from "@/components/ui/fundraising-button";
import { toast } from "sonner";

const fetchMyCampaigns = async (token, userId) => {
  const response = await fetch(`/api/campaigns?owner=${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch campaigns");
  }
  return response.json();
};

const updateCampaign = async ({ campaignId, token, data }) => {
  const response = await fetch(`/api/campaigns/${campaignId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update campaign");
  }
  return response.json();
};

const deleteCampaign = async ({ campaignId, token }) => {
  const response = await fetch(`/api/campaigns/${campaignId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete campaign");
  }
  return response.json();
};

export default function MyCampaigns() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    imageURL: "",
    target: 0,
  });

  // Redirect if not authenticated or not an organizer
  useEffect(() => {
    if (!user || !token) {
      navigate(ROUTES.LOGIN);
    } else if (user.role !== "organizer") {
      navigate(ROUTES.HOME);
    }
  }, [user, token, navigate]);

  // Fetch campaigns using React Query
  const {
    data: campaigns = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["myCampaigns", user?.userId],
    queryFn: () => fetchMyCampaigns(token, user.userId),
    enabled: !!user && !!token && user.role === "organizer",
  });

  // Update campaign mutation
  const updateMutation = useMutation({
    mutationFn: updateCampaign,
    onSuccess: () => {
      toast.success("Campaign updated successfully");
      setEditingCampaign(null);
      queryClient.invalidateQueries(["myCampaigns", user.userId]);
    },
    onError: (error) => {
      toast.error(`Failed to update campaign: ${error.message}`);
    },
  });

  // Delete campaign mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCampaign,
    onSuccess: () => {
      toast.success("Campaign deleted successfully");
      queryClient.invalidateQueries(["myCampaigns", user.userId]);
    },
    onError: (error) => {
      toast.error(`Failed to delete campaign: ${error.message}`);
    },
  });

  const handleEdit = useCallback((campaign) => {
    setEditingCampaign(campaign);
    setEditForm({
      title: campaign.title,
      description: campaign.description,
      imageURL: campaign.imageURL,
      target: campaign.target,
    });
  }, []);

  const handleUpdate = () => {
    if (!editingCampaign) return;
    updateMutation.mutate({
      campaignId: editingCampaign._id,
      token,
      data: editForm,
    });
  };

  const handleDelete = (campaignId) => {
    deleteMutation.mutate({ campaignId, token });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getProgressPercentage = (raised, target) => {
    return Math.min((raised / target) * 100, 100);
  };

  const getStatusBadge = (raised, target) => {
    const percentage = getProgressPercentage(raised, target);
    if (percentage >= 100) {
      return <Badge className="bg-green-500 text-white">Completed</Badge>;
    } else if (percentage >= 75) {
      return <Badge className="bg-blue-500 text-white">Almost There</Badge>;
    } else if (percentage >= 25) {
      return <Badge className="bg-yellow-500 text-white">In Progress</Badge>;
    }
    return <Badge className="bg-gray-500 text-white">Just Started</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="text-center p-6">
          <CardContent>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Campaigns
            </h3>
            <p className="text-gray-600">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                My Campaigns
              </h1>
              <p className="text-gray-600">
                Manage and track your fundraising campaigns
              </p>
            </div>
            <Link to={ROUTES.CREATE_CAMPAIGN}>
              <FundraisingButton variant="donate" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Create New Campaign
              </FundraisingButton>
            </Link>
          </div>
        </div>

        {campaigns.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No campaigns yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start your fundraising journey by creating your first campaign
              </p>
              <Link to={ROUTES.CREATE_CAMPAIGN}>
                <FundraisingButton variant="donate">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Campaign
                </FundraisingButton>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Card
                key={campaign._id}
                className="overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="relative">
                  <img
                    src={campaign.imageURL || "/placeholder.svg"}
                    alt={campaign.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    {getStatusBadge(campaign.raised, campaign.target)}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold line-clamp-2">
                    {campaign.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {campaign.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Raised: {formatCurrency(campaign.raised)}</span>
                        <span>Goal: {formatCurrency(campaign.target)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${getProgressPercentage(
                              campaign.raised,
                              campaign.target
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      Created{" "}
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <FundraisingButton
                    variant="trust"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(campaign)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </FundraisingButton>
                  <Dialog>
                    <DialogTrigger asChild>
                      <FundraisingButton variant="destructive" size="sm">
                        <Trash className="w-4 h-4" />
                      </FundraisingButton>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Campaign</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete "{campaign.title}"?
                          This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <FundraisingButton variant="outline" onClick={() => {}}>
                          Cancel
                        </FundraisingButton>
                        <FundraisingButton
                          variant="destructive"
                          onClick={() => handleDelete(campaign._id)}
                        >
                          Delete
                        </FundraisingButton>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        <Dialog
          open={!!editingCampaign}
          onOpenChange={() => setEditingCampaign(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Campaign</DialogTitle>
              <DialogDescription>
                Update your campaign details below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Campaign Title</Label>
                <Input
                  id="title"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  placeholder="Enter campaign title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  placeholder="Describe your campaign"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageURL">Image URL</Label>
                <Input
                  id="imageURL"
                  value={editForm.imageURL}
                  onChange={(e) =>
                    setEditForm({ ...editForm, imageURL: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target">Target Amount ($)</Label>
                <Input
                  id="target"
                  type="number"
                  value={editForm.target}
                  onChange={(e) =>
                    setEditForm({ ...editForm, target: Number(e.target.value) })
                  }
                  placeholder="10000"
                />
              </div>
            </div>
            <DialogFooter>
              <FundraisingButton
                variant="outline"
                onClick={() => setEditingCampaign(null)}
              >
                Cancel
              </FundraisingButton>
              <FundraisingButton variant="donate" onClick={handleUpdate}>
                Update Campaign
              </FundraisingButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
