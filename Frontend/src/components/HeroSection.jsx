import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ROUTES from "@/routes/routes";
import {
  Heart,
  Users,
  Target,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function HeroSection() {
  const metrics = [
    { icon: Target, value: "120+", label: "Campaigns" },
    { icon: Users, value: "2.5K+", label: "Donors" },
    { icon: Heart, value: "$210K+", label: "Raised" },
    { icon: TrendingUp, value: "95%", label: "Success" },
  ];

  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div className="pointer-events-none absolute -left-20 top-0 h-56 w-56 rounded-full bg-secondary/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 md:py-16 lg:grid-cols-2 lg:gap-12 lg:py-20">
        <div className="animate-fadeIn space-y-7 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            <span>Trusted by 2,500+ donors worldwide</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-balance-trust text-4xl font-extrabold leading-tight text-foreground sm:text-5xl">
              Help Fund Critical Causes With Confidence
            </h1>
            <p className="mx-auto max-w-xl text-base leading-7 text-muted-foreground lg:mx-0 lg:text-lg">
              Support transparent campaigns for healthcare, education, and
              relief. Your contribution reaches real people with measurable
              impact.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {metrics.map((metric) => (
              <article
                key={metric.label}
                className="surface-card rounded-xl p-4 text-center transition-colors duration-200 hover:border-primary/30">
              
                <metric.icon className="mx-auto mb-2 h-5 w-5 text-secondary" />
                <p className="text-xl font-bold text-foreground">
                  {metric.value}
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  {metric.label}
                </p>
              </article>
            ))}
          </div>

          <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Button asChild size="lg" className="min-w-44">
              <Link to={ROUTES.DONATE}>
                <Heart className="h-5 w-5" />
                Browse Campaigns
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-w-44">
              <Link to={ROUTES.CREATE_CAMPAIGN}>
                Start a Campaign
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground lg:justify-start">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Secure donations
            </span>
            <span className="inline-flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-secondary" />
              Transparent campaigns
            </span>
            <span className="inline-flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              Verified organizers
            </span>
          </div>
        </div>

        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1574607383476-f517f260d30b?q=80&w=1600&auto=format&fit=crop"
            alt="People supporting a fundraising effort"
            className="w-full rounded-2xl border border-border object-cover shadow-[0_18px_40px_rgba(17,24,39,0.14)]"
          />

          <div className="absolute -left-3 top-4 rounded-xl border border-border bg-card px-3 py-2 shadow-md sm:-left-6 sm:top-6 sm:px-4 sm:py-3">
            <p className="text-xs font-medium text-muted-foreground">Raised today</p>
            <p className="text-lg font-bold text-primary">$1,250</p>
          </div>

          <div className="absolute -bottom-3 right-3 rounded-xl border border-border bg-card px-3 py-2 shadow-md sm:-bottom-6 sm:right-6 sm:px-4 sm:py-3">
            <p className="text-xs font-medium text-muted-foreground">New donors</p>
            <p className="text-lg font-bold text-secondary">47</p>
          </div>
        </div>
      </div>
    </section>
  );
}
