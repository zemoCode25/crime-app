"use client";

import * as React from "react";
import {
  GalleryVerticalEnd,
  DiamondMinus,
  LayoutDashboard,
  ChartColumnIncreasing,
  UserLock,
  BellElectric,
  Settings,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "James Magan",
    email: "jamesmagan@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Muntinlupa City",
      logo: GalleryVerticalEnd,
      plan: "Crime Mapping App",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Crime",
      url: "#",
      icon: DiamondMinus,
      isActive: true,
      items: [
        {
          title: "Cases",
          url: "/crime/cases",
        },
        {
          title: "Map",
          url: "/crime/map",
        },
      ],
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: ChartColumnIncreasing,
    },
    {
      title: "Manage Accounts",
      url: "/manage-accounts",
      icon: UserLock,
    },
    {
      title: "Emergency",
      url: "/emergency",
      icon: BellElectric,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} className="z-50">
      <SidebarHeader className="!z-50">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="!z-50">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
