"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Car,
  CircleDollarSign,
  Clock3,
  Route,
  Users,
  UserRoundCheck,
  CalendarDays,
  RefreshCw,
  ChevronRight,
  Percent,
  AlertCircle,
  ArrowUpRight,
  CarTaxiFront,
  MapPinHouse,
  BarChart3,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChartAreaStacked } from "@/components/charts-and-graphs/ChartAreaStacked";
import { ChartBarMultiple } from "@/components/charts-and-graphs/ChartBarMultiple";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getDashboardCounts,
  getDashboardStats,
  type DashboardCounts,
} from "@/lib/api/dashboard.api";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

interface StatConfigItem {
  label: string;
  sublabel: string;
  tag: string;
  icon: React.ElementType;
  accent: "emerald" | "sky" | "indigo" | "amber" | "teal" | "purple";
  getValue: (counts: DashboardCounts) => string;
  url: string;
}

const statsConfig: StatConfigItem[] = [
  {
    label: "Active Dispatch",
    sublabel: "Trips in transit right now",
    tag: "Realtime",
    icon: Car,
    accent: "emerald",
    getValue: (counts: DashboardCounts) =>
      counts.activeRidesCount.toLocaleString("en-US"),
    url: "/dashboard/ongoing-rides",
  },
  {
    label: "Total Completed Rides",
    sublabel: "Platform trips logged",
    tag: "Volume",
    icon: Route,
    accent: "sky",
    getValue: (counts: DashboardCounts) =>
      counts.ridesCount.toLocaleString("en-US"),
    url: "/dashboard/rides",
  },
  {
    label: "Approved Fleet",
    sublabel: "Verified duty drivers",
    tag: "Active",
    icon: UserRoundCheck,
    accent: "teal",
    getValue: (counts: DashboardCounts) =>
      counts.driversCount.toLocaleString("en-US"),
    url: "/dashboard/drivers?status=approved",
  },
  {
    label: "Registered Riders",
    sublabel: "Total passenger profiles",
    tag: "Accounts",
    icon: Users,
    accent: "indigo",
    getValue: (counts: DashboardCounts) =>
      counts.passengersCount.toLocaleString("en-US"),
    url: "/dashboard/users",
  },
  {
    label: "Gross Platform GMV",
    sublabel: "Platform booking revenue",
    tag: "Financials",
    icon: CircleDollarSign,
    accent: "emerald",
    getValue: (counts: DashboardCounts) => formatCurrency(counts.revenue),
    url: "/dashboard/reports",
  },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

const getAccentBadge = (accent: StatConfigItem["accent"]) => {
  switch (accent) {
    case "emerald":
      return "border-primary/30 bg-primary/10 text-primary";
    case "sky":
      return "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400";
    case "indigo":
      return "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400";
    case "teal":
      return "border-teal-500/30 bg-teal-500/10 text-teal-600 dark:text-teal-400";
    case "amber":
      return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "purple":
      return "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400";
  }
};

export default function DashboardPage() {
  const currentYear = new Date().getFullYear();
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [appliedYear, setAppliedYear] = useState(currentYear);
  const [dateError, setDateError] = useState<string | null>(null);
  const router = useRouter();

  const todayString = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date());
  }, []);

  const dashboardCountsQuery = useQuery({
    queryKey: ["dashboard-counts", appliedStartDate, appliedEndDate],
    queryFn: () =>
      getDashboardCounts({
        startDate: appliedStartDate || undefined,
        endDate: appliedEndDate || undefined,
      }),
  });

  const dashboardStatsQuery = useQuery({
    queryKey: ["dashboard-stats", appliedYear],
    queryFn: () => getDashboardStats({ year: appliedYear }),
  });

  const counts = dashboardCountsQuery.data?.data;
  const dashboardStats = dashboardStatsQuery.data?.data;

  const isRefreshing =
    dashboardCountsQuery.isFetching || dashboardStatsQuery.isFetching;

  const handleRefreshAll = () => {
    dashboardCountsQuery.refetch();
    dashboardStatsQuery.refetch();
  };

  const ridesByMonthMap = new Map(
    (dashboardStats?.ridesByMonth ?? []).map((item) => [
      item.month,
      item.totalRides,
    ])
  );

  const revenueByMonthMap = new Map(
    (dashboardStats?.revenueByMonth ?? []).map((item) => [item.month, item])
  );

  const ridesLineData = monthNames.map((month, index) => ({
    month,
    totalRides: ridesByMonthMap.get(index + 1) ?? 0,
  }));

  const revenueBarData = monthNames.map((month, index) => {
    const monthRevenue = revenueByMonthMap.get(index + 1);
    return {
      month,
      totalRevenue: monthRevenue?.totalRevenue ?? 0,
      platformCommission: monthRevenue?.platformCommission ?? 0,
      netRevenue: monthRevenue?.netRevenue ?? 0,
    };
  });

  const handleApplyDateFilter = () => {
    const hasStartDate = Boolean(draftStartDate);
    const hasEndDate = Boolean(draftEndDate);

    if (hasStartDate !== hasEndDate) {
      setDateError("Select both start and end date.");
      return;
    }

    if (hasStartDate && hasEndDate) {
      if (draftEndDate <= draftStartDate) {
        setDateError("End date must follow start date.");
        return;
      }
    }

    setDateError(null);
    setAppliedStartDate(draftStartDate);
    setAppliedEndDate(draftEndDate);
  };

  const handleClearDateFilter = () => {
    setDateError(null);
    setDraftStartDate("");
    setDraftEndDate("");
    setAppliedStartDate("");
    setAppliedEndDate("");
  };

  const hasActiveDateFilter = Boolean(appliedStartDate || appliedEndDate);

  return (
    <div className="flex flex-col min-w-0">
      {/* Signature EpicRides Command Center Header Banner */}
      <header className="border-b border-border/60 bg-card/60 px-5 sm:px-6 pt-5 pb-5 backdrop-blur-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between max-w-[1600px] mx-auto w-full">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="eyebrow">
                {todayString} · Live Telemetry
              </span>
            </div>
            <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
              Command Center
            </h1>
            <p className="text-[15px] leading-relaxed text-muted-foreground mt-0.5">
              Realtime dispatch, fleet utilization, gross revenue pacing, and driver intake
            </p>
          </div>

          {/* Quick Realtime KPI Status Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Operational Status */}
            <div className="flex items-baseline gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1">
              <span className="relative flex size-2 mr-0.5 self-center">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              <span className="text-[12px] uppercase tracking-[0.05em] text-primary font-semibold">Network:</span>
              <span className="text-xs font-semibold tnum text-primary">Healthy</span>
            </div>

            {/* Active Trips Badge */}
            <div className="flex items-baseline gap-1.5 rounded-md border border-border/70 bg-background/60 px-2.5 py-1">
              <span className="text-[12px] uppercase tracking-[0.05em] text-muted-foreground">Active Trips</span>
              <span className="text-xs font-semibold tnum text-primary">
                {counts ? counts.activeRidesCount.toLocaleString("en-US") : "--"}
              </span>
            </div>

            {/* Pending Driver Review Alert Badge */}
            {counts && counts.pendingDriversCount > 0 ? (
              <Link
                href="/dashboard/drivers?status=pending"
                className="flex items-baseline gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 hover:bg-amber-500/20 transition-colors cursor-pointer"
              >
                <AlertCircle className="size-3 self-center text-amber-600 dark:text-amber-400" />
                <span className="text-[12px] uppercase tracking-[0.05em] text-amber-600 dark:text-amber-400 font-semibold">Pending Review</span>
                <span className="text-xs font-semibold tnum text-amber-600 dark:text-amber-400">
                  {counts.pendingDriversCount}
                </span>
              </Link>
            ) : null}

            {/* Fleet Drivers Count */}
            <div className="hidden sm:flex items-baseline gap-1.5 rounded-md border border-border/70 bg-background/60 px-2.5 py-1">
              <span className="text-[12px] uppercase tracking-[0.05em] text-muted-foreground">Fleet</span>
              <span className="text-xs font-semibold tnum text-foreground">
                {counts ? counts.driversCount.toLocaleString("en-US") : "--"}
              </span>
            </div>

            {/* Realtime Refresh Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="h-7 px-2.5 text-xs font-medium gap-1.5 rounded-md border-border/70 bg-background/60 shadow-none hover:border-primary/40 cursor-pointer transition-colors"
            >
              <RefreshCw
                className={`size-3 ${
                  isRefreshing ? "animate-spin text-primary" : "text-muted-foreground"
                }`}
              />
              <span className="text-[13px]">
                {isRefreshing ? "Syncing..." : "Sync"}
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-6 lg:p-7 max-w-[1600px] w-full mx-auto space-y-5">
        {/* Date Filter & Control Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border/40 bg-card/70 p-3 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-primary" />
            <span className="text-xs font-semibold text-foreground tracking-tight">
              Telemetry Scope & Date Filter
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-md border border-border/50 bg-background/60 px-2.5 py-1">
              <span className="text-[12px] uppercase font-semibold text-muted-foreground">
                From
              </span>
              <Input
                type="date"
                aria-label="Start date"
                value={draftStartDate}
                onChange={(e) => setDraftStartDate(e.target.value)}
                className="h-6 w-28 border-0 bg-transparent p-0 text-[13px] shadow-none focus-visible:ring-0"
              />
              <span className="text-[13px] text-muted-foreground/60">–</span>
              <span className="text-[12px] uppercase font-semibold text-muted-foreground">
                To
              </span>
              <Input
                type="date"
                aria-label="End date"
                value={draftEndDate}
                onChange={(e) => setDraftEndDate(e.target.value)}
                className="h-6 w-28 border-0 bg-transparent p-0 text-[13px] shadow-none focus-visible:ring-0"
              />
            </div>

            <Button
              size="sm"
              onClick={handleApplyDateFilter}
              disabled={dashboardCountsQuery.isFetching}
              className="h-7 px-3 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md cursor-pointer transition-colors"
            >
              Apply Filter
            </Button>

            {hasActiveDateFilter && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearDateFilter}
                className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {dateError && (
          <p className="text-xs text-destructive font-medium px-1">
            {dateError}
          </p>
        )}

        {/* Pending Driver Review Alert Card */}
        {counts && counts.pendingDriversCount > 0 && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-center justify-between text-xs backdrop-blur-md transition-colors">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="size-4.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <p className="text-foreground font-semibold">
                  Driver Onboarding Queue: {counts.pendingDriversCount} applicant
                  {counts.pendingDriversCount > 1 ? "s" : ""} awaiting review
                </p>
                <p className="text-muted-foreground text-[13px]">
                  Driver licenses, background clearances, and vehicle registrations need administrative verification.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push("/dashboard/drivers?status=pending")}
              className="h-7 px-3 text-xs border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 gap-1.5 cursor-pointer font-semibold rounded-md"
            >
              <span>Review Queue</span>
              <ArrowUpRight className="size-3" />
            </Button>
          </div>
        )}

        {/* EpicRides Style Metric KPI Cards Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {statsConfig.map((stat) => {
            const badgeStyle = getAccentBadge(stat.accent);
            return (
              <div
                key={stat.label}
                onClick={() => router.push(stat.url)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(stat.url);
                  }
                }}
                className="group relative flex flex-col justify-between rounded-lg border border-border/50 bg-card/80 p-3.5 backdrop-blur-md transition-all duration-200 hover:border-primary/40 hover:shadow-xs hover:-translate-y-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold uppercase tracking-[0.04em] whitespace-nowrap truncate text-muted-foreground/80">
                      {stat.label}
                    </span>
                    <div
                      className={`flex size-6 items-center justify-center rounded-md border ${badgeStyle}`}
                    >
                      <stat.icon className="size-3.5" />
                    </div>
                  </div>

                  <div className="mt-2 text-[26px] sm:text-[28px] font-semibold tracking-tight text-foreground font-mono tnum">
                    {dashboardCountsQuery.isLoading ? (
                      <Skeleton className="h-7 w-20 rounded" />
                    ) : counts ? (
                      stat.getValue(counts)
                    ) : (
                      "--"
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-2 text-[13px] text-muted-foreground">
                  <span className="truncate">{stat.sublabel}</span>
                  <ChevronRight className="size-3 text-muted-foreground/60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Analytics Trajectory Section */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between border-b border-border/30 pb-2">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-primary" />
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Performance & Revenue Pacing
              </h2>
            </div>

            {/* Year Switcher Pills */}
            <div className="flex items-center gap-1 rounded-md border border-border/50 bg-background/50 p-0.5 text-xs backdrop-blur-md">
              {[currentYear - 2, currentYear - 1, currentYear].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setAppliedYear(yr)}
                  className={`px-2.5 py-0.5 rounded text-[13px] font-medium transition-colors cursor-pointer ${
                    appliedYear === yr
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {dashboardStatsQuery.isLoading ? (
              <>
                <Card className="rounded-lg border border-border/50 bg-card/80 p-4 backdrop-blur-md">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-[240px] w-full rounded" />
                </Card>
                <Card className="rounded-lg border border-border/50 bg-card/80 p-4 backdrop-blur-md">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-[240px] w-full rounded" />
                </Card>
              </>
            ) : (
              <>
                <ChartAreaStacked data={ridesLineData} year={appliedYear} />
                <ChartBarMultiple data={revenueBarData} year={appliedYear} />
              </>
            )}
          </div>
        </div>

        {/* Operational Fleet Diagnostics Deck */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 border-b border-border/30 pb-2">
            <ShieldCheck className="size-4 text-primary" />
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Operational Fleet Modules
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/dashboard/ongoing-rides"
              className="group flex flex-col justify-between rounded-lg border border-border/50 bg-card/80 p-3.5 backdrop-blur-md transition-all duration-200 hover:border-primary/40 hover:shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  Live Dispatch Grid
                </span>
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
              </div>
              <p className="text-[13px] text-muted-foreground mt-1">
                Real-time active ride telemetry, ongoing pick-ups and drops.
              </p>
              <div className="mt-3 flex items-center justify-between text-[13px] font-medium text-primary">
                <span>Open Dispatch</span>
                <ChevronRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>

            <Link
              href="/dashboard/drivers"
              className="group flex flex-col justify-between rounded-lg border border-border/50 bg-card/80 p-3.5 backdrop-blur-md transition-all duration-200 hover:border-primary/40 hover:shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  Fleet Roster & KYC
                </span>
                <CarTaxiFront className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-[13px] text-muted-foreground mt-1">
                Driver verification, licensing compliance, and duty state.
              </p>
              <div className="mt-3 flex items-center justify-between text-[13px] font-medium text-primary">
                <span>Manage Fleet</span>
                <ChevronRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>

            <Link
              href="/dashboard/states"
              className="group flex flex-col justify-between rounded-lg border border-border/50 bg-card/80 p-3.5 backdrop-blur-md transition-all duration-200 hover:border-primary/40 hover:shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  Territories & Zones
                </span>
                <MapPinHouse className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-[13px] text-muted-foreground mt-1">
                Regional fare configuration, state operating zones, and boundaries.
              </p>
              <div className="mt-3 flex items-center justify-between text-[13px] font-medium text-primary">
                <span>Configure Zones</span>
                <ChevronRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>

            <Link
              href="/dashboard/reports"
              className="group flex flex-col justify-between rounded-lg border border-border/50 bg-card/80 p-3.5 backdrop-blur-md transition-all duration-200 hover:border-primary/40 hover:shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  Financial Settlement
                </span>
                <BarChart3 className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-[13px] text-muted-foreground mt-1">
                Platform fee reconciliation, revenue accounting, and payouts.
              </p>
              <div className="mt-3 flex items-center justify-between text-[13px] font-medium text-primary">
                <span>View Financials</span>
                <ChevronRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
