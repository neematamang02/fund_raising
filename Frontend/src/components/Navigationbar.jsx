import { useState, useContext } from "react";
import {
  Home,
  Info,
  Heart,
  Bell,
  UserCog,
  Plus,
  UserCircle,
  LogOut,
  LogIn,
  UserPlus,
  X,
  LayoutGrid,
  Settings,
  Wallet,
  ClipboardList,
  BadgeDollarSign,
  ChevronDown,
} from "lucide-react";
import { AuthContext } from "@/Context/AuthContext";
import ROUTES from "@/routes/routes";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ToggleRole from "./ToggleRole";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function NavigationBar() {
  const [open, setOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const router = useNavigate();
  const location = useLocation();

  const confirmLogout = () => {
    logout();
    router(ROUTES.HOME);
    toast.success("Logged out successfully");
    setLogoutDialogOpen(false);
    setOpen(false);
  };

  const handleNavigation = (path) => {
    router(path);
    setOpen(false);
  };

  const getRoleHomePath = () => {
    if (user?.role === "admin") return ROUTES.ADMIN_DASHBOARD;
    if (user?.role === "organizer") return ROUTES.ORGANIZER_DASHBOARD;
    return ROUTES.HOME;
  };

  const isActive = (path) => location.pathname === path;

  const shouldShowPublicLinks = !user || user.role === "donor";
  const navLinks = [
    ...(shouldShowPublicLinks
      ? [
          { name: "Home", path: ROUTES.HOME, icon: Home },
          { name: "About", path: ROUTES.ABOUT, icon: Info },
          { name: "Donate", path: ROUTES.DONATE, icon: Heart },
        ]
      : []),
    ...(user
      ? [{ name: "Notifications", path: ROUTES.NOTIFICATIONS, icon: Bell }]
      : []),
    ...(user?.role === "admin"
      ? [
          { name: "Admin Home", path: ROUTES.ADMIN_DASHBOARD, icon: LayoutGrid },
          { name: "Applications", path: ROUTES.ADMIN_APPLICATIONS, icon: ClipboardList },
          { name: "Organizer Profiles", path: ROUTES.ADMIN_ORGANIZER_PROFILES, icon: UserCog },
          { name: "Campaigns", path: ROUTES.ADMIN_CAMPAIGNS, icon: Heart },
          { name: "Users", path: ROUTES.ADMIN_USERS, icon: UserCircle },
          { name: "Withdrawals", path: ROUTES.ADMIN_WITHDRAWALS, icon: Wallet },
          { name: "Donations", path: ROUTES.ADMIN_DONATIONS, icon: BadgeDollarSign },
          { name: "Activity Logs", path: ROUTES.ADMIN_ACTIVITIES, icon: Settings },
        ]
      : user?.role === "organizer"
        ? [
            { name: "Organizer Home", path: ROUTES.ORGANIZER_DASHBOARD, icon: LayoutGrid },
            { name: "My Campaigns", path: ROUTES.MY_CAMPAIGNS, icon: Heart },
            { name: "Organizer Profile", path: ROUTES.ORGANIZER_PROFILE, icon: UserCog },
          ]
        : user
          ? [
              { name: "My Donations", path: ROUTES.MY_DONATIONS, icon: BadgeDollarSign },
              { name: "Apply Organizer", path: ROUTES.APPLY_ORGANIZER, icon: UserCog },
              { name: "Application Status", path: ROUTES.APPLICATION_STATUS, icon: ClipboardList },
            ]
          : []),
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Logo */}
            <Link
              to={getRoleHomePath()}
              className="flex items-center gap-2 shrink-0"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-black ring-2 ring-primary/20">
                H
              </span>
              <span className="text-lg font-bold text-foreground">HopeOn</span>
            </Link>

            {/* Desktop links */}
            <div className="hidden lg:flex lg:items-center lg:gap-1">
              {navLinks.map(({ name, path }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(path)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {name}
                </Link>
              ))}

              {user?.role === "organizer" && (
                <Link to={ROUTES.CREATE_CAMPAIGN}>
                  <Button size="sm" className="ml-1 bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-1.5" />
                    Create Campaign
                  </Button>
                </Link>
              )}
            </div>

            {/* Right section */}
            <div className="hidden lg:flex lg:items-center lg:gap-3">
              {user?.role === "admin" ? (
                <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                  Admin
                </Badge>
              ) : (
                <ToggleRole />
              )}

              <div className="flex items-center gap-2 border-l border-border pl-3">
                {user ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleNavigation(getRoleHomePath())}
                      className="gap-2"
                    >
                      <UserCircle className="h-4 w-4" />
                      {user.name}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLogoutDialogOpen(true)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4 mr-1.5" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to={ROUTES.LOGIN}>
                      <Button variant="ghost" size="sm">
                        <LogIn className="h-4 w-4 mr-1.5" />
                        Login
                      </Button>
                    </Link>
                    <Link to={ROUTES.REGISTER}>
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        <UserPlus className="h-4 w-4 mr-1.5" />
                        Register
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle menu"
            >
              {open ? (
                <X className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden border-t border-border bg-background">
            <div className="mx-auto max-w-7xl px-4 py-3 space-y-1">
              {navLinks.map(({ name, path, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(path)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {name}
                </Link>
              ))}

              {user?.role === "organizer" && (
                <button
                  onClick={() => {
                    handleNavigation(ROUTES.CREATE_CAMPAIGN);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary bg-primary/8 hover:bg-primary/15 transition-colors"
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  Create Campaign
                </button>
              )}

              {/* Role switcher */}
              <div className="pt-1 pb-1">
                {user?.role === "admin" ? (
                  <div className="px-3 py-2">
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                      Admin
                    </Badge>
                  </div>
                ) : (
                  <div className="px-3 py-2">
                    <ToggleRole />
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-3 mt-2 space-y-1">
                {user ? (
                  <>
                    <button
                      onClick={() => {
                        handleNavigation(getRoleHomePath());
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
                    >
                      <UserCircle className="h-4 w-4 shrink-0" />
                      {user.name}
                    </button>
                    <button
                      onClick={() => {
                        setOpen(false);
                        setLogoutDialogOpen(true);
                      }}
                      className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to={ROUTES.LOGIN}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <LogIn className="h-4 w-4 shrink-0" />
                      Login
                    </Link>
                    <Link
                      to={ROUTES.REGISTER}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/15 transition-colors"
                    >
                      <UserPlus className="h-4 w-4 shrink-0" />
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Logout confirmation dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setLogoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmLogout}>
              Yes, log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
