"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname.includes("/dashboard/drivers")) return "Drivers";
    if (pathname.includes("/dashboard/users")) return "Passengers";
    if (pathname.includes("/dashboard/ongoing-rides")) return "Live Rides";
    if (pathname.includes("/dashboard/rides")) return "Rides History";
    if (pathname.includes("/dashboard/states")) return "States";
    if (pathname.includes("/dashboard/reports")) return "Revenue & Reports";
    if (pathname.includes("/dashboard/notifications")) return "Notifications";
    return "Command Center";
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/80 px-3 backdrop-blur-md sm:px-4 transition-colors">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 size-7 rounded-md border border-border bg-background shadow-xs hover:bg-muted hover:text-foreground transition-colors" />
        <Separator
          orientation="vertical"
          className="mx-1 h-3.5 bg-border"
        />
        <div className="flex items-center gap-1.5 text-[15px]">
          <span className="text-muted-foreground">Amey</span>
          <span className="text-muted-foreground/50">/</span>
          <span className="font-semibold text-foreground tracking-tight">
            {getPageTitle()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Live Network Radar Pill */}
        <div className="flex items-center gap-1.5 rounded-md border border-primary/25 bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          <span className="text-[13px] font-medium leading-none tracking-tight">
            Live Ops
          </span>
        </div>

        {/* Security Badge */}
        <div className="hidden md:flex items-center gap-1 rounded-md border border-border bg-background/60 px-2 py-1 text-[13px] font-medium text-muted-foreground">
          <ShieldCheck className="size-3.5 text-primary" />
          <span>Active</span>
        </div>

        {/* Dark / Light Mode Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
