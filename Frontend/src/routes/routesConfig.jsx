import { lazy } from "react";
import Home from "@/Pages/Home";
import LoginPage from "@/Pages/Authentication/Loginpage";
import RegisterPage from "@/Pages/Authentication/Registerpage";
import Donate from "@/Pages/Donate";
import MyDonations from "@/Pages/MyDonations";
import ApplyOrganizer from "@/Pages/ApplyOrganizer";
import WithdrawalRequest from "@/Pages/WithdrawalRequest";
import About from "@/Pages/About";
import RequireRole from "@/components/RequireRole";
import ROUTES from "./routes";
import Dashboard from "@/Pages/Dashboard";
import CreateCampaign from "@/Pages/Campagincreation/CreateCampaign";
import { CampaignList } from "@/Pages/CampaignList";
import MyCampaigns from "@/Pages/MyCampaigns";
import ForgotPasswordPage from "@/Pages/Authentication/ForgotPasswordPage";
import ResetPasswordPage from "@/Pages/Authentication/ResetPasswordPage";
import Otpverification from "@/Pages/Authentication/Otpverification";

const AdminDashboard = lazy(() => import("@/Pages/AdminDashboard"));
const AdminCampaigns = lazy(() => import("@/Pages/AdminCampaigns"));
const AdminActivities = lazy(() => import("@/Pages/AdminActivities"));
const AdminUsers = lazy(() => import("@/Pages/AdminUsers"));
const AdminDonations = lazy(() => import("@/Pages/AdminDonations"));
const AdminApplications = lazy(() => import("@/Pages/AdminApplications"));
const AdminWithdrawals = lazy(() => import("@/Pages/AdminWithdrawals"));

const routesConfig = [
  // Public pages
  { path: ROUTES.HOME, Component: Home },
  { path: ROUTES.LOGIN, Component: LoginPage },
  { path: ROUTES.REGISTER, Component: RegisterPage },
  { path: ROUTES.ABOUT, Component: About },
  { path: ROUTES.FORGOT_PASSWORD, Component: ForgotPasswordPage },
  { path: ROUTES.RESET_PASSWORD, Component: ResetPasswordPage },
  { path: ROUTES.OTP_VERIFICATION, Component: Otpverification },
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
    path: ROUTES.ADMIN_DASHBOARD,
    Component: () => (
      <RequireRole role="admin">
        <AdminDashboard />
      </RequireRole>
    ),
  },
  {
    path: ROUTES.ADMIN_CAMPAIGNS,
    Component: () => (
      <RequireRole role="admin">
        <AdminCampaigns />
      </RequireRole>
    ),
  },
  {
    path: ROUTES.ADMIN_ACTIVITIES,
    Component: () => (
      <RequireRole role="admin">
        <AdminActivities />
      </RequireRole>
    ),
  },
  {
    path: ROUTES.ADMIN_USERS,
    Component: () => (
      <RequireRole role="admin">
        <AdminUsers />
      </RequireRole>
    ),
  },
  {
    path: ROUTES.ADMIN_DONATIONS,
    Component: () => (
      <RequireRole role="admin">
        <AdminDonations />
      </RequireRole>
    ),
  },
  {
    path: ROUTES.ADMIN_APPLICATIONS,
    Component: () => (
      <RequireRole role="admin">
        <AdminApplications />
      </RequireRole>
    ),
  },
  {
    path: ROUTES.ADMIN_WITHDRAWALS,
    Component: () => (
      <RequireRole role="admin">
        <AdminWithdrawals />
      </RequireRole>
    ),
  },

  // Organizer withdrawal request
  {
    path: ROUTES.WITHDRAWAL_REQUEST,
    Component: () => (
      <RequireRole role="organizer">
        <WithdrawalRequest />
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
