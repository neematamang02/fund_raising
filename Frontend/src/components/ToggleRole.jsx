import { useContext, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { AuthContext } from "@/Context/AuthContext";
import { toast } from "sonner";
import { Loader2, Heart, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ToggleRole({ mobile = false }) {
  const { user, switchRole } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const isOrganizer = user.role === "organizer";

  const onToggle = async (checked) => {
    setLoading(true);
    const desiredRole = checked ? "organizer" : "donor";
    const ok = await switchRole(desiredRole);
    if (!ok) {
      toast.error(
        "You are not verified as organizer. If you want to be an organizer, apply for organizer.",
      );
    } else {
      toast.success(`Switched to ${desiredRole} portal`);
    }
    setLoading(false);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg border border-border bg-muted/60 px-3 py-2",
        mobile ? "mx-1 my-1" : "",
      )}
    >
      {/* Donor label */}
      <div
        className={cn(
          "flex items-center gap-1.5 transition-all duration-200",
          !isOrganizer
            ? "text-chart-4 font-semibold"
            : "text-muted-foreground/60",
        )}
      >
        <Heart
          className={cn(
            "shrink-0 transition-all duration-200",
            mobile ? "h-4.5 w-4.5" : "h-4 w-4",
            !isOrganizer ? "fill-chart-4/20" : "",
          )}
        />
        <span className={cn("text-sm", mobile ? "text-base" : "")}>Donor</span>
      </div>

      {/* Switch */}
      <div className="relative">
        <Switch
          checked={isOrganizer}
          onCheckedChange={onToggle}
          disabled={loading}
          className={cn(
            "cursor-pointer",
            "data-[state=checked]:bg-primary data-[state=unchecked]:bg-chart-4",
            "border-0 shadow-sm transition-all duration-200",
            mobile ? "scale-110" : "",
          )}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-3 w-3 animate-spin text-background" />
          </div>
        )}
      </div>

      {/* Organizer label */}
      <div
        className={cn(
          "flex items-center gap-1.5 transition-all duration-200",
          isOrganizer ? "text-primary font-semibold" : "text-muted-foreground/60",
        )}
      >
        <UserRound
          className={cn(
            "shrink-0 transition-all duration-200",
            mobile ? "h-4.5 w-4.5" : "h-4 w-4",
          )}
        />
        <span className={cn("text-sm", mobile ? "text-base" : "")}>
          Organizer
        </span>
      </div>
    </div>
  );
}
