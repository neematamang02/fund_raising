import ROUTES from "@/routes/routes";
import {
  Bell,
  ClipboardList,
  FolderKanban,
  HandCoins,
  Heart,
  Home,
  Info,
  LayoutDashboard,
  Shield,
  Users,
  Wallet,
} from "lucide-react";

const ADMIN_SECTIONS = [
  {
    title: "Workspace",
    items: [
      { label: "Dashboard", to: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
      { label: "Campaigns", to: ROUTES.ADMIN_CAMPAIGNS, icon: FolderKanban },
      {
        label: "Applications",
        to: ROUTES.ADMIN_APPLICATIONS,
        icon: ClipboardList,
      },
      { label: "Withdrawals", to: ROUTES.ADMIN_WITHDRAWALS, icon: Wallet },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Users", to: ROUTES.ADMIN_USERS, icon: Users },
      {
        label: "Organizer Profiles",
        to: ROUTES.ADMIN_ORGANIZER_PROFILES,
        icon: Shield,
      },
      { label: "Donations", to: ROUTES.ADMIN_DONATIONS, icon: HandCoins },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Activity Logs",
        to: ROUTES.ADMIN_ACTIVITIES,
        icon: ClipboardList,
      },
      { label: "Notifications", to: ROUTES.NOTIFICATIONS, icon: Bell },
    ],
  },
];

const ORGANIZER_SECTIONS = [
  {
    title: "Workspace",
    items: [
      {
        label: "Dashboard",
        to: ROUTES.ORGANIZER_DASHBOARD,
        icon: LayoutDashboard,
      },
      { label: "My Campaigns", to: ROUTES.MY_CAMPAIGNS, icon: FolderKanban },
      { label: "Create Campaign", to: ROUTES.CREATE_CAMPAIGN, icon: Heart },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Profile", to: ROUTES.ORGANIZER_PROFILE, icon: Shield },
      { label: "Notifications", to: ROUTES.NOTIFICATIONS, icon: Bell },
    ],
  },
];

export function getRoleHomePath(role) {
  if (role === "admin") return ROUTES.ADMIN_DASHBOARD;
  if (role === "organizer") return ROUTES.ORGANIZER_DASHBOARD;
  if (role === "donor") return ROUTES.DASHBOARD;
  return ROUTES.HOME;
}

export function getSidebarItems(role) {
  const sections = role === "admin" ? ADMIN_SECTIONS : ORGANIZER_SECTIONS;
  return sections.flatMap((section) => section.items);
}

export function getSidebarSections(role) {
  return role === "admin" ? ADMIN_SECTIONS : ORGANIZER_SECTIONS;
}

export function getTopNavItems(user) {
  const base = [
    { label: "Home", to: ROUTES.HOME, icon: Home },
    { label: "About", to: ROUTES.ABOUT, icon: Info },
    { label: "Donate", to: ROUTES.DONATE, icon: Heart },
  ];

  if (!user) return base;

  if (user.role === "donor") {
    const isOrganizerApproved =
      user.isOrganizerApproved ||
      user.organizerApplicationStatus === "approved";

    const donorItems = [
      ...base,
      { label: "Dashboard", to: ROUTES.DASHBOARD, icon: LayoutDashboard },
      { label: "My Donations", to: ROUTES.MY_DONATIONS, icon: HandCoins },
      {
        label: "Blockchain Transparency",
        to: ROUTES.BLOCKCHAIN_TRANSPARENCY,
        icon: Shield,
      },
    ];

    if (!isOrganizerApproved) {
      donorItems.push(
        {
          label: "Apply Organizer",
          to: ROUTES.APPLY_ORGANIZER,
          icon: ClipboardList,
        },
        {
          label: "Application Status",
          to: ROUTES.APPLICATION_STATUS,
          icon: Shield,
        },
      );
    }

    donorItems.push({
      label: "Notifications",
      to: ROUTES.NOTIFICATIONS,
      icon: Bell,
    });

    return donorItems;
  }

  return [{ label: "Notifications", to: ROUTES.NOTIFICATIONS, icon: Bell }];
}
