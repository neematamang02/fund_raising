import { useMemo } from "react";
import { Link } from "react-router-dom";
import { FundraisingButton } from "./ui/fundraising-button";
import { Badge } from "./ui/badge";
import { Heart, Clock, Users, Target, TrendingUp } from "lucide-react";
import PropTypes from "prop-types";

export default function CampaignCard({ id, title, imageSrc, target, raised }) {
  const percent = useMemo(() => {
    if (target <= 0) return 0;
    return Math.min(100, Math.round((raised / target) * 100));
  }, [target, raised]);

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden border border-gray-100">
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img
          src={imageSrc || "/placeholder.svg"}
          alt={title}
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Progress Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="flex items-center gap-2 text-white text-sm">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">{percent}% funded</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <h3 className="font-bold text-xl text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>

        {/* Progress Section */}
        <div className="space-y-3">
          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${percent}%` }}
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
            <div
              className="absolute -top-1 bg-white border-2 border-blue-500 rounded-full w-5 h-5 transition-all duration-300"
              style={{ left: `calc(${Math.min(percent, 95)}% - 10px)` }}
            ></div>
          </div>

          {/* Amount Info */}
          <div className="flex justify-between items-center text-sm">
            <div className="space-y-1">
              <div className="font-bold text-lg text-gray-900">
                ${raised.toLocaleString()}
              </div>
              <div className="text-gray-500 flex items-center gap-1">
                <Target className="h-3 w-3" />
                raised of ${target.toLocaleString()}
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="font-bold text-lg text-blue-600">{percent}%</div>
              <div className="text-gray-500 text-xs">complete</div>
            </div>
          </div>

          {/* Donor Count */}
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Users className="h-4 w-4" />
            <span>{Math.floor(raised / 50)} donors supporting this cause</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link to={`/donate/${id}`} className="block">
            <FundraisingButton size="lg" fullWidth className="group">
              <Heart className="h-5 w-5 group-hover:scale-110 transition-transform" />
              Support This Cause
            </FundraisingButton>
          </Link>
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-200 transition-colors pointer-events-none"></div>
    </div>
  );
}

CampaignCard.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  imageSrc: PropTypes.string.isRequired,
  target: PropTypes.number.isRequired,
  raised: PropTypes.number.isRequired,
  category: PropTypes.string,
  urgency: PropTypes.oneOf(["high", "medium", "low"]),
  daysLeft: PropTypes.number,
};
