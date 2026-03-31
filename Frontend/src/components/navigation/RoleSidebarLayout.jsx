import { createElement, useContext, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronRight,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
// Note: PanelLeftOpen/PanelLeftClose used in top header bar only
import { AuthContext } from "@/Context/AuthContext";
import { Button } from "@/components/ui/button";
import ROUTES from "@/routes/routes";
import {
  getRoleHomePath,
  getSidebarItems,
  getSidebarSections,
} from "./roleNavConfig";
import useUnreadNotificationCount, {
  formatUnreadCount,
} from "@/hooks/useUnreadNotificationCount";
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

// ─── Nav item class ───────────────────────────────────────────────────────────

function itemClass({ isActive }) {
  return [
    "group relative flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium",
    "transition-colors duration-150 motion-reduce:transition-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
    isActive
      ? "bg-sidebar-accent text-sidebar-accent-foreground"
      : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
  ].join(" ");
}

// ─── Notification dot ─────────────────────────────────────────────────────────

function UnreadNotificationDot({ unreadCount, compact = false }) {
  if (unreadCount <= 0) return null;
  return (
    <span
      className={[
        "inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold leading-none",
        compact ? "h-4 min-w-4 px-1 text-[10px]" : "h-5 min-w-5 px-1.5 text-[11px]",
      ].join(" ")}
      aria-label={`${unreadCount} unread notifications`}
    >
      {formatUnreadCount(unreadCount)}
    </span>
  );
}

// ─── Role badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }) {
  const map = {
    admin: "bg-chart-2/15 text-chart-2",
    organizer: "bg-primary/15 text-primary",
    donor: "bg-chart-4/15 text-chart-4",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${map[role] ?? "bg-muted text-muted-foreground"}`}
    >
      {role}
    </span>
  );
}

// ─── Main layout ──────────────────────────────────────────────────────────────

export default function RoleSidebarLayout({ role, children }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { unreadCount } = useUnreadNotificationCount();

  const navItems = useMemo(() => getSidebarItems(role), [role]);
  const navSections = useMemo(() => getSidebarSections(role), [role]);

  const pageTitle = useMemo(() => {
    const matched = navItems.find((item) =>
      location.pathname.startsWith(item.to),
    );
    return matched?.label ?? "Workspace";
  }, [location.pathname, navItems]);

  const executeLogout = () => {
    logout();
    navigate(ROUTES.HOME);
    setMobileOpen(false);
    setLogoutDialogOpen(false);
    toast.success("Logged out successfully");
  };

  // ─── Sidebar content ────────────────────────────────────────────────────────

  const SidebarContent = (
    <div className="flex h-full flex-col bg-sidebar border-r border-sidebar-border">

      {/* Logo row */}
      <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-sidebar-border px-3">
        <Link
          to={getRoleHomePath(role)}
          className="flex items-center min-w-0"
          onClick={() => setMobileOpen(false)}
          aria-label="HopeOn home"
        >
          {collapsed ? (
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-black select-none ring-2 ring-primary/20">H</span>
          ) : (
            <img
              src="https://ik.imagekit.io/zisapgd2g/ChatGPT_Image_Mar_30__2026__02_44_14_PM-removebg-preview.png"
              alt="HopeOn Logo"
              className="h-9 w-auto object-contain"
            />
          )}
        </Link>

        {/* Mobile close only — desktop collapse is in the top header bar */}
        <button
          type="button"
          className="shrink-0 rounded-md p-1.5 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto px-2 py-4 space-y-5"
        aria-label={`${role} navigation`}
      >
        {navSections.map((section) => (
          <div key={section.title}>
            {/* Section label */}
            <p
              className={[
                "mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40",
                collapsed ? "sr-only" : "block",
              ].join(" ")}
            >
              {section.title}
            </p>

            <div className="space-y-0.5">
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
                      {/* Active left indicator */}
                      <span
                        className={[
                          "absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-r-full transition-all duration-200 motion-reduce:transition-none",
                          isActive ? "bg-sidebar-primary" : "bg-transparent",
                        ].join(" ")}
                        aria-hidden="true"
                      />

                      {/* Icon */}
                      {createElement(icon, {
                        className: [
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive ? "text-sidebar-primary" : "text-sidebar-foreground/60",
                        ].join(" "),
                        "aria-hidden": true,
                      })}

                      {/* Collapsed icon notification dot */}
                      {to === ROUTES.NOTIFICATIONS && collapsed ? (
                        <span className="absolute left-5 top-1.5">
                          <UnreadNotificationDot unreadCount={unreadCount} compact />
                        </span>
                      ) : null}

                      {/* Label */}
                      <span className={[
                        "flex-1 truncate text-sm",
                        collapsed ? "sr-only" : "inline",
                      ].join(" ")}>
                        {label}
                      </span>

                      {/* Notification badge */}
                      {to === ROUTES.NOTIFICATIONS && !collapsed ? (
                        <UnreadNotificationDot unreadCount={unreadCount} />
                      ) : null}

                      {/* Chevron */}
                      {!collapsed ? (
                        <ChevronRight
                          className={[
                            "ml-auto h-3.5 w-3.5 shrink-0 transition-all duration-200 motion-reduce:transition-none",
                            isActive
                              ? "text-sidebar-primary opacity-100"
                              : "text-sidebar-foreground/30 opacity-0 group-hover:opacity-100",
                          ].join(" ")}
                          aria-hidden="true"
                        />
                      ) : null}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-sidebar-border p-3 space-y-1.5">
        {/* Role mode switcher (organizer only) */}
        {role === "organizer" ? (
          <RoleModeSwitcher currentRole={role} compact={collapsed} />
        ) : null}

        {/* User card */}
        <div
          className={[
            "flex items-center gap-2.5 rounded-lg bg-sidebar-accent/30 border border-sidebar-border/50 px-2.5 py-2",
            collapsed ? "justify-center" : "",
          ].join(" ")}
        >
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-sm font-bold uppercase ring-2 ring-sidebar-primary/25">
            {(user?.name ?? user?.email ?? "U").charAt(0)}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-sidebar bg-primary" aria-hidden="true" />
          </div>
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-sidebar-foreground leading-tight">
                {user?.name ?? "User"}
              </p>
              <div className="mt-0.5">
                <RoleBadge role={role} />
              </div>
            </div>
          ) : null}
        </div>

        {/* Sign out */}
        <button
          type="button"
          className={[
            "group flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition-colors duration-150",
            "text-sidebar-foreground/60 hover:bg-destructive/10 hover:text-destructive",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
            collapsed ? "justify-center" : "",
          ].join(" ")}
          onClick={() => setLogoutDialogOpen(true)}
        >
          <LogOut className="h-4 w-4 shrink-0 transition-colors" aria-hidden="true" />
          <span className={collapsed ? "sr-only" : "inline"}>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-background">
      <div className="flex h-full overflow-hidden">

        {/* Sidebar — desktop static, mobile fixed overlay */}
        <aside
          className={[
            "fixed inset-y-0 left-0 z-40 flex h-full shrink-0 flex-col transition-[width,transform] duration-300 ease-out motion-reduce:transition-none",
            "lg:static lg:translate-x-0",
            collapsed ? "w-[60px] lg:w-[60px]" : "w-64 lg:w-64",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          {SidebarContent}
        </aside>

        {/* Mobile overlay backdrop */}
        {mobileOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-foreground/30 backdrop-blur-[2px] lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation overlay"
          />
        ) : null}

        {/* Main content area */}
        <div className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto">

          {/* Sticky top header bar */}
          <header className="sticky top-0 z-20 flex h-[60px] shrink-0 items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm px-4">
            <div className="flex items-center gap-2">
              {/* Mobile menu button */}
              <button
                type="button"
                className="inline-flex rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Desktop collapse toggle */}
              <button
                type="button"
                className="hidden rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:inline-flex"
                onClick={() => setCollapsed((prev) => !prev)}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>

              {/* Current page title */}
              <span className="text-sm font-semibold text-foreground">
                {pageTitle}
              </span>
            </div>

            {/* Header right: notifications */}
            <Link
              to={ROUTES.NOTIFICATIONS}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label={`Open notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 ? (
                <span className="absolute right-1 top-1">
                  <UnreadNotificationDot unreadCount={unreadCount} compact />
                </span>
              ) : null}
            </Link>
          </header>

          <main className="min-h-0 flex-1">{children}</main>
        </div>
      </div>

      {/* Logout confirmation dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Sign out of {role} portal?</DialogTitle>
            <DialogDescription>
              You will be returned to the home page and need to sign in again to
              access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setLogoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={executeLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
