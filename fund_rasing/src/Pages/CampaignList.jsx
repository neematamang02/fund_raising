import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
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
    data: campaigns,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const response = await fetch("/api/campaigns");
      if (!response.ok) {
        throw new Error("Failed to fetch campaigns");
      }
      return response.json();
    },
  });

  // Filter and sort campaigns
  const filteredAndSortedCampaigns = useMemo(() => {
    if (!campaigns) return [];

    const filtered = campaigns.filter((campaign) => {
      const matchesSearch =
        campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || campaign.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    // Sort campaigns
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "target-high":
          return b.target - a.target;
        case "target-low":
          return a.target - b.target;
        case "progress":
          return b.raised / b.target - a.raised / a.target;
        default:
          return 0;
      }
    });

    return filtered;
  }, [campaigns, searchTerm, categoryFilter, sortBy]);

  // Calculate pagination values
  const totalPages = Math.ceil(
    filteredAndSortedCampaigns.length / itemsPerPage
  );
  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedCampaigns.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredAndSortedCampaigns, currentPage]);

  // Get unique categories from campaigns
  const categories = useMemo(() => {
    if (!campaigns) return [];
    const uniqueCategories = [
      ...new Set(campaigns.map((c) => c.category).filter(Boolean)),
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
      campaign.target
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading campaigns...</p>
          </div>

          {/* Loading Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                className="bg-white shadow-lg border-0 overflow-hidden"
              >
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <CardContent className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Campaigns
          </h2>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <FundraisingButton
            variant="trust"
            onClick={() => window.location.reload()}
          >
            Try Again
          </FundraisingButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4 mr-2" />
            Explore Campaigns
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Make a Difference
            </span>
            <br />
            <span className="text-gray-800">Today</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover meaningful causes and support campaigns that are creating
            positive change in communities worldwide.
          </p>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 h-11 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>

              {/* Category Filter */}
              <Select
                value={categoryFilter}
                onValueChange={(value) => {
                  setCategoryFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-blue-500 rounded-xl">
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

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-blue-500 rounded-xl">
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

              {/* View Mode */}
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

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-gray-600">
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
                campaign.target
              );

              return (
                <Card
                  key={campaign._id}
                  className={`bg-white shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group ${
                    viewMode === "list" ? "flex flex-col md:flex-row" : ""
                  }`}
                >
                  {/* Image */}
                  <div
                    className={`relative overflow-hidden ${
                      viewMode === "list" ? "md:w-1/3 h-48 md:h-auto" : "h-48"
                    }`}
                  >
                    <img
                      src={campaign.imageURL || "/placeholder.svg"}
                      alt={campaign.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Overlay Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {campaign.category && (
                        <Badge className={getCategoryColor(campaign.category)}>
                          {campaign.category}
                        </Badge>
                      )}
                      {getUrgencyBadge(campaign)}
                    </div>

                    {/* Progress Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <div className="flex items-center gap-2 text-white text-sm">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-medium">{progress}% funded</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div
                    className={`p-6 space-y-4 ${
                      viewMode === "list"
                        ? "md:w-2/3 flex flex-col justify-between"
                        : ""
                    }`}
                  >
                    <div className="space-y-3">
                      <h2 className="font-bold text-xl text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {campaign.title}
                      </h2>
                      <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                        {campaign.description}
                      </p>
                    </div>

                    {/* Progress Section */}
                    <div className="space-y-3">
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <div>
                          <div className="font-bold text-lg text-gray-900">
                            ${(campaign.raised || 0).toLocaleString()}
                          </div>
                          <div className="text-gray-500 flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            raised of ${campaign.target.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-blue-600">
                            {progress}%
                          </div>
                          <div className="text-gray-500 text-xs">complete</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Users className="h-4 w-4" />
                        <span>
                          {Math.floor((campaign.raised || 0) / 50)} supporters
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link to={`/donate/${campaign._id}`} className="block">
                      <FundraisingButton
                        variant="donate"
                        size="lg"
                        fullWidth
                        className="group"
                      >
                        <Heart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        Support This Cause
                      </FundraisingButton>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Campaigns Found
              </h3>
              <p className="text-gray-600 mb-6">
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

        {/* Pagination */}
        {totalPages > 1 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
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

                  {/* Page Numbers */}
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
