"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  CarTaxiFront,
  Navigation,
  BarChart3,
  Bell,
  Motorbike,
  MapPinHouse,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  navGroups: [
    {
      label: "Platform Operations",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: "Fleet & Users",
      items: [
        {
          title: "States & Regions",
          url: "/dashboard/states",
          icon: MapPinHouse,
        },
        {
          title: "Passengers",
          url: "/dashboard/users",
          icon: Users,
        },
        {
          title: "Drivers",
          url: "/dashboard/drivers",
          icon: CarTaxiFront,
        },
        {
          title: "Rides History",
          url: "/dashboard/rides",
          icon: Navigation,
        },
        {
          title: "Ongoing Rides",
          url: "/dashboard/ongoing-rides",
          icon: Motorbike,
        },
      ],
    },
    {
      label: "Finance & Alerts",
      items: [
        {
          title: "Reports & Analytics",
          url: "/dashboard/reports",
          icon: BarChart3,
        },
        {
          title: "Notifications",
          url: "/dashboard/notifications",
          icon: Bell,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useSelector((state: RootState) => state.auth.user);

  const userData = user
    ? {
        name: user.name,
        email: user.email,
        avatar: "",
      }
    : {
        name: "Amey Admin",
        email: "admin@theameyapp.com",
        avatar: "",
      };

  return (
    <Sidebar
      {...props}
      className="border-r border-border/40 backdrop-blur-xl bg-sidebar/85 select-none"
    >
      <SidebarHeader className="border-b border-border/30 px-3.5 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="default"
              asChild
              className="h-9 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-md border border-primary/30 bg-primary/10 shadow-xs">
                  <Logo size={16} />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[15px] font-bold tracking-tight text-foreground">
                      Amey Command
                    </span>
                    <span className="inline-flex size-1.5 rounded-full bg-primary animate-pulse" />
                  </div>
                  <span className="text-[12px] text-muted-foreground font-mono">
                    Ops Console v1.0
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2.5">
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/30 p-2">
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
