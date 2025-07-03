import Home from "@/pages/Home";
import LoginPage from "@/pages/Authentication/Loginpage";
import RegisterPage from "@/pages/Authentication/Registerpage";
import Donate from "@/pages/Donate";
import MyDonations from "@/pages/MyDonations";
import ApplyOrganizer from "@/pages/ApplyOrganizer";
import AdminApplications from "@/pages/AdminApplications";
import About from "@/pages/About";
import RequireRole from "@/components/RequireRole";
import ROUTES from "./routes";
import Dashboard from "@/Pages/Dashboard";
import CreateCampaign from "@/Pages/Campagincreation/CreateCampaign";
import { CampaignList } from "@/Pages/CampaignList";
import MyCampaigns from "@/Pages/MyCampaigns";
import ForgotPasswordPage from "@/Pages/Authentication/ForgotPasswordPage";
import ResetPasswordPage from "@/Pages/Authentication/ResetPasswordPage";

const routesConfig = [
  // Public pages
  { path: ROUTES.HOME, Component: Home },
  { path: ROUTES.LOGIN, Component: LoginPage },
  { path: ROUTES.REGISTER, Component: RegisterPage },
  { path: ROUTES.ABOUT, Component: About },
  { path: ROUTES.FORGOT_PASSWORD, Component: ForgotPasswordPage },
  { path: ROUTES.RESET_PASSWORD, Component: ResetPasswordPage },
  {
    path: ROUTES.DONATE, // "/donate"
    Component: CampaignList,
  },
  // Donor‐only pages
  {
    path: ROUTES.DONATE_DETAIL,
    Component: () => (
      <RequireRole role="donor">
        <Donate />
      </RequireRole>
    ),
  },
  {
    path: ROUTES.MY_DONATIONS,
    Component: () => (
      <RequireRole role="donor">
        <MyDonations />
      </RequireRole>
    ),
  },
  {
    path: ROUTES.MY_CAMPAIGNS,
    Component: () => (
      <RequireRole role="organizer">
        <MyCampaigns />
      </RequireRole>
    ),
  },

  // Organizer‐only pages
  {
    path: ROUTES.CREATE_CAMPAIGN,
    Component: () => (
      <RequireRole role="organizer">
        <CreateCampaign />
      </RequireRole>
    ),
  },

  // Admin‐only pages
  {
    path: ROUTES.ADMIN_APPLICATIONS,
    Component: () => (
      <RequireRole role="admin">
        <AdminApplications />
      </RequireRole>
    ),
  },

  // Donor can apply to be organizer
  {
    path: ROUTES.APPLY_ORGANIZER,
    Component: () => (
      <RequireRole role="donor">
        <ApplyOrganizer />
      </RequireRole>
    ),
  },
  {
    path: ROUTES.DASHBOARD,
    Component: () => (
      <RequireRole role="donor">
        <Dashboard />
      </RequireRole>
    ),
  },
];

export default routesConfig;
