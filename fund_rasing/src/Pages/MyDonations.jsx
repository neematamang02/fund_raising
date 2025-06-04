import { useContext, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FundraisingButton } from "@/components/ui/fundraising-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Heart,
  TrendingUp,
  Calendar,
  DollarSign,
  Target,
  Award,
  Download,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  Gift,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function MyDonations() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [timeFilter, setTimeFilter] = useState("all");

  const {
    data: donations = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["myDonations"],
    queryFn: async () => {
      const res = await fetch("/api/donations/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Failed to load donations");
      return res.json();
    },
  });
  const { data: campaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const response = await fetch("/api/campaigns");
      if (!response.ok) {
        throw new Error("Failed to fetch campaigns");
      }
      return response.json();
    },
  });

  // If not logged in, show login prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Sign In Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please log in to view your donation history
          </p>
          <FundraisingButton variant="trust" onClick={() => navigate("/login")}>
            Sign In
          </FundraisingButton>
        </div>
      </div>
    );
  }

  // Calculate donation statistics
  const donationStats = useMemo(() => {
    if (!donations.length) return null;

    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
    const totalDonations = donations.length;
    const averageDonation = totalAmount / totalDonations;
    const completedDonations = donations.filter(
      (d) => d.status === "completed"
    ).length;
    const successRate = (completedDonations / totalDonations) * 100;

    // Group by month for trend analysis
    const monthlyData = donations.reduce((acc, donation) => {
      const month = new Date(donation.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
      acc[month] = (acc[month] || 0) + donation.amount;
      return acc;
    }, {});

    // Get unique campaigns supported
    const uniqueCampaigns = new Set(donations.map((d) => d.campaign._id)).size;

    return {
      totalAmount,
      totalDonations,
      averageDonation,
      successRate,
      uniqueCampaigns,
      monthlyData,
      recentDonation: donations[0]?.createdAt,
    };
  }, [donations]);

  // Filter and sort donations
  const filteredDonations = useMemo(() => {
    const filtered = donations.filter((donation) => {
      const matchesSearch = donation.campaign.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || donation.status === statusFilter;

      let matchesTime = true;
      if (timeFilter !== "all") {
        const donationDate = new Date(donation.createdAt);
        const now = new Date();

        switch (timeFilter) {
          case "week":
            matchesTime = now - donationDate <= 7 * 24 * 60 * 60 * 1000;
            break;
          case "month":
            matchesTime = now - donationDate <= 30 * 24 * 60 * 60 * 1000;
            break;
          case "year":
            matchesTime = now - donationDate <= 365 * 24 * 60 * 60 * 1000;
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesTime;
    });

    // Sort donations
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "amount-high":
          return b.amount - a.amount;
        case "amount-low":
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [donations, searchTerm, statusFilter, sortBy, timeFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            {status}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your donation history...</p>
          </div>

          {/* Loading Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-white shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
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
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Donations
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

  if (donations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 text-sm font-medium mb-6">
              <Heart className="h-4 w-4 mr-2" />
              Donation History
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Your Giving
              </span>
              <br />
              <span className="text-gray-800">Journey</span>
            </h1>
          </div>

          {/* Empty State */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Start Your Impact Journey
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                You haven't made any donations yet. Discover meaningful causes
                and start making a difference in communities around the world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/donate">
                  <FundraisingButton variant="donate" size="lg">
                    <Heart className="h-5 w-5" />
                    Browse Campaigns
                  </FundraisingButton>
                </Link>
                <Link to="/campaigns">
                  <FundraisingButton variant="outline-trust" size="lg">
                    <Target className="h-5 w-5" />
                    Explore Causes
                  </FundraisingButton>
                </Link>
              </div>
            </CardContent>
          </Card>
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
            <Heart className="h-4 w-4 mr-2" />
            Your Impact Dashboard
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Donation
            </span>
            <br />
            <span className="text-gray-800">History</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Track your giving journey and see the positive impact you've created
            in communities worldwide.
          </p>
        </div>

        {/* Statistics Cards */}
        {donationStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">
                      Total Donated
                    </p>
                    <p className="text-3xl font-bold">
                      ${donationStats.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">
                      Donations Made
                    </p>
                    <p className="text-3xl font-bold">
                      {donationStats.totalDonations}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">
                      Campaigns Supported
                    </p>
                    <p className="text-3xl font-bold">
                      {donationStats.uniqueCampaigns}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Target className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm font-medium">
                      Average Donation
                    </p>
                    <p className="text-3xl font-bold">
                      ${donationStats.averageDonation.toFixed(0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Impact Summary */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-800">
                Your Impact Summary
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-700">
                  {donationStats?.successRate.toFixed(1)}%
                </div>
                <div className="text-sm text-green-600">Success Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-700">
                  {donationStats?.uniqueCampaigns}
                </div>
                <div className="text-sm text-green-600">Lives Impacted</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-700">
                  {donationStats?.recentDonation
                    ? Math.floor(
                        (new Date() - new Date(donationStats.recentDonation)) /
                          (1000 * 60 * 60 * 24)
                      )
                    : 0}
                </div>
                <div className="text-sm text-green-600">
                  Days Since Last Donation
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              {/* Time Filter */}
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
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
                  <SelectItem value="amount-high">Highest Amount</SelectItem>
                  <SelectItem value="amount-low">Lowest Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {filteredDonations.length} of {donations.length}{" "}
                donations
              </span>
              <FundraisingButton variant="ghost-trust" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export History
              </FundraisingButton>
            </div>
          </CardContent>
        </Card>

        {/* Donations List */}
        <div className="space-y-4">
          {filteredDonations.map((donation) => (
            <Card
              key={donation._id}
              className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Campaign Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <img
                        src={
                          campaigns.find(
                            (campaign) => campaign._id === donation.campaign._id
                          ).imageURL || "/placeholder.svg"
                        }
                        alt={donation.campaign.title}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                          {donation.campaign.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(donation.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {new Date(donation.createdAt).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Donation Details */}
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="text-center lg:text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ${donation.amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Transaction ID: {donation.transactionId}
                      </div>
                    </div>

                    <div className="flex flex-col items-center lg:items-end gap-2">
                      {getStatusBadge(donation.status)}
                      <Link to={`/donate/${donation.campaign._id}`}>
                        <FundraisingButton variant="ghost-trust" size="sm">
                          <ArrowUpRight className="h-4 w-4" />
                          View Campaign
                        </FundraisingButton>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white border-0 shadow-xl mt-12">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-6 w-6" />
              <h3 className="text-2xl font-bold">
                Continue Making a Difference
              </h3>
            </div>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Your generosity has already created positive change. Discover more
              campaigns and continue your impact journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/donate">
                <FundraisingButton variant="warm" size="lg">
                  <Heart className="h-5 w-5" />
                  Donate to New Causes
                </FundraisingButton>
              </Link>
              <Link to="/campaigns">
                <FundraisingButton
                  variant="outline-trust"
                  size="lg"
                  className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-blue-600"
                >
                  <Target className="h-5 w-5" />
                  Browse All Campaigns
                </FundraisingButton>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
