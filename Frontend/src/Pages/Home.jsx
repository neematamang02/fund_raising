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
import ROUTES from "@/routes/routes";
import { Button } from "@/components/ui/button";

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
        const campaignsArray = Array.isArray(data)
          ? data
          : data.campaigns || [];
        setCampaigns(campaignsArray.slice(0, 3));
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const impactStats = [
    {
      icon: Target,
      value: "120+",
      label: "Campaigns Funded",
      tone: "text-secondary",
    },
    {
      icon: Users,
      value: "2.5K+",
      label: "Lives Impacted",
      tone: "text-primary",
    },
    {
      icon: Heart,
      value: "$210K+",
      label: "Total Raised",
      tone: "text-accent",
    },
    {
      icon: TrendingUp,
      value: "95%",
      label: "Success Rate",
      tone: "text-secondary",
    },
  ];

  return (
    <div className="surface-page min-h-screen">
      <HeroSection />

      <section className="border-b border-slate-200 bg-white py-14 sm:py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <Badge className="mb-4 bg-blue-100 px-4 py-1.5 text-blue-800">
              <Sparkles className="h-4 w-4 mr-2" />
              Our Impact Together
            </Badge>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Making a Real Difference
            </h2>
            <p className="mt-3 text-slate-600">
              Every donation contributes to transparent, measurable progress in
              communities that need support.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {impactStats.map((stat) => (
              <article
                key={stat.label}
                className="surface-card rounded-xl p-6 text-center transition-colors duration-200 hover:border-blue-200"
              >
                <stat.icon className={`mx-auto mb-3 h-7 w-7 ${stat.tone}`} />
                <p className="text-3xl font-bold text-slate-900">
                  {stat.value}
                </p>
                <p className="mt-1 font-medium text-slate-600">{stat.label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <Badge className="mb-4 bg-amber-100 px-4 py-1.5 text-amber-800">
              <Heart className="h-4 w-4 mr-2" />
              Featured Campaigns
            </Badge>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Urgent Causes Need Your Help
            </h2>
            <p className="mt-3 text-slate-600">
              Support campaigns with immediate needs and verified impact goals.
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="surface-card rounded-xl p-5">
                  <Skeleton className="mb-4 h-44 w-full rounded-lg" />
                  <Skeleton className="mb-2 h-5 w-3/4" />
                  <Skeleton className="mb-4 h-4 w-full" />
                  <Skeleton className="mb-2 h-3 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive" className="mx-auto max-w-xl">
              <AlertDescription>
                Error loading campaigns: {error}
              </AlertDescription>
            </Alert>
          ) : campaigns.length > 0 ? (
            <>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-10">
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
                <Button asChild size="lg">
                  <Link to={ROUTES.DONATE}>
                    View All Campaigns
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="surface-card rounded-xl py-12 text-center">
              <Heart className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <p className="text-lg font-semibold text-slate-700">
                No campaigns available right now.
              </p>
              <p className="mt-1 text-slate-500">
                Please check back soon for new causes.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-secondary py-14 sm:py-16">
        <div className="mx-auto w-full max-w-5xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Make a Difference?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-blue-100">
            Join a growing community of donors creating meaningful outcomes
            through trusted campaigns.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              <Link to={ROUTES.DONATE}>
                <Heart className="h-5 w-5" />
                Start Donating Today
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white bg-transparent text-white hover:bg-white hover:text-secondary"
            >
              <Link to={ROUTES.CREATE_CAMPAIGN}>
                <Target className="h-5 w-5" />
                Start a Campaign
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
