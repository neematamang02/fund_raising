import { useContext, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Heart, User } from "iconsax-reactjs";

export default function ToggleRole({ mobile = false }) {
  const { user, switchRole } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  // If not logged in, don't show switch
  if (!user) return null;

  const isOrganizer = user.role === "organizer";

  const onToggle = async (checked) => {
    setLoading(true);
    const desiredRole = checked ? "organizer" : "donor";
    const ok = await switchRole(desiredRole);
    if (!ok) {
      toast.error(
        "You are not verified as organizer. If you want to be an organizer, apply for organizer."
      );
    }
    setLoading(false);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20",
        mobile ? "mx-4 my-2" : ""
      )}
    >
      {/* Donor Label */}
      <div
        className={cn(
          "flex items-center gap-2 transition-all duration-300",
          !isOrganizer ? "text-white scale-105" : "text-white/60 scale-95"
        )}
      >
        <Heart
          variant="Broken"
          size={mobile ? 20 : 18}
          className={cn(
            "transition-all duration-300",
            !isOrganizer ? "text-amber-300 fill-amber-300/20" : "text-white/40"
          )}
        />
        <span
          className={cn(
            "text-sm font-medium transition-all duration-300",
            mobile ? "text-base" : ""
          )}
        >
          Donor
        </span>
      </div>

      {/* Switch Component */}
      <div className="relative">
        <Switch
          checked={isOrganizer}
          onCheckedChange={onToggle}
          disabled={loading}
          className={cn(
            "cursor-pointer data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-indigo-500",
            "data-[state=unchecked]:bg-gradient-to-r data-[state=unchecked]:from-orange-500 data-[state=unchecked]:to-amber-500",
            "border-0 shadow-lg transition-all duration-300",
            "data-[state=checked]:shadow-purple-500/30 data-[state=unchecked]:shadow-amber-500/30",
            mobile ? "scale-110" : ""
          )}
        />

        {/* Loading Spinner Overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-3 h-3 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Organizer Label */}
      <div
        className={cn(
          "flex items-center gap-2 transition-all duration-300",
          isOrganizer ? "text-white scale-105" : "text-white/60 scale-95"
        )}
      >
        <User
          variant="Broken"
          size={mobile ? 20 : 18}
          className={cn(
            "transition-all duration-300",
            isOrganizer ? "text-purple-300" : "text-white/40"
          )}
        />
        <span
          className={cn(
            "text-sm font-medium transition-all duration-300",
            mobile ? "text-base" : ""
          )}
        >
          Organizer
        </span>
      </div>

      {/* Role Status Indicator */}
      {/* Removed status indicator as per request */}
    </div>
  );
}
