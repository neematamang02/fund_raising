import { Badge } from "@/components/ui/badge";
import { FundraisingButton } from "@/components/ui/fundraising-button";
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

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        {/* Background Pattern */}
        <div
          className={`absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-20`}
        ></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>

        <div className="relative max-w-6xl mx-auto text-center">
          <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4 mr-2" />
            About Our Mission
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Empowering Change
            </span>
            <br />
            <span className="text-gray-800">Through Giving</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Fund-Raising connects compassionate donors with meaningful causes,
            creating a transparent platform where every contribution makes a
            measurable impact in communities worldwide.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/donate">
              <FundraisingButton variant="donate" size="xl">
                <Heart className="h-6 w-6" />
                Start Making Impact
              </FundraisingButton>
            </Link>
            <Link to="/campaigns">
              <FundraisingButton variant="outline-trust" size="xl">
                <Target className="h-6 w-6" />
                Explore Campaigns
              </FundraisingButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                icon: Target,
                value: "500+",
                label: "Campaigns Funded",
                color: "text-blue-600",
              },
              {
                icon: Users,
                value: "10K+",
                label: "Lives Impacted",
                color: "text-emerald-600",
              },
              {
                icon: Heart,
                value: "$2.5M+",
                label: "Total Raised",
                color: "text-rose-600",
              },
              {
                icon: Globe,
                value: "50+",
                label: "Countries Reached",
                color: "text-amber-600",
              },
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-4`} />
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium text-sm">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-300"></div>
              <img
                src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0"
                alt="Helping hands coming together"
                className="relative rounded-3xl shadow-2xl w-full h-[400px] object-cover border-4 border-white/50 group-hover:scale-[1.02] transition-transform duration-300"
              />

              {/* Floating Achievement Badge */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Trusted Platform
                    </div>
                    <div className="text-xs text-gray-500">
                      99.9% Success Rate
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2">
                <Target className="h-4 w-4 mr-2" />
                Our Mission
              </Badge>

              <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                Creating a World Where
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {" "}
                  Every Cause Matters
                </span>
              </h2>

              <p className="text-lg text-gray-600 leading-relaxed">
                At Fund-Raising, we believe that meaningful change happens when
                compassionate people come together. Our platform bridges the gap
                between those who want to help and those who need support,
                creating a transparent ecosystem where every donation creates
                ripples of positive impact.
              </p>

              <div className="space-y-4">
                {[
                  "100% transparent fund allocation",
                  "Real-time campaign progress tracking",
                  "Direct communication with beneficiaries",
                  "Verified impact reporting",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 px-4 bg-white/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-2 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-300"></div>
              <img
                src="https://images.unsplash.com/photo-1727553957790-3f8f7a0f5614?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0"
                alt="Education and community support"
                className="relative rounded-3xl shadow-2xl w-full h-[400px] object-cover border-4 border-white/50 group-hover:scale-[1.02] transition-transform duration-300"
              />

              {/* Floating Impact Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Growing Impact
                    </div>
                    <div className="text-xs text-gray-500">+150% This Year</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:order-1 space-y-6">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2">
                <Globe className="h-4 w-4 mr-2" />
                Our Vision
              </Badge>

              <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                Building a
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {" "}
                  Connected World
                </span>
                <br />
                of Generosity
              </h2>

              <p className="text-lg text-gray-600 leading-relaxed">
                We envision a future where geographical boundaries don't limit
                compassion, where technology amplifies human kindness, and where
                every person has the power to be a catalyst for positive change
                in communities around the world.
              </p>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Our Commitment
                </h3>
                <p className="text-gray-600">
                  By 2030, we aim to facilitate $100M in donations, impact 1
                  million lives, and establish sustainable fundraising
                  ecosystems in 100+ countries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 text-sm font-medium mb-6">
              <Heart className="h-4 w-4 mr-2" />
              Our Core Values
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              The Principles That
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {" "}
                Guide Us
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These values shape every decision we make and every feature we
              build
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Transparency",
                desc: "Complete visibility into fund allocation, campaign progress, and impact measurement for every donation.",
                img: "https://plus.unsplash.com/premium_photo-1666820202651-314501c88358?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0",
                icon: Shield,
                color: "from-blue-500 to-indigo-500",
                bgColor: "bg-blue-50",
                iconColor: "text-blue-600",
              },
              {
                title: "Compassion",
                desc: "Empathy-driven solutions that prioritize human dignity and sustainable community development.",
                img: "https://images.unsplash.com/photo-1518398046578-8cca57782e17?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0",
                icon: Heart,
                color: "from-rose-500 to-pink-500",
                bgColor: "bg-rose-50",
                iconColor: "text-rose-600",
              },
              {
                title: "Empowerment",
                desc: "Providing tools and resources that enable anyone to become an effective force for positive change.",
                img: "https://images.unsplash.com/photo-1592530392525-9d8469678dac?q=80&w=3164&auto=format&fit=crop&ixlib=rb-4.1.0",
                icon: Users,
                color: "from-emerald-500 to-teal-500",
                bgColor: "bg-emerald-50",
                iconColor: "text-emerald-600",
              },
            ].map((value, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden border border-gray-100"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={value.img || "/placeholder.svg"}
                    alt={value.title}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${value.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}
                  ></div>

                  {/* Floating Icon */}
                  <div
                    className={`absolute top-4 right-4 w-12 h-12 ${value.bgColor} rounded-full flex items-center justify-center backdrop-blur-sm border border-white/50`}
                  >
                    <value.icon className={`h-6 w-6 ${value.iconColor}`} />
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{value.desc}</p>
                </div>

                {/* Hover Effect Border */}
                <div
                  className={`absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-gradient-to-r ${value.color} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Be Part of Something Bigger?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join our community of changemakers and start creating the impact you
            want to see in the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/donate">
              <FundraisingButton variant="warm" size="xl">
                <Heart className="h-6 w-6" />
                Start Your Impact Journey
              </FundraisingButton>
            </Link>
            <Link to="/campaign/new">
              <FundraisingButton
                variant="outline-trust"
                size="xl"
                className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-blue-600"
              >
                <Target className="h-6 w-6" />
                Launch Your Campaign
              </FundraisingButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
