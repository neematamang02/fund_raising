import { createElement, useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogIn, LogOut, Menu, UserPlus, X } from "lucide-react";
import { AuthContext } from "@/Context/AuthContext";
import ROUTES from "@/routes/routes";
import { Button } from "@/components/ui/button";
import ToggleRole from "@/components/ToggleRole";
import { getRoleHomePath, getTopNavItems } from "./roleNavConfig";
import useUnreadNotificationCount, {
  formatUnreadCount,
} from "@/hooks/useUnreadNotificationCount";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── Nav link style ───────────────────────────────────────────────────────────

function linkClass({ isActive }) {
  return [
    "rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "lg:px-3",
    isActive
      ? "bg-primary/10 text-primary"
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
  ].join(" ");
}

// ─── Notification pill ────────────────────────────────────────────────────────

function UnreadNotificationPill({ unreadCount }) {
  if (unreadCount <= 0) return null;
  return (
    <span
      className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-semibold leading-none text-primary-foreground"
      aria-label={`${unreadCount} unread notifications`}
    >
      {formatUnreadCount(unreadCount)}
    </span>
  );
}

// ─── Role chip ────────────────────────────────────────────────────────────────

function RoleChip({ role }) {
  const map = {
    admin: "bg-chart-2/10 text-chart-2",
    organizer: "bg-primary/10 text-primary",
    donor: "bg-chart-4/10 text-chart-4",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${map[role] ?? "bg-muted text-muted-foreground"}`}
    >
      {role}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TopNav() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const items = getTopNavItems(user);
  const { unreadCount } = useUnreadNotificationCount();

  const executeLogout = () => {
    logout();
    navigate(ROUTES.HOME);
    setMobileOpen(false);
    setLogoutDialogOpen(false);
    toast.success("Logged out successfully");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center justify-between gap-3 px-3 sm:h-18 sm:px-4 lg:h-20 lg:px-8 xl:px-10">

        {/* Logo */}
        <Link
          to={getRoleHomePath(user?.role)}
          className="shrink-0"
          aria-label="HopeOn home"
        >
          <img
            src="https://ik.imagekit.io/zisapgd2g/ChatGPT_Image_Mar_30__2026__02_44_14_PM-removebg-preview.png"
            alt="HopeOn Logo"
            className="h-10 w-auto max-w-[132px] object-contain sm:h-11 md:h-12 lg:h-14"
          />
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden min-w-0 items-center gap-0.5 xl:flex"
          aria-label="Primary navigation"
        >
          {items.map(({ label, to, icon }) => (
            <NavLink key={to} to={to} className={linkClass}>
              <span className="inline-flex items-center gap-1.5">
                {createElement(icon, {
                  className: "h-4 w-4 shrink-0",
                  "aria-hidden": true,
                })}
                {label}
                {to === ROUTES.NOTIFICATIONS ? (
                  <UnreadNotificationPill unreadCount={unreadCount} />
                ) : null}
              </span>
            </NavLink>
          ))}

          {user?.role === "donor" ? <ToggleRole /> : null}

          {/* Auth controls */}
          <div className="ml-3 flex items-center gap-2 border-l border-border pl-3">
            {user ? (
              <>
                <RoleChip role={user.role} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLogoutDialogOpen(true)}
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link to={ROUTES.LOGIN}>
                    <LogIn className="h-4 w-4" aria-hidden="true" />
                    Login
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link to={ROUTES.REGISTER}>
                    <UserPlus className="h-4 w-4" aria-hidden="true" />
                    Register
                  </Link>
                </Button>
              </>
            )}
          </div>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground xl:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-primary-nav"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen ? (
        <div
          id="mobile-primary-nav"
          className="border-t border-border bg-background px-3 py-3 sm:px-4 xl:hidden"
        >
          <nav
            className="flex max-h-[calc(100dvh-5rem)] flex-col gap-1 overflow-y-auto"
            aria-label="Mobile primary navigation"
          >
            {items.map(({ label, to, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={linkClass}
                onClick={() => setMobileOpen(false)}
              >
                <span className="inline-flex items-center gap-2">
                  {createElement(icon, {
                    className: "h-4 w-4 shrink-0",
                    "aria-hidden": true,
                  })}
                  {label}
                  {to === ROUTES.NOTIFICATIONS ? (
                    <UnreadNotificationPill unreadCount={unreadCount} />
                  ) : null}
                </span>
              </NavLink>
            ))}

            {user?.role === "donor" ? <ToggleRole mobile /> : null}

            <div className="mt-2 pt-2 border-t border-border">
              {user ? (
                <div className="flex items-center justify-between gap-3">
                  <RoleChip role={user.role} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMobileOpen(false);
                      setLogoutDialogOpen(true);
                    }}
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link to={ROUTES.LOGIN} onClick={() => setMobileOpen(false)}>
                      <LogIn className="h-4 w-4" aria-hidden="true" />
                      Login
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="flex-1">
                    <Link to={ROUTES.REGISTER} onClick={() => setMobileOpen(false)}>
                      <UserPlus className="h-4 w-4" aria-hidden="true" />
                      Register
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      ) : null}

      {/* Logout dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Sign out of your account?</DialogTitle>
            <DialogDescription>
              You will be redirected to the home page and need to sign in again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLogoutDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={executeLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
