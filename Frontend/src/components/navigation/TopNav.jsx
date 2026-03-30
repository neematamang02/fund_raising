import { createElement, useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogIn, LogOut, Menu, UserPlus, X } from "lucide-react";
import { AuthContext } from "@/Context/AuthContext";
import ROUTES from "@/routes/routes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

function linkClass({ isActive }) {
  return [
    "rounded-md px-2 py-2 text-sm font-medium transition-colors lg:px-3",
    isActive
      ? "bg-blue-100 text-blue-800"
      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
  ].join(" ");
}

function UnreadNotificationPill({ unreadCount }) {
  if (unreadCount <= 0) return null;

  return (
    <span
      className="inline-flex min-w-5 items-center justify-center rounded-full bg-green-600 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white"
      aria-label={`${unreadCount} unread notifications`}
    >
      {formatUnreadCount(unreadCount)}
    </span>
  );
}

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

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white text-slate-900 shadow-[0_1px_0_rgba(17,24,39,0.06)]">
      <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center justify-between gap-3 px-3 sm:h-20 sm:px-4 lg:h-24 lg:px-8 xl:px-10">
        <Link
          to={getRoleHomePath(user?.role)}
          className="shrink-0"
          aria-label="HopeOn home"
        >
          <img
            src="https://ik.imagekit.io/zisapgd2g/ChatGPT_Image_Mar_30__2026__02_44_14_PM-removebg-preview.png"
            alt="HopeOn Logo"
            className="h-10 w-auto max-w-[132px] object-contain sm:h-12 sm:max-w-[168px] md:h-14 md:max-w-[200px] lg:h-20 lg:max-w-[228px]"
          />
        </Link>

        <nav
          className="hidden min-w-0 items-center gap-1 xl:flex"
          aria-label="Primary navigation"
        >
          {items.map(({ label, to, icon }) => (
            <NavLink key={to} to={to} className={linkClass}>
              <span className="inline-flex items-center gap-2">
                {createElement(icon, {
                  className: "h-4 w-4",
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

          <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-2">
            {user ? (
              <>
                <Badge className="bg-blue-100 text-blue-800">{user.role}</Badge>
                <Button variant="secondary" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="secondary">
                  <Link to={ROUTES.LOGIN}>
                    <LogIn className="h-4 w-4" aria-hidden="true" />
                    Login
                  </Link>
                </Button>
                <Button asChild>
                  <Link to={ROUTES.REGISTER}>
                    <UserPlus className="h-4 w-4" aria-hidden="true" />
                    Register
                  </Link>
                </Button>
              </>
            )}
          </div>
        </nav>

        <button
          type="button"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 xl:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-primary-nav"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {mobileOpen ? (
        <div
          id="mobile-primary-nav"
          className="border-t border-slate-200 bg-white px-3 py-3 sm:px-4 xl:hidden"
        >
          <nav
            className="flex max-h-[calc(100vh-5rem)] flex-col gap-2 overflow-y-auto"
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
                    className: "h-4 w-4",
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

            {user ? (
              <div className="pt-2">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <Button asChild variant="secondary" className="flex-1">
                  <Link to={ROUTES.LOGIN} onClick={() => setMobileOpen(false)}>
                    <LogIn className="h-4 w-4" aria-hidden="true" />
                    Login
                  </Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link
                    to={ROUTES.REGISTER}
                    onClick={() => setMobileOpen(false)}
                  >
                    <UserPlus className="h-4 w-4" aria-hidden="true" />
                    Register
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      ) : null}

      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Are you sure you want to logout?</DialogTitle>
            <DialogDescription>
              You will need to sign in again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLogoutDialogOpen(false)}
            >
              No
            </Button>
            <Button variant="destructive" onClick={executeLogout}>
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
