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
        "You are not verified as an organizer yet. Complete your organizer application first.",
      );
    } else {
      toast.success(`Switched to ${nextRole} portal`);
    }

    setIsSwitching(false);
  };

  return (
    <section
      className="rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-2"
      aria-label="Portal mode switcher"
    >
      {!compact ? (
        <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
          Switch portal
        </p>
      ) : null}

      <div className={compact ? "space-y-1" : "space-y-1"}>
        {ROLES.map(({ key, label, helper, icon }) => {
          const isActive = currentRole === key;

          return (
            <button
              key={key}
              type="button"
              className={[
                "flex w-full items-center gap-2 rounded-md px-2 transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                compact ? "h-9 justify-center" : "py-2",
                isActive
                  ? "bg-sidebar-primary/10 text-sidebar-primary font-semibold"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              ].join(" ")}
              onClick={() => handleSwitch(key)}
              aria-pressed={isActive}
              disabled={isSwitching}
            >
              {isSwitching ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
              ) : (
                createElement(icon, {
                  className: "h-4 w-4 shrink-0",
                  "aria-hidden": true,
                })
              )}

              {compact ? (
                <span className="sr-only">Switch to {label} portal</span>
              ) : (
                <span className="flex flex-col items-start min-w-0">
                  <span className="text-sm font-medium leading-tight">{label}</span>
                  <span className="text-[11px] text-sidebar-foreground/50 leading-tight">
                    {helper}
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
