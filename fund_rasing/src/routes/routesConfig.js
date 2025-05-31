import Loginpage from "@/Pages/Authentication/Loginpage";
import Registerpage from "@/Pages/Authentication/Registerpage";
import Donate from "@/Pages/Donate";
import Home from "@/Pages/Home";
import ROUTES from "./routes";
import CreateCampaign from "@/Pages/Campagincreation/CreateCampaign";
import About from "@/Pages/About";

const routesConfig = [
  { path: ROUTES.HOME, Component: Home },
  { path: ROUTES.Login_Page, Component: Loginpage },
  { path: ROUTES.Register_page, Component: Registerpage },
  { path: ROUTES.Donate_page, Component: Donate },
  { path: ROUTES.Create_campaignpg, Component: CreateCampaign },
  { path: ROUTES.About_page, Component: About },
];

export default routesConfig;
