import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Users, Target, TrendingUp } from "lucide-react";
import PropTypes from "prop-types";

export default function CampaignCard({ id, title, imageSrc, target, raised }) {
  const percent = useMemo(() => {
    if (target <= 0) return 0;
    return Math.min(100, Math.round((raised / target) * 100));
  }, [target, raised]);

  return (
    <article className="surface-card group overflow-hidden rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg">
      <div className="relative overflow-hidden">
        <img
          src={imageSrc || "/placeholder.svg"}
          alt={title}
          className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/75 to-transparent p-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <TrendingUp className="h-4 w-4" />
            <span>{percent}% funded</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <h3 className="line-clamp-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-700">
          {title}
        </h3>

        <div className="space-y-3">
          <div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-2.5 rounded-full bg-primary transition-all duration-700 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <div className="flex items-end justify-between text-sm">
            <div>
              <p className="text-lg font-bold text-slate-900">
                ${raised.toLocaleString()}
              </p>
              <p className="flex items-center gap-1 text-slate-500">
                <Target className="h-3 w-3" />
                raised of ${target.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-secondary">{percent}%</p>
              <p className="text-xs text-slate-500">complete</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users className="h-4 w-4" />
            <span>{Math.floor(raised / 50)} donors supporting this cause</span>
          </div>
        </div>

        <div className="pt-1">
          <Link to={`/donate/${id}`} className="block">
            <Button className="w-full bg-primary hover:bg-primary/90">
              <Heart className="h-5 w-5" />
              Support This Cause
            </Button>
          </Link>
        </div>
      </div>
    </article>
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
