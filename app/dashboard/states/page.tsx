"use client";

import StatesOverviewTable from "./components/states-data-table";
import { ChevronRight } from "lucide-react";

export default function StatesPage() {
  return (
    <div className="flex flex-col min-w-0">
      {/* Signature EpicRides Page Header */}
      <header className="border-b border-border/60 bg-card/60 px-5 sm:px-6 pt-5 pb-5 backdrop-blur-md">
        <nav className="mb-2 flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <span>Compliance</span>
          <ChevronRight className="size-3 opacity-50" />
          <span className="text-foreground font-medium">Territories & States</span>
        </nav>
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <p className="eyebrow mb-1">Operating jurisdictions</p>
            <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
              Compliance & Zones
            </h1>
            <p className="text-[15px] leading-relaxed text-muted-foreground mt-0.5">
              Cross-state operating compliance, active duty fleet distribution, and regional passenger footprint.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5">
              <span className="relative flex size-2 mr-0.5 self-center">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              <span className="text-[12px] uppercase tracking-[0.05em] text-primary font-semibold">Jurisdiction:</span>
              <span className="text-xs font-semibold tnum text-primary">Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 lg:p-7 max-w-[1600px] w-full mx-auto space-y-4">
        <StatesOverviewTable />
      </div>
    </div>
  );
}
