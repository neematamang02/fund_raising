import { Link } from "react-router-dom";
import { FundraisingButton } from "./ui/fundraising-button";
import {
  Heart,
  Users,
  Target,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function HeroSection() {
  return (
    <div className="relative w-full bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white overflow-hidden">
      {/* Background Pattern */}
      <div
        className={`absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-20`}
      ></div>
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-300/20 rounded-full blur-xl animate-pulse delay-500"></div>

      <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
          {/* Left: Content */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium border border-white/20">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span>Trusted by 2,500+ donors worldwide</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Empower Change.{" "}
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Fund Dreams.
                </span>
              </h1>
              <p className="text-xl text-blue-100 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Help communities gain access to clean water, quality education,
                and healthcare. Your small act of giving can change someone's
                entire world.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
              {[
                {
                  icon: Target,
                  value: "120+",
                  label: "Campaigns",
                  color: "text-yellow-300",
                },
                {
                  icon: Users,
                  value: "2.5K+",
                  label: "Donors",
                  color: "text-green-300",
                },
                {
                  icon: Heart,
                  value: "$210K+",
                  label: "Raised",
                  color: "text-pink-300",
                },
                {
                  icon: TrendingUp,
                  value: "95%",
                  label: "Success",
                  color: "text-blue-300",
                },
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    <stat.icon
                      className={`h-6 w-6 ${stat.color} mx-auto mb-2`}
                    />
                    <div className="text-2xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-xs text-blue-200 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/donate">
                <FundraisingButton variant="warm" size="xl" className="group">
                  <Heart className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  Browse Campaigns
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </FundraisingButton>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center lg:justify-start gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-blue-200">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Secure donations</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-200">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
                <span>100% transparent</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-200">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-700"></div>
                <span>Tax deductible</span>
              </div>
            </div>
          </div>

          {/* Right: Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src="https://images.unsplash.com/photo-1574607383476-f517f260d30b?q=80&w=3174&auto=format&fit=crop&ixlib=rb-4.1.0"
                alt="People coming together to make a difference through fundraising"
                className="rounded-3xl shadow-2xl w-full max-h-[600px] object-cover border-4 border-white/20"
              />

              {/* Floating Cards */}
              <div className="absolute -top-6 -left-6 bg-white rounded-2xl p-4 shadow-xl animate-bounce">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Heart className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      $1,250 raised
                    </div>
                    <div className="text-xs text-gray-500">
                      in the last hour
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-xl animate-bounce delay-1000">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      47 new donors
                    </div>
                    <div className="text-xs text-gray-500">joined today</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-3xl blur-3xl transform scale-110"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
