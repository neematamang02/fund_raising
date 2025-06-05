import { useState, useContext } from "react";
import {
  Home2,
  InfoCircle,
  Heart,
  MoneyRecive,
  UserEdit,
  Add,
  Profile,
  Logout as LogoutIcon,
  Login,
  UserAdd,
  CloseSquare,
  Grid2,
  Setting2,
} from "iconsax-reactjs";
import { AuthContext } from "@/context/AuthContext";
import ROUTES from "@/routes/routes";
import { Link, useNavigate } from "react-router-dom";
import { FundraisingButton } from "./ui/fundraising-button";
import ToggleRole from "./ToggleRole";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

// Shadcn UI Dialog
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function NavigationBar() {
  const [open, setOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const router = useNavigate();

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

  // Dynamically build navigation links
  const navLinks = [
    { name: "Home", path: ROUTES.HOME, icon: Home2 },
    { name: "About Us", path: ROUTES.ABOUT, icon: InfoCircle },
    { name: "Donate", path: ROUTES.DONATE, icon: Heart },
    ...(user?.role === "admin"
      ? [
          {
            name: "Applications",
            path: ROUTES.ADMIN_APPLICATIONS,
            icon: Setting2,
          },
        ]
      : user?.role === "organizer"
      ? [{ name: "My Campaigns", path: ROUTES.MY_CAMPAIGNS, icon: Heart }]
      : user
      ? [
          {
            name: "My Donations",
            path: ROUTES.MY_DONATIONS,
            icon: MoneyRecive,
          },
          {
            name: "Apply Organizer",
            path: ROUTES.APPLY_ORGANIZER,
            icon: UserEdit,
          },
        ]
      : []),
  ];

  return (
    <>
      <nav className="bg-gradient-to-r from-indigo-900 via-blue-800 to-purple-900 text-white shadow-xl sticky top-0 w-full z-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link
              to={ROUTES.HOME}
              className="text-2xl font-bold text-white hover:text-amber-300 transition-colors duration-300 flex items-center gap-2"
            >
              <Heart size={24} variant="Broken" className="text-amber-300" />
              Fund-Raising
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex lg:items-center lg:space-x-1">
              {navLinks.map(({ name, path, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/15 transition-all duration-300 hover:scale-105 group text-sm font-medium"
                >
                  <Icon
                    size={18}
                    variant="Broken"
                    className="text-amber-300 group-hover:text-white transition-colors duration-300"
                  />
                  <span className="text-white/90 group-hover:text-white">
                    {name}
                  </span>
                </Link>
              ))}

              {user?.role === "organizer" && (
                <Link to={ROUTES.CREATE_CAMPAIGN}>
                  <FundraisingButton
                    variant="warm"
                    size="default"
                    className="ml-2"
                  >
                    <Add size={18} variant="Broken" />
                    Create Campaign
                  </FundraisingButton>
                </Link>
              )}

              <div className="flex items-center ml-4">
                {user?.role === "admin" ? (
                  <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium px-4 py-1 shadow-md shadow-red-500/20">
                    Admin
                  </Badge>
                ) : (
                  <ToggleRole />
                )}
              </div>

              {/* Auth Buttons */}
              <div className="flex items-center gap-3 ml-6 pl-6 border-l border-white/20">
                {user ? (
                  <>
                    <FundraisingButton
                      variant="trust"
                      size="default"
                      onClick={() => handleNavigation(ROUTES.DASHBOARD)}
                    >
                      <Profile size={18} variant="Broken" />
                      {user.name}
                    </FundraisingButton>

                    <Dialog
                      open={logoutDialogOpen}
                      onOpenChange={setLogoutDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <FundraisingButton variant="destructive" size="default">
                          <LogoutIcon size={18} variant="Broken" />
                          Logout
                        </FundraisingButton>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Logout</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to log out?
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => setLogoutDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={confirmLogout}>
                            Yes, log out
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                ) : (
                  <>
                    <Link to={ROUTES.LOGIN}>
                      <FundraisingButton variant="trust" size="default">
                        <Login size={18} variant="Broken" />
                        Login
                      </FundraisingButton>
                    </Link>
                    <Link to={ROUTES.REGISTER}>
                      <FundraisingButton variant="donate" size="default">
                        <UserAdd size={18} variant="Broken" />
                        Register
                      </FundraisingButton>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setOpen(!open)}
                className="inline-flex items-center justify-center p-2 rounded-xl hover:bg-white/15 transition-all duration-300 hover:scale-105"
              >
                {open ? (
                  <CloseSquare
                    size={24}
                    variant="Broken"
                    className="text-amber-300"
                  />
                ) : (
                  <Grid2
                    size={24}
                    variant="Broken"
                    className="text-amber-300"
                  />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="lg:hidden bg-gradient-to-b from-indigo-900/95 to-purple-900/95 backdrop-blur-md border-t border-white/10 animate-fadeIn">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map(({ name, path, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/15 transition-all duration-300 group text-sm font-medium"
                >
                  <Icon
                    size={20}
                    variant="Broken"
                    className="text-amber-300 group-hover:text-white transition-colors duration-300"
                  />
                  <span className="text-white/90 group-hover:text-white">
                    {name}
                  </span>
                </Link>
              ))}

              {user?.role === "organizer" && (
                <div className="px-4 py-2">
                  <FundraisingButton
                    variant="warm"
                    size="default"
                    fullWidth
                    onClick={() => {
                      handleNavigation(ROUTES.CREATE_CAMPAIGN);
                      setOpen(false);
                    }}
                  >
                    <Add size={20} variant="Broken" />
                    Create Campaign
                  </FundraisingButton>
                </div>
              )}

              <div className="px-4 py-2">
                {user?.role === "admin" ? (
                  <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium px-4 py-1 shadow-md">
                    Admin
                  </Badge>
                ) : (
                  <ToggleRole mobile />
                )}
              </div>

              <div className="border-t border-white/10 pt-4 mt-4 px-4 space-y-2">
                {user ? (
                  <>
                    <FundraisingButton
                      variant="trust"
                      size="default"
                      fullWidth
                      onClick={() => {
                        handleNavigation(ROUTES.DASHBOARD);
                        setOpen(false);
                      }}
                    >
                      <Profile size={20} variant="Broken" />
                      {user.name}
                    </FundraisingButton>

                    <Dialog
                      open={logoutDialogOpen}
                      onOpenChange={setLogoutDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <FundraisingButton
                          variant="destructive"
                          size="default"
                          fullWidth
                        >
                          <LogoutIcon size={20} variant="Broken" />
                          Logout
                        </FundraisingButton>
                      </DialogTrigger>
                    </Dialog>
                  </>
                ) : (
                  <>
                    <Link to={ROUTES.LOGIN} onClick={() => setOpen(false)}>
                      <FundraisingButton
                        variant="trust"
                        size="default"
                        fullWidth
                      >
                        <Login size={20} variant="Broken" />
                        Login
                      </FundraisingButton>
                    </Link>
                    <Link to={ROUTES.REGISTER} onClick={() => setOpen(false)}>
                      <FundraisingButton
                        variant="donate"
                        size="default"
                        fullWidth
                      >
                        <UserAdd size={20} variant="Broken" />
                        Register
                      </FundraisingButton>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Shared Logout Dialog (desktop + mobile) */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="space-x-2">
            <Button
              variant="outline"
              onClick={() => setLogoutDialogOpen(false)}
            >
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
