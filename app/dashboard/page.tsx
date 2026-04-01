"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Car,
  CarFront,
  CircleDollarSign,
  Clock3,
  Loader2,
  Route,
  Users,
  UserRoundCheck,
} from "lucide-react";
import { ChartAreaStacked } from "@/components/charts-and-graphs/ChartAreaStacked";
import { ChartBarMultiple } from "@/components/charts-and-graphs/ChartBarMultiple";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardCounts, getDashboardStats, type DashboardCounts } from "@/lib/api/dashboard.api";
import { useRouter } from "next/navigation";

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

const statsConfig = [
  {
    label: "Total Rides",
    description: "All rides on platform",
    icon: Route,
    getValue: (counts: DashboardCounts) =>
      counts.ridesCount.toLocaleString("en-US"),
    url: "/dashboard/rides",
  },
  {
    label: "Active Rides",
    description: "Currently in progress",
    icon: Car,
    getValue: (counts: DashboardCounts) =>
      counts.activeRidesCount.toLocaleString("en-US"),
    url: "/dashboard/rides?status=in-progress",
  },
  {
    label: "Passengers",
    description: "Registered passengers",
    icon: Users,
    getValue: (counts: DashboardCounts) =>
      counts.passengersCount.toLocaleString("en-US"),
    url: "/dashboard/users",
  },
  {
    label: "Drivers",
    description: "Approved drivers",
    icon: UserRoundCheck,
    getValue: (counts: DashboardCounts) =>
      counts.driversCount.toLocaleString("en-US"),
    url: "/dashboard/drivers?status=approved",
  },
  {
    label: "Pending Drivers",
    description: "Awaiting approval",
    icon: Clock3,
    getValue: (counts: DashboardCounts) =>
      counts.pendingDriversCount.toLocaleString("en-US"),
     url: "/dashboard/drivers?status=pending",
  },
  {
    label: "Revenue",
    description: "Total platform revenue",
    icon: CircleDollarSign,
    getValue: (counts: DashboardCounts) =>
      formatCurrency(counts.revenue),
    url: "/dashboard/reports",
  },
  {
    label: "Platform Commission",
    description: "Commission earned",
    icon: CarFront,
    getValue: (counts: DashboardCounts) =>
      formatCurrency(counts.platformCommission),
    url: "/dashboard/reports",
  },
] as const;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

export default function DashboardPage() {
  const currentYear = new Date().getFullYear();
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [draftYear, setDraftYear] = useState(String(currentYear));
  const [appliedYear, setAppliedYear] = useState(currentYear);
  const [dateError, setDateError] = useState<string | null>(null);
  const [yearError, setYearError] = useState<string | null>(null);
  const router = useRouter();
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

  const ridesByMonthMap = new Map(
    (dashboardStats?.ridesByMonth ?? []).map((item) => [item.month, item.totalRides]),
  );

  const revenueByMonthMap = new Map(
    (dashboardStats?.revenueByMonth ?? []).map((item) => [item.month, item]),
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
      setDateError("Select both start and end dates to apply a range.");
      return;
    }

    if (hasStartDate && hasEndDate) {
      if (draftEndDate <= draftStartDate) {
        setDateError("End date must be after start date.");
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

  const handleApplyYearFilter = () => {
    const parsedYear = Number.parseInt(draftYear, 10);

    if (!Number.isInteger(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
      setYearError("Enter a valid year between 2000 and 2100.");
      return;
    }

    setYearError(null);
    setAppliedYear(parsedYear);
  };

  const handleResetYearFilter = () => {
    setYearError(null);
    setDraftYear(String(currentYear));
    setAppliedYear(currentYear);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Dashboard Overview</h2>
        <p className="text-sm text-muted-foreground">Monitor platform performance and operational metrics in real time.</p>
      </div>

      <Card className="border-primary/10">
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="dashboard-start-date">Start Date</Label>
              <Input
                id="dashboard-start-date"
                type="date"
                value={draftStartDate}
                onChange={(event) => setDraftStartDate(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dashboard-end-date">End Date</Label>
              <Input
                id="dashboard-end-date"
                type="date"
                value={draftEndDate}
                onChange={(event) => setDraftEndDate(event.target.value)}
              />
            </div>
            <div className="flex items-end gap-2 md:col-span-2">
              <Button onClick={handleApplyDateFilter} disabled={dashboardCountsQuery.isFetching}>
                Apply
              </Button>
              <Button
                variant="outline"
                onClick={handleClearDateFilter}
                disabled={!draftStartDate && !draftEndDate && !appliedStartDate && !appliedEndDate}
              >
                Clear
              </Button>
            </div>
          </div>
          {dateError ? (
            <p className="mt-2 text-sm text-destructive">{dateError}</p>
          ) : null}
        </CardContent>
      </Card>

      {dashboardCountsQuery.error ? (
        <Card  className="border-destructive/20">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
            <p className="text-sm text-destructive">
              {dashboardCountsQuery.error instanceof Error
                ? dashboardCountsQuery.error.message
                : "Unable to load dashboard stats."}
            </p>
            <Button onClick={() => dashboardCountsQuery.refetch()} disabled={dashboardCountsQuery.isFetching}>
              {dashboardCountsQuery.isFetching && <Loader2 className="mr-2 size-4 animate-spin" />}
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsConfig.map((stat) => (
          <Card key={stat.label} onClick={()=>router.push(stat.url)} className="cursor-pointer border-primary/10 transition-colors hover:border-primary/30">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardDescription>{stat.label}</CardDescription>
                <div className="rounded-lg border border-primary/20 bg-primary/10 p-2 text-primary">
                  <stat.icon className="size-4" />
                </div>
              </div>
              <CardTitle className="text-2xl">
                {dashboardCountsQuery.isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : counts ? (
                  stat.getValue(counts)
                ) : (
                  "--"
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Charts Filter</CardTitle>
          <CardDescription>Choose a year to view monthly rides and revenue trends.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="space-y-1.5 md:col-span-1">
              <Label htmlFor="dashboard-year">Year</Label>
              <Input
                id="dashboard-year"
                type="number"
                min={2000}
                max={2100}
                value={draftYear}
                onChange={(event) => setDraftYear(event.target.value)}
              />
            </div>
            <div className="flex items-end gap-2 md:col-span-3">
              <Button onClick={handleApplyYearFilter} disabled={dashboardStatsQuery.isFetching}>
                Apply
              </Button>
              <Button variant="outline" onClick={handleResetYearFilter} disabled={dashboardStatsQuery.isFetching}>
                Current Year
              </Button>
            </div>
          </div>
          {yearError ? <p className="mt-2 text-sm text-destructive">{yearError}</p> : null}
        </CardContent>
      </Card>

      {dashboardStatsQuery.error ? (
        <Card className="border-destructive/20">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
            <p className="text-sm text-destructive">
              {dashboardStatsQuery.error instanceof Error
                ? dashboardStatsQuery.error.message
                : "Unable to load chart data."}
            </p>
            <Button onClick={() => dashboardStatsQuery.refetch()} disabled={dashboardStatsQuery.isFetching}>
              {dashboardStatsQuery.isFetching && <Loader2 className="mr-2 size-4 animate-spin" />}
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 gricols-1">
        {dashboardStatsQuery.isLoading ? (
          <>
            <Card className="border-primary/10">
              <CardHeader>
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-52" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[320px] w-full" />
              </CardContent>
            </Card>
            <Card className="border-primary/10">
              <CardHeader>
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-52" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[320px] w-full" />
              </CardContent>
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
  );
}
