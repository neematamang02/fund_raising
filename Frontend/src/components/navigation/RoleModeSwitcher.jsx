import { createElement, useContext, useState } from "react";
import { Heart, Loader2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { AuthContext } from "@/Context/AuthContext";
import { Button } from "@/components/ui/button";

const ROLES = [
  {
    key: "donor",
    label: "Donor",
    helper: "Give and track donations",
    icon: Heart,
  },
  {
    key: "organizer",
    label: "Organizer",
    helper: "Create and manage campaigns",
    icon: UserRound,
  },
];

export default function RoleModeSwitcher({ currentRole, compact = false }) {
  const { user, switchRole } = useContext(AuthContext);
  const [isSwitching, setIsSwitching] = useState(false);

  if (!user || (currentRole !== "donor" && currentRole !== "organizer")) {
    return null;
  }

  const handleSwitch = async (nextRole) => {
    if (isSwitching || nextRole === currentRole) return;

    setIsSwitching(true);
    const ok = await switchRole(nextRole);

    if (!ok) {
      toast.error(
        "You are not verified as organizer yet. Complete organizer application first.",
      );
    } else {
      toast.success(`Switched to ${nextRole} portal`);
    }

    setIsSwitching(false);
  };

  return (
    <section
      className="rounded-xl border border-slate-200 bg-slate-50 p-2"
      aria-label="Portal mode switcher"
    >
      {!compact ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Portal mode
        </p>
      ) : null}

      <div className={compact ? "space-y-1" : "space-y-2"}>
        {ROLES.map(({ key, label, helper, icon }) => {
          const isActive = currentRole === key;

          return (
            <Button
              key={key}
              type="button"
              variant={isActive ? "default" : "ghost"}
              className={[
                "w-full justify-start gap-2",
                compact ? "h-9 px-2" : "h-auto px-3 py-2",
                isActive ? "shadow-sm" : "",
              ].join(" ")}
              onClick={() => handleSwitch(key)}
              aria-pressed={isActive}
              disabled={isSwitching}
            >
              {isSwitching ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                createElement(icon, {
                  className: "h-4 w-4",
                  "aria-hidden": true,
                })
              )}

              {compact ? (
                <span className="sr-only">Switch to {label} portal</span>
              ) : (
                <span className="flex flex-col items-start">
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-xs text-slate-500">{helper}</span>
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </section>
  );
}
