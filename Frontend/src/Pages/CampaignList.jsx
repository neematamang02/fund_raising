import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FundraisingButton } from "@/components/ui/fundraising-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Heart,
  Target,
  Users,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  AlertTriangle,
  Grid3X3,
  List,
} from "lucide-react";

export function CampaignList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const itemsPerPage = 9;

  const {
    data: campaignsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const response = await fetch("/api/campaigns");
      if (!response.ok) {
        throw new Error("Failed to fetch campaigns");
      }
      const data = await response.json();
      return data;
    },
  });

  // Extract campaigns array from response
  const campaigns = campaignsData?.campaigns || [];

  // Filter and sort campaigns
  const filteredAndSortedCampaigns = useMemo(() => {
    if (!campaigns || !Array.isArray(campaigns) || campaigns.length === 0)
      return [];

    const filtered = campaigns.filter((campaign) => {
      if (!campaign) return false;

      const title = campaign.title || "";
      const description = campaign.description || "";
      const matchesSearch =
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || campaign.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    // Sort campaigns
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest": {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        case "oldest": {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }
        case "target-high": {
          return (b.target || 0) - (a.target || 0);
        }
        case "target-low": {
          return (a.target || 0) - (b.target || 0);
        }
        case "progress": {
          const progressB = (b.raised || 0) / (b.target || 1);
          const progressA = (a.raised || 0) / (a.target || 1);
          return progressB - progressA;
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [campaigns, searchTerm, categoryFilter, sortBy]);

  // Calculate pagination values
  const totalPages = Math.ceil(
    filteredAndSortedCampaigns.length / itemsPerPage,
  );
  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedCampaigns.slice(
      startIndex,
      startIndex + itemsPerPage,
    );
  }, [filteredAndSortedCampaigns, currentPage]);

  // Get unique categories from campaigns
  const categories = useMemo(() => {
    if (!campaigns || !Array.isArray(campaigns)) return [];
    const uniqueCategories = [
      ...new Set(campaigns.map((c) => c?.category).filter(Boolean)),
    ];
    return uniqueCategories;
  }, [campaigns]);

  // Handlers for pagination
  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToPrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getProgressPercentage = (raised, target) => {
    if (target <= 0) return 0;
    return Math.min(100, Math.round((raised / target) * 100));
  };

  const getUrgencyBadge = (campaign) => {
    const progress = getProgressPercentage(
      campaign.raised || 0,
      campaign.target,
    );
    const daysLeft = campaign.daysLeft || 30;

    if (daysLeft <= 7 && progress < 80) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <Clock className="h-3 w-3 mr-1" />
          Urgent
        </Badge>
      );
    }
    if (progress >= 90) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <TrendingUp className="h-3 w-3 mr-1" />
          Almost There!
        </Badge>
      );
    }
    return null;
  };

  const getCategoryColor = (category) => {
    const colors = {
      "Water & Sanitation": "bg-blue-100 text-blue-800",
      Education: "bg-purple-100 text-purple-800",
      Healthcare: "bg-red-100 text-red-800",
      Environment: "bg-green-100 text-green-800",
      Community: "bg-amber-100 text-amber-800",
      Emergency: "bg-orange-100 text-orange-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="surface-page min-h-screen px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-secondary"></div>
            <p className="text-slate-600">Loading campaigns...</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="surface-card overflow-hidden rounded-xl">
                <div className="h-48 animate-pulse bg-slate-200"></div>
                <CardContent className="p-6 space-y-4">
                  <div className="h-4 animate-pulse rounded bg-slate-200"></div>
                  <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200"></div>
                  <div className="h-8 animate-pulse rounded bg-slate-200"></div>
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
      <div className="surface-page flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">
            Error Loading Campaigns
          </h2>
          <p className="mb-6 text-slate-600">{error.message}</p>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-page min-h-screen px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <Badge className="mb-5 bg-blue-100 px-4 py-1.5 text-blue-800">
            <Sparkles className="h-4 w-4 mr-2" />
            Explore Campaigns
          </Badge>
          <h1 className="mb-4 text-4xl font-bold text-slate-900 md:text-5xl">
            Support a Cause Today
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600">
            Discover meaningful causes and support campaigns that are creating
            positive change in communities worldwide.
          </p>
        </div>

        <Card className="surface-card mb-8 rounded-xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-11 rounded-lg border-slate-300 pl-10"
                />
              </div>

              <Select
                value={categoryFilter}
                onValueChange={(value) => {
                  setCategoryFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-11 rounded-lg border-slate-300">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-11 rounded-lg border-slate-300">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="target-high">Highest Goal</SelectItem>
                  <SelectItem value="target-low">Lowest Goal</SelectItem>
                  <SelectItem value="progress">Most Progress</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <FundraisingButton
                  variant={viewMode === "grid" ? "trust" : "ghost-trust"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="flex-1"
                >
                  <Grid3X3 className="h-4 w-4" />
                </FundraisingButton>
                <FundraisingButton
                  variant={viewMode === "list" ? "trust" : "ghost-trust"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="flex-1"
                >
                  <List className="h-4 w-4" />
                </FundraisingButton>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>
                Showing {paginatedCampaigns.length} of{" "}
                {filteredAndSortedCampaigns.length} campaigns
              </span>
              {searchTerm && <span>Search results for "{searchTerm}"</span>}
            </div>
          </CardContent>
        </Card>

        {/* Campaign Grid/List */}
        {paginatedCampaigns && paginatedCampaigns.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                : "space-y-6 mb-8"
            }
          >
            {paginatedCampaigns.map((campaign) => {
              const progress = getProgressPercentage(
                campaign.raised || 0,
                campaign.target,
              );
              const isEnded =
                campaign.status === "expired" || campaign.status === "inactive";

              return (
                <Card
                  key={campaign._id}
                  className={`surface-card group overflow-hidden rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg ${
                    viewMode === "list" ? "flex flex-col md:flex-row" : ""
                  }`}
                >
                  <div
                    className={`relative overflow-hidden ${
                      viewMode === "list" ? "md:w-1/3 h-48 md:h-auto" : "h-48"
                    }`}
                  >
                    <img
                      src={campaign.imageURL || "/placeholder.svg"}
                      alt={campaign.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {campaign.category && (
                        <Badge className={getCategoryColor(campaign.category)}>
                          {campaign.category}
                        </Badge>
                      )}
                      {isEnded && (
                        <Badge className="bg-slate-800 text-white border-slate-700">
                          Ended
                        </Badge>
                      )}
                      {getUrgencyBadge(campaign)}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/75 to-transparent p-4">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                        <TrendingUp className="h-4 w-4" />
                        <span>{progress}% funded</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-6 space-y-4 ${
                      viewMode === "list"
                        ? "md:w-2/3 flex flex-col justify-between"
                        : ""
                    }`}
                  >
                    <div className="space-y-3">
                      <h2 className="line-clamp-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-700">
                        {campaign.title}
                      </h2>
                      <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">
                        {campaign.description}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-2 rounded-full bg-primary transition-all duration-700 ease-out"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <div>
                          <div className="text-lg font-bold text-slate-900">
                            ${(campaign.raised || 0).toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1 text-slate-500">
                            <Target className="h-3 w-3" />
                            raised of ${campaign.target.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-secondary">
                            {progress}%
                          </div>
                          <div className="text-xs text-slate-500">complete</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="h-4 w-4" />
                        <span>
                          {Math.floor((campaign.raised || 0) / 50)} supporters
                        </span>
                      </div>
                    </div>

                    {isEnded ? (
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full"
                        disabled
                      >
                        Campaign Ended
                      </Button>
                    ) : (
                      <Link to={`/donate/${campaign._id}`} className="block">
                        <Button
                          className="w-full bg-primary hover:bg-primary/90"
                          size="lg"
                        >
                          <Heart className="h-5 w-5" />
                          Support This Cause
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="surface-card rounded-xl">
            <CardContent className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">
                No Campaigns Found
              </h3>
              <p className="mb-6 text-slate-600">
                {searchTerm || categoryFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No campaigns are available at the moment"}
              </p>
              {(searchTerm || categoryFilter !== "all") && (
                <FundraisingButton
                  variant="outline-trust"
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                    setCurrentPage(1);
                  }}
                >
                  Clear Filters
                </FundraisingButton>
              )}
            </CardContent>
          </Card>
        )}

        {totalPages > 1 && (
          <Card className="surface-card rounded-xl">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-600">
                  Page {currentPage} of {totalPages}
                </div>

                <div className="flex items-center gap-2">
                  <FundraisingButton
                    variant="ghost-trust"
                    size="sm"
                    onClick={goToPrevious}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </FundraisingButton>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <FundraisingButton
                          key={pageNum}
                          variant={
                            pageNum === currentPage ? "trust" : "ghost-trust"
                          }
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className="w-10 h-10 p-0"
                        >
                          {pageNum}
                        </FundraisingButton>
                      );
                    })}
                  </div>

                  <FundraisingButton
                    variant="ghost-trust"
                    size="sm"
                    onClick={goToNext}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </FundraisingButton>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
