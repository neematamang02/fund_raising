import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "@/Context/AuthContext";
import Footer from "@/components/Footer";
import TopNav from "@/components/navigation/TopNav";
import RoleSidebarLayout from "@/components/navigation/RoleSidebarLayout";
import ROUTES from "@/routes/routes";

const AUTH_ROUTES = new Set([
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.OTP_VERIFICATION,
]);

export default function AppShell({ children }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const isAuthRoute = AUTH_ROUTES.has(location.pathname);
  const role = user?.role;
  const useSidebarLayout =
    !isAuthRoute && (role === "admin" || role === "organizer");

  if (isAuthRoute) {
    return <main className="min-h-screen bg-slate-50">{children}</main>;
  }

  if (useSidebarLayout) {
    return <RoleSidebarLayout role={role}>{children}</RoleSidebarLayout>;
  }

  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-slate-50">{children}</main>
      <Footer />
    </>
  );
}
