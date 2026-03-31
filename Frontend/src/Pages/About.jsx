import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Shield,
  Users,
  Target,
  TrendingUp,
  Award,
  Globe,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const STATS = [
  { icon: Target, value: "500+", label: "Campaigns Funded", text: "text-primary", bg: "bg-primary/10" },
  { icon: Users, value: "10K+", label: "Lives Impacted", text: "text-chart-3", bg: "bg-chart-3/10" },
  { icon: Heart, value: "$2.5M+", label: "Total Raised", text: "text-chart-4", bg: "bg-chart-4/10" },
  { icon: Globe, value: "50+", label: "Countries Reached", text: "text-chart-2", bg: "bg-chart-2/10" },
];

const VALUES = [
  {
    title: "Transparency",
    desc: "Complete visibility into fund allocation, campaign progress, and impact measurement for every donation.",
    img: "https://plus.unsplash.com/premium_photo-1666820202651-314501c88358?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0",
    icon: Shield,
    iconBg: "bg-primary/15",
    iconText: "text-primary",
  },
  {
    title: "Compassion",
    desc: "Empathy-driven solutions that prioritize human dignity and sustainable community development.",
    img: "https://images.unsplash.com/photo-1518398046578-8cca57782e17?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0",
    icon: Heart,
    iconBg: "bg-chart-4/15",
    iconText: "text-chart-4",
  },
  {
    title: "Empowerment",
    desc: "Providing tools and resources that enable anyone to become an effective force for positive change.",
    img: "https://images.unsplash.com/photo-1592530392525-9d8469678dac?q=80&w=3164&auto=format&fit=crop&ixlib=rb-4.1.0",
    icon: Users,
    iconBg: "bg-chart-3/15",
    iconText: "text-chart-3",
  },
];

const About = () => {
  return (
    <div className="min-h-screen surface-page">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-b border-border">
        <div className="relative max-w-4xl mx-auto text-center">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            About Our Mission
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-5">
            Empowering Change{" "}
            <span className="text-primary">Through Giving</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            HopeOn connects compassionate donors with meaningful causes,
            creating a transparent platform where every contribution makes a
            measurable impact in communities worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/donate">
              <Button className="bg-primary hover:bg-primary/90" size="lg">
                <Heart className="h-5 w-5 mr-2" />
                Start Making Impact
              </Button>
            </Link>
            <Link to="/campaigns">
              <Button variant="outline" size="lg">
                <Target className="h-5 w-5 mr-2" />
                Explore Campaigns
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Impact stats ────────────────────────────────────────────────── */}
      <section className="py-16 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="rounded-2xl border border-border bg-background p-6 hover:border-primary/30 transition-colors">
                  <div className={`w-12 h-12 ${stat.bg} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <stat.icon className={`h-6 w-6 ${stat.text}`} />
                  </div>
                  <div className={`text-3xl font-bold ${stat.text} mb-1`}>{stat.value}</div>
                  <div className="text-muted-foreground text-sm font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ─────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0"
                alt="Helping hands coming together"
                className="rounded-2xl w-full h-[400px] object-cover border border-border shadow-lg"
              />
              {/* Floating badge */}
              <div className="absolute -bottom-5 -right-5 bg-card rounded-xl p-4 shadow-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/15 rounded-full flex items-center justify-center">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">Trusted Platform</div>
                    <div className="text-xs text-muted-foreground">99.9% Success Rate</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Target className="h-3.5 w-3.5 mr-1.5" />
                Our Mission
              </Badge>
              <h2 className="text-3xl font-bold text-foreground leading-tight">
                Creating a World Where{" "}
                <span className="text-primary">Every Cause Matters</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                At HopeOn, we believe that meaningful change happens when
                compassionate people come together. Our platform bridges the
                gap between those who want to help and those who need support,
                creating a transparent ecosystem where every donation creates
                ripples of positive impact.
              </p>
              <div className="space-y-3">
                {[
                  "100% transparent fund allocation",
                  "Real-time campaign progress tracking",
                  "Direct communication with beneficiaries",
                  "Verified impact reporting",
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-primary/15 rounded-full flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                    <span className="text-foreground text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Vision ──────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-2 relative">
              <img
                src="https://images.unsplash.com/photo-1727553957790-3f8f7a0f5614?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0"
                alt="Education and community support"
                className="rounded-2xl w-full h-[400px] object-cover border border-border shadow-lg"
              />
              {/* Floating badge */}
              <div className="absolute -bottom-5 -left-5 bg-background rounded-xl p-4 shadow-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-chart-2/15 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">Growing Impact</div>
                    <div className="text-xs text-muted-foreground">+150% This Year</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:order-1 space-y-5">
              <Badge className="bg-chart-3/10 text-chart-3 border-chart-3/20">
                <Globe className="h-3.5 w-3.5 mr-1.5" />
                Our Vision
              </Badge>
              <h2 className="text-3xl font-bold text-foreground leading-tight">
                Building a{" "}
                <span className="text-chart-3">Connected World</span>
                <br />
                of Generosity
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We envision a future where geographical boundaries don't limit
                compassion, where technology amplifies human kindness, and
                where every person has the power to be a catalyst for positive
                change in communities around the world.
              </p>
              <div className="rounded-xl border border-border bg-background p-5">
                <h3 className="font-semibold text-foreground mb-2">Our Commitment</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  By 2030, we aim to facilitate $100M in donations, impact 1
                  million lives, and establish sustainable fundraising
                  ecosystems in 100+ countries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ──────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/20 mb-4">
              <Heart className="h-3.5 w-3.5 mr-1.5" />
              Our Core Values
            </Badge>
            <h2 className="text-3xl font-bold text-foreground mb-3">
              The Principles That{" "}
              <span className="text-chart-4">Guide Us</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              These values shape every decision we make and every feature we build
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((value, i) => (
              <div
                key={i}
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-md transition-all duration-300"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={value.img}
                    alt={value.title}
                    className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className={`absolute top-3 right-3 w-10 h-10 ${value.iconBg} rounded-full flex items-center justify-center border border-border/40 backdrop-blur-sm`}>
                    <value.icon className={`h-5 w-5 ${value.iconText}`} />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{value.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-background mb-4">
            Ready to Be Part of Something Bigger?
          </h2>
          <p className="text-background/70 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join our community of changemakers and start creating the impact
            you want to see in the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/donate">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Heart className="h-5 w-5 mr-2" />
                Start Your Impact Journey
              </Button>
            </Link>
            <Link to="/campaigns">
              <Button
                size="lg"
                variant="outline"
                className="border-background/30 bg-transparent text-background hover:bg-background hover:text-foreground"
              >
                <Target className="h-5 w-5 mr-2" />
                Launch Your Campaign
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
