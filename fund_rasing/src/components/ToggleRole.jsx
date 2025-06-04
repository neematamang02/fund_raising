import { useContext, useState } from "react";
import { Toggle } from "@/components/ui/toggle";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "sonner";
import { UserEdit, Heart } from "iconsax-reactjs";

export default function ToggleRole({ mobile = false }) {
  const { user, switchRole } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  // If not logged in, don't show toggle
  if (!user) return null;

  const isOrganizer = user.role === "organizer";

  const onToggle = async () => {
    setLoading(true);
    const desiredRole = isOrganizer ? "donor" : "organizer";
    const ok = await switchRole(desiredRole);
    if (!ok) {
      toast(
        "You are not verified as organizer. If you want to be an organizer, apply for organizer."
      );
    }
    setLoading(false);
  };

  return (
    <div className={mobile ? "px-4 py-2" : "px-3 py-2"}>
      <Toggle
        pressed={isOrganizer}
        onPressedChange={onToggle}
        disabled={loading}
        aria-label="Toggle between donor and organizer"
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
          isOrganizer
            ? "bg-gradient-to-r from-purple-600/80 to-indigo-600/80 text-white shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30"
            : "bg-gradient-to-r from-orange-500/80 to-amber-500/80 text-white shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30"
        } hover:scale-105`}
      >
        {isOrganizer ? (
          <>
            <UserEdit size={18} variant="Broken" className="text-purple-200" />
            <span className="text-sm font-medium">Organizer</span>
          </>
        ) : (
          <>
            <Heart size={18} variant="Broken" className="text-amber-200" />
            <span className="text-sm font-medium">Donor</span>
          </>
        )}
        {loading && (
          <div className="ml-1 w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        )}
      </Toggle>
    </div>
  );
}
