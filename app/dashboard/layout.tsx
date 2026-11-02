"use client";

import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useSidebarConfig } from "@/hooks/use-sidebar-config";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AnimatedBackground } from "@/components/animated-background";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { config } = useSidebarConfig();

  return (
    <ProtectedRoute>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "236px",
            "--sidebar-width-icon": "3rem",
            "--header-height": "3.5rem",
          } as React.CSSProperties
        }
        className={config.collapsible === "none" ? "sidebar-none-mode" : ""}
      >
        {/* Animated Fluid Aurora Background */}
        <AnimatedBackground />

        {config.side === "left" ? (
          <>
            <AppSidebar
              variant={config.variant}
              collapsible={config.collapsible}
              side={config.side}
            />
            <SidebarInset className="bg-transparent flex flex-col min-h-screen">
              <SiteHeader />
              <main className="flex flex-1 flex-col min-w-0">
                {children}
              </main>
            </SidebarInset>
          </>
        ) : (
          <>
            <SidebarInset className="bg-transparent flex flex-col min-h-screen">
              <SiteHeader />
              <main className="flex flex-1 flex-col min-w-0">
                {children}
              </main>
            </SidebarInset>
            <AppSidebar
              variant={config.variant}
              collapsible={config.collapsible}
              side={config.side}
            />
          </>
        )}
      </SidebarProvider>
    </ProtectedRoute>
  );
}
