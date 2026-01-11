import { useEffect, useState } from "react";
import HeroSection from "@/components/HeroSection";
import CampaignCard from "@/components/CampaignCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  TrendingUp,
  Users,
  Target,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { FundraisingButton } from "@/components/ui/fundraising-button";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL 
  ? `${import.meta.env.VITE_BACKEND_URL}/api` 
  : "/api";

export default function Home() {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/campaigns?limit=3`);
        if (!response.ok) {
          throw new Error("Failed to fetch campaigns");
        }
        const data = await response.json();
        // Handle both old format (array) and new format (object with campaigns array)
        const campaignsArray = Array.isArray(data) ? data : data.campaigns || [];
        setCampaigns(campaignsArray.slice(0, 3));
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <HeroSection />

      {/* Impact Stats Section */}
      <section className="py-16 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4 mr-2" />
              Our Impact Together
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Making a Real Difference
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Every donation creates ripples of positive change across
              communities worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: Target,
                value: "120+",
                label: "Campaigns Funded",
                color: "text-blue-600",
              },
              {
                icon: Users,
                value: "2.5K+",
                label: "Lives Impacted",
                color: "text-emerald-600",
              },
              {
                icon: Heart,
                value: "$210K+",
                label: "Total Raised",
                color: "text-rose-600",
              },
              {
                icon: TrendingUp,
                value: "95%",
                label: "Success Rate",
                color: "text-amber-600",
              },
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-4`} />
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Campaigns Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2 text-sm font-medium mb-4">
              <Heart className="h-4 w-4 mr-2" />
              Featured Campaigns
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Urgent Causes Need Your Help
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These campaigns are making immediate impact in communities that
              need it most
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-lg">
                  <Skeleton className="h-48 w-full rounded-xl mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <Alert
              variant="destructive"
              className="text-center max-w-xl mx-auto bg-red-50 border-red-200"
            >
              <AlertDescription className="text-red-800">
                Error loading campaigns: {error}
              </AlertDescription>
            </Alert>
          ) : campaigns.length > 0 ? (
            <>
              <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-12">
                {campaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign._id}
                    id={campaign._id}
                    title={campaign.title}
                    imageSrc={campaign.imageURL}
                    target={campaign.target}
                    raised={campaign.raised || 0}
                    category={campaign.category}
                    urgency={campaign.urgency}
                    daysLeft={campaign.daysLeft}
                  />
                ))}
              </div>

              <div className="text-center">
                <Link to="/donate">
                  <FundraisingButton variant="outline-donate" size="lg">
                    View All Campaigns
                    <ArrowRight className="h-5 w-5" />
                  </FundraisingButton>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                No campaigns available at the moment.
              </p>
              <p className="text-gray-400">
                Check back soon for new opportunities to make a difference!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of donors who are creating positive change in
            communities worldwide. Every contribution, no matter the size, makes
            a meaningful impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/donate">
              <FundraisingButton variant="warm" size="xl">
                <Heart className="h-6 w-6" />
                Start Donating Today
              </FundraisingButton>
            </Link>
            <Link to="/campaign/new">
              <FundraisingButton
                variant="outline-trust"
                size="xl"
                className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-blue-600"
              >
                <Target className="h-6 w-6" />
                Start a Campaign
              </FundraisingButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
