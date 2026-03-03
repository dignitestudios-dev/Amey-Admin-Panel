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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardCounts, type DashboardCounts } from "@/lib/api/dashboard.api";

const statsConfig = [
  {
    label: "Total Rides",
    description: "All rides on platform",
    icon: Route,
    getValue: (counts: DashboardCounts) =>
      counts.ridesCount.toLocaleString("en-US"),
  },
  {
    label: "Active Rides",
    description: "Currently in progress",
    icon: Car,
    getValue: (counts: DashboardCounts) =>
      counts.activeRidesCount.toLocaleString("en-US"),
  },
  {
    label: "Passengers",
    description: "Registered passengers",
    icon: Users,
    getValue: (counts: DashboardCounts) =>
      counts.passengersCount.toLocaleString("en-US"),
  },
  {
    label: "Drivers",
    description: "Approved drivers",
    icon: UserRoundCheck,
    getValue: (counts: DashboardCounts) =>
      counts.driversCount.toLocaleString("en-US"),
  },
  {
    label: "Pending Drivers",
    description: "Awaiting approval",
    icon: Clock3,
    getValue: (counts: DashboardCounts) =>
      counts.pendingDriversCount.toLocaleString("en-US"),
  },
  {
    label: "Revenue",
    description: "Total platform revenue",
    icon: CircleDollarSign,
    getValue: (counts: DashboardCounts) =>
      formatCurrency(counts.revenue),
  },
  {
    label: "Platform Commission",
    description: "Commission earned",
    icon: CarFront,
    getValue: (counts: DashboardCounts) =>
      formatCurrency(counts.platformCommission),
  },
] as const;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

export default function DashboardPage() {
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);

  const dashboardCountsQuery = useQuery({
    queryKey: ["dashboard-counts", appliedStartDate, appliedEndDate],
    queryFn: () =>
      getDashboardCounts({
        startDate: appliedStartDate || undefined,
        endDate: appliedEndDate || undefined,
      }),
  });

  const counts = dashboardCountsQuery.data?.data;

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
        <Card className="border-destructive/20">
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
          <Card key={stat.label} className="border-primary/10 transition-colors hover:border-primary/30">
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
    </div>
  );
}
