"use client";

import { Logo } from "@/components/logo";
import { PublicRoute } from "@/components/PublicRoute";
import { AnimatedBackground } from "@/components/animated-background";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PublicRoute>
      <div className="relative flex min-h-dvh flex-col items-center justify-center p-4 sm:p-6 select-none">
        <AnimatedBackground />

        {/* Top bar with quick theme toggle */}
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>

        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 size-72 rounded-full bg-primary/10 blur-[100px]" />

        {/* Brand Emblem & Header */}
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="mb-2.5 flex size-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 shadow-sm backdrop-blur-md">
            <Logo size={24} className="drop-shadow-xs" />
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[12px] font-semibold uppercase tracking-[0.05em] text-primary">
            <ShieldCheck className="size-3" />
            <span>Amey Console</span>
          </div>
        </div>

        {/* Sleek Minimalist Authentication Card */}
        <div className="relative w-full max-w-[400px] rounded-lg border border-border/70 bg-card/90 p-5 sm:p-6 shadow-xl backdrop-blur-md">
          {children}
        </div>

        {/* Minimalist Footnote */}
        <p className="mt-6 text-center text-[13px] text-muted-foreground/80">
          &copy; {new Date().getFullYear()} Amey Platform Operations · High-security console
        </p>
      </div>
    </PublicRoute>
  );
}
