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
import useSupabaseBrowser from "@/server/supabase/client";

// Navigation data
const sidebarData = {
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
      isActive: false,
      items: [
        {
          title: "Push Notification",
          url: "/emergency/push-notification",
        },
        {
          title: "Records",
          url: "/emergency/records",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings/profile",
      icon: Settings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const supabase = useSupabaseBrowser();
  const [userData, setUserData] = React.useState({
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "",
  });

  React.useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserData({
          name: data.user.user_metadata?.full_name || "John Doe",
          email: data.user.email || "john.doe@example.com",
          avatar: data.user.user_metadata?.avatar_url || "",
        });
      }
    }
    fetchUser();
  }, [supabase]);

  return (
    <Sidebar collapsible="icon" {...props} className="z-50">
      <SidebarHeader className="!z-50">
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent className="!z-50">
        <NavMain items={sidebarData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
