import { createElement, useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogIn, LogOut, Menu, UserPlus, X } from "lucide-react";
import { AuthContext } from "@/Context/AuthContext";
import ROUTES from "@/routes/routes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ToggleRole from "@/components/ToggleRole";
import { getRoleHomePath, getTopNavItems } from "./roleNavConfig";
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
    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive ? "bg-white/25 text-white" : "text-white/90 hover:bg-white/15",
  ].join(" ");
}

export default function TopNav() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const items = getTopNavItems(user);

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
    <header className="sticky top-0 z-50 border-b border-blue-900/40 bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 text-white shadow-lg">
      <div className="flex h-16 w-full items-center justify-between pl-2 pr-4 sm:pl-3 sm:pr-6">
        <Link
          to={getRoleHomePath(user?.role)}
          className="text-lg font-semibold tracking-tight"
        >
          HopeOn
        </Link>

        <nav
          className="hidden items-center gap-1 xl:flex"
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
              </span>
            </NavLink>
          ))}

          {user?.role === "donor" ? <ToggleRole /> : null}

          <div className="ml-3 flex items-center gap-2 border-l border-white/20 pl-3">
            {user ? (
              <>
                <Badge className="bg-white/15 text-white">{user.role}</Badge>
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
          className="inline-flex items-center justify-center rounded-md p-2 hover:bg-white/15 xl:hidden"
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
          className="border-t border-white/15 px-4 py-3 xl:hidden"
        >
          <nav
            className="flex flex-col gap-2"
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
