import {
  IconDashboard, IconBriefcase, IconLinkedin, IconClock, IconUsers,
  IconKanban, IconChart, IconSettings,
} from "@/components/icons";

export const NAV_SECTIONS = [
  {
    group: null,
    items: [{ href: "/dashboard", label: "Dashboard", icon: IconDashboard }],
  },
  {
    group: "Activity",
    items: [
      { href: "/applications", label: "Applications", icon: IconBriefcase },
      { href: "/linkedin", label: "LinkedIn", icon: IconLinkedin },
      { href: "/followups", label: "Follow-ups", icon: IconClock },
    ],
  },
  {
    group: "Sales",
    items: [
      { href: "/contacts", label: "Contacts", icon: IconUsers },
      { href: "/pipeline", label: "Pipeline", icon: IconKanban },
    ],
  },
  {
    group: "Analytics",
    items: [{ href: "/reports", label: "Reports", icon: IconChart }],
  },
  {
    group: "System",
    items: [{ href: "/settings", label: "Settings", icon: IconSettings }],
  },
] as const;
