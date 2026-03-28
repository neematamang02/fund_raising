import { createElement, useContext, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { AuthContext } from "@/Context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ROUTES from "@/routes/routes";
import {
  getRoleHomePath,
  getSidebarItems,
  getSidebarSections,
} from "./roleNavConfig";
import RoleModeSwitcher from "./RoleModeSwitcher";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function itemClass({ isActive }) {
  return [
    "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
    isActive
      ? "bg-slate-900 text-white shadow-sm"
      : "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
  ].join(" ");
}

export default function RoleSidebarLayout({ role, children }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const navItems = useMemo(() => getSidebarItems(role), [role]);
  const navSections = useMemo(() => getSidebarSections(role), [role]);

  const pageTitle = useMemo(() => {
    const matched = navItems.find((item) =>
      location.pathname.startsWith(item.to),
    );
    return matched?.label || "Workspace";
  }, [location.pathname, navItems]);

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

  const SidebarContent = (
    <>
      <div className="flex h-14 items-center justify-between border-b border-slate-200 px-3">
        <Link
          to={getRoleHomePath(role)}
          className={[
            "font-semibold tracking-tight text-slate-900",
            collapsed ? "text-sm" : "text-base",
          ].join(" ")}
          onClick={() => setMobileOpen(false)}
        >
          {collapsed ? "HO" : "HopeOn"}
        </Link>

        <button
          type="button"
          className="hidden rounded-md p-1 text-slate-500 hover:bg-slate-100 lg:inline-flex"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>

        <button
          type="button"
          className="rounded-md p-1 text-slate-500 hover:bg-slate-100 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav
        className="flex-1 overflow-y-auto px-2 py-3"
        aria-label={`${role} navigation`}
      >
        <div className="space-y-4">
          {navSections.map((section) => (
            <section key={section.title} className="space-y-1">
              <h2
                className={[
                  "px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500",
                  collapsed ? "sr-only" : "block",
                ].join(" ")}
              >
                {section.title}
              </h2>

              {section.items.map(({ label, to, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={itemClass}
                  onClick={() => setMobileOpen(false)}
                  aria-label={label}
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={[
                          "absolute left-1 h-5 w-1 rounded-full transition-all duration-200 motion-reduce:transition-none",
                          isActive ? "bg-cyan-300" : "bg-transparent",
                        ].join(" ")}
                        aria-hidden="true"
                      />

                      {createElement(icon, {
                        className: "h-4 w-4 shrink-0",
                        "aria-hidden": true,
                      })}
                      <span className={collapsed ? "sr-only" : "truncate"}>
                        {label}
                      </span>

                      {!collapsed ? (
                        <ChevronRight
                          className={[
                            "ml-auto h-4 w-4 transition-all duration-200 motion-reduce:transition-none",
                            isActive
                              ? "translate-x-0 text-white"
                              : "-translate-x-0.5 text-slate-400 group-hover:translate-x-0",
                          ].join(" ")}
                          aria-hidden="true"
                        />
                      ) : null}
                    </>
                  )}
                </NavLink>
              ))}
            </section>
          ))}
        </div>
      </nav>

      <div className="border-t border-slate-200 p-3">
        {role === "organizer" ? (
          <div className="mb-3">
            <RoleModeSwitcher currentRole={role} compact={collapsed} />
          </div>
        ) : null}

        <div className="mb-2 flex items-center gap-2">
          <Badge className="bg-slate-900 text-white">{role}</Badge>
          <span className="truncate text-sm text-slate-600">
            {user?.name || user?.email}
          </span>
        </div>
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span className={collapsed ? "sr-only" : "inline"}>Logout</span>
        </Button>
      </div>
    </>
  );

  return (
    <div className="h-screen bg-slate-50">
      <div className="flex h-full overflow-hidden">
        <aside
          className={[
            "fixed inset-y-0 left-0 z-40 flex h-full w-72 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-out motion-reduce:transition-none lg:static lg:translate-x-0",
            collapsed ? "lg:w-20" : "lg:w-72",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          {SidebarContent}
        </aside>

        {mobileOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-slate-900/45 backdrop-blur-[1px] lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation overlay"
          />
        ) : null}

        <div className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto">
          <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="hidden rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:inline-flex"
                onClick={() => setCollapsed((prev) => !prev)}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>
              <p className="text-sm font-semibold text-slate-900">
                {pageTitle}
              </p>
            </div>

            <Link
              to={ROUTES.NOTIFICATIONS}
              className="text-slate-600 hover:text-slate-900"
              aria-label="Open notifications"
            >
              <Bell className="h-5 w-5" />
            </Link>
          </header>

          <main className="min-h-0 flex-1">{children}</main>
        </div>
      </div>

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
    </div>
  );
}
