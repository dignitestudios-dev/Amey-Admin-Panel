"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Car,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  DollarSign,
  Loader2,
  Shield,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getReportAnalytics,
  getRevenueReport,
  type RevenueReportItem,
} from "@/lib/api/reports.api";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

const formatDateTime = (value: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getFullYear() <= 1971) return "-";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getInitials = (value: string) => {
  const parts = value.trim().split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (parts[0]?.slice(0, 2) || "NA").toUpperCase();
};

const PersonInfo = ({
  fullName,
  email,
  phoneNumber,
  profileImageUrl,
}: {
  fullName: string;
  email: string;
  phoneNumber?: string;
  profileImageUrl?: string;
}) => (
  <div className="flex items-center gap-2.5">
    <Avatar className="size-7 rounded-full border border-primary/20 bg-primary/10">
      <AvatarImage src={profileImageUrl} alt={fullName} />
      <AvatarFallback className="text-[12px] font-semibold text-primary">
        {getInitials(fullName || "NA")}
      </AvatarFallback>
    </Avatar>
    <div className="min-w-0 leading-tight">
      <p className="truncate text-[15px] font-medium text-foreground">{fullName || "Unknown"}</p>
      <p className="truncate text-[13px] text-muted-foreground">{email || phoneNumber || "-"}</p>
    </div>
  </div>
);

export default function ReportsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const revenueQuery = useQuery({
    queryKey: ["reports", "revenue", page, limit],
    queryFn: () => getRevenueReport({ page, limit }),
  });

  const analyticsQuery = useQuery({
    queryKey: ["reports", "analytics"],
    queryFn: getReportAnalytics,
  });

  const revenueRows = revenueQuery.data?.data.revenue ?? [];
  const pagination = revenueQuery.data?.data.pagination;
  const analytics = analyticsQuery.data?.data;

  const passengerAnalytics = analytics?.passenger[0];
  const totalDrivers = analytics?.driver.totalDrivers ?? 0;
  const armedDrivers = analytics?.driver.armedDriver ?? 0;
  const unarmedDrivers = Math.max(totalDrivers - armedDrivers, 0);

  const revenueTotals = useMemo(() => {
    return revenueRows.reduce(
      (accumulator, row) => ({
        actualFare: accumulator.actualFare + row.actualFare,
        platformCommission: accumulator.platformCommission + row.platformCommission,
        stripeFee: accumulator.stripeFee + row.stripeFee,
        driverAmount: accumulator.driverAmount + row.driverAmount,
      }),
      { actualFare: 0, platformCommission: 0, stripeFee: 0, driverAmount: 0 }
    );
  }, [revenueRows]);

  const canGoPrev = page > 1;
  const canGoNext = page < (pagination?.totalPages ?? 1);

  return (
    <div className="flex flex-col min-w-0">
      {/* Signature EpicRides Page Header */}
      <header className="border-b border-border/60 bg-card/60 px-5 sm:px-6 pt-5 pb-5 backdrop-blur-md">
        <nav className="mb-2 flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <span>Financials</span>
          <ChevronRight className="size-3 opacity-50" />
          <span className="text-foreground font-medium">Finance & Payouts</span>
        </nav>
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <p className="eyebrow mb-1">Platform economics</p>
            <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
              Finance & Payouts
            </h1>
            <p className="text-[15px] leading-relaxed text-muted-foreground mt-0.5">
              Gross fare ledger, platform commissions, driver payouts, and state revenue velocity.
            </p>
          </div>

          {/* Quick Metrics Badges in Header */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-baseline gap-1.5 rounded-md border border-border/70 bg-background/60 px-2.5 py-1">
              <span className="text-[12px] uppercase tracking-[0.05em] text-muted-foreground">Page Fare</span>
              <span className="text-xs font-semibold tnum text-primary">
                {formatCurrency(revenueTotals.actualFare)}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 rounded-md border border-border/70 bg-background/60 px-2.5 py-1">
              <span className="text-[12px] uppercase tracking-[0.05em] text-muted-foreground">Commission</span>
              <span className="text-xs font-semibold tnum text-foreground">
                {formatCurrency(revenueTotals.platformCommission)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 lg:p-7 max-w-[1600px] w-full mx-auto space-y-5">
        {/* Metric Cards Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border/70 bg-card/85 p-3.5 backdrop-blur-md shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                Page Gross GMV
              </span>
              <DollarSign className="size-4 text-primary" />
            </div>
            <div className="mt-2 text-[26px] font-semibold tracking-tight text-foreground font-mono tnum">
              {formatCurrency(revenueTotals.actualFare)}
            </div>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Sum of actual ride fares on this page
            </p>
          </div>

          <div className="rounded-lg border border-border/70 bg-card/85 p-3.5 backdrop-blur-md shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                Platform Commission
              </span>
              <TrendingUp className="size-4 text-primary" />
            </div>
            <div className="mt-2 text-[26px] font-semibold tracking-tight text-primary font-mono tnum">
              {formatCurrency(revenueTotals.platformCommission)}
            </div>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Net revenue retained by platform
            </p>
          </div>

          <div className="rounded-lg border border-border/70 bg-card/85 p-3.5 backdrop-blur-md shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                Active Fleet
              </span>
              <Car className="size-4 text-primary" />
            </div>
            <div className="mt-2 text-[26px] font-semibold tracking-tight text-foreground font-mono tnum">
              {totalDrivers}
            </div>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Armed: {armedDrivers} · Standard: {unarmedDrivers}
            </p>
          </div>

          <div className="rounded-lg border border-border/70 bg-card/85 p-3.5 backdrop-blur-md shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                Rider Base
              </span>
              <Users className="size-4 text-primary" />
            </div>
            <div className="mt-2 text-[26px] font-semibold tracking-tight text-foreground font-mono tnum">
              {passengerAnalytics?.totalUsers ?? 0}
            </div>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Active: {passengerAnalytics?.activeUsers ?? 0} · Inactive: {passengerAnalytics?.dormantUsers ?? 0}
            </p>
          </div>
        </div>

        {/* Analytics Breakdown Deck */}
        {!analyticsQuery.isLoading && analytics && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-lg border border-border/70 bg-card/85 backdrop-blur-md shadow-xs">
              <CardHeader className="p-4 pb-2 border-b border-border/60">
                <CardTitle className="text-[15px] font-semibold tracking-tight text-foreground inline-flex items-center gap-2">
                  <TrendingUp className="size-4 text-primary" />
                  Top Territories by Ride Velocity
                </CardTitle>
                <CardDescription className="text-[13px] text-muted-foreground">
                  Highest trip density states across platform operations.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {(analytics?.states.topStates ?? []).map((item, index) => (
                  <div
                    key={`${item.id}-top`}
                    className="flex items-center justify-between rounded-md border border-border/60 bg-background/50 px-3 py-2"
                  >
                    <div className="inline-flex items-center gap-2 text-[14px] font-medium text-foreground">
                      <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[12px] font-bold text-primary">
                        #{index + 1}
                      </span>
                      <span>{item.id}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-[14px] font-mono font-semibold text-foreground tnum">
                      <Activity className="size-3 text-muted-foreground" />
                      <span>{item.totalRides.toLocaleString()} rides</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-lg border border-border/70 bg-card/85 backdrop-blur-md shadow-xs">
              <CardHeader className="p-4 pb-2 border-b border-border/60">
                <CardTitle className="text-[15px] font-semibold tracking-tight text-foreground inline-flex items-center gap-2">
                  <TrendingDown className="size-4 text-muted-foreground" />
                  Emerging Jurisdictions
                </CardTitle>
                <CardDescription className="text-[13px] text-muted-foreground">
                  States with early-stage growth trajectory.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {(analytics?.states.leastStates ?? []).map((item, index) => (
                  <div
                    key={`${item.id}-least`}
                    className="flex items-center justify-between rounded-md border border-border/60 bg-background/50 px-3 py-2"
                  >
                    <div className="inline-flex items-center gap-2 text-[14px] font-medium text-foreground">
                      <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[12px] font-bold text-muted-foreground">
                        #{index + 1}
                      </span>
                      <span>{item.id}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-[14px] font-mono font-semibold text-muted-foreground tnum">
                      <Activity className="size-3" />
                      <span>{item.totalRides.toLocaleString()} rides</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Revenue Ledger Card */}
        <Card className="rounded-lg border border-border/70 bg-card/85 backdrop-blur-md shadow-xs overflow-hidden">
          <CardHeader className="p-4 border-b border-border/60 bg-muted/20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-[15px] font-semibold tracking-tight text-foreground">
                  Revenue Ledger & Payout Log
                </CardTitle>
                <CardDescription className="text-[13px] text-muted-foreground">
                  Individual ride fare settlement, fee allocations, and payout amounts.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="size-3.5 text-primary" />
                <span className="text-[13px] font-mono text-muted-foreground tnum">
                  Total transactions: {pagination?.total ?? revenueRows.length}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="w-full text-[15px]">
                <TableHeader className="bg-muted/30 border-b border-border/70">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="h-9 px-4 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                      Ride ID
                    </TableHead>
                    <TableHead className="h-9 px-4 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                      Date
                    </TableHead>
                    <TableHead className="h-9 px-4 text-right text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                      Fare
                    </TableHead>
                    <TableHead className="h-9 px-4 text-right text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                      Commission
                    </TableHead>
                    <TableHead className="h-9 px-4 text-right text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                      Stripe Fee
                    </TableHead>
                    <TableHead className="h-9 px-4 text-right text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                      Driver Payout
                    </TableHead>
                    <TableHead className="h-9 px-4 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                      Driver
                    </TableHead>
                    <TableHead className="h-9 px-4 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                      Passenger
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenueQuery.isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-12 text-muted-foreground text-xs"
                      >
                        Loading financial ledger...
                      </TableCell>
                    </TableRow>
                  ) : revenueQuery.error ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-12 text-destructive text-xs"
                      >
                        Failed to load ledger records
                      </TableCell>
                    </TableRow>
                  ) : revenueRows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-12 text-muted-foreground text-xs"
                      >
                        No revenue records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    revenueRows.map((row: RevenueReportItem) => (
                      <TableRow
                        key={row.rideId}
                        className="hover:bg-muted/40 border-b border-border/50 transition-colors"
                      >
                        <TableCell className="px-4 py-2.5">
                          <span className="font-mono text-[13px] text-muted-foreground">
                            {row.rideId ? row.rideId.slice(0, 10) + "..." : "-"}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-2.5 font-mono text-[13px] text-muted-foreground tnum">
                          {formatDateTime(row.rideDate)}
                        </TableCell>
                        <TableCell className="px-4 py-2.5 text-right font-mono font-medium text-foreground tnum">
                          {formatCurrency(row.actualFare)}
                        </TableCell>
                        <TableCell className="px-4 py-2.5 text-right font-mono font-medium text-primary tnum">
                          {formatCurrency(row.platformCommission)}
                        </TableCell>
                        <TableCell className="px-4 py-2.5 text-right font-mono text-muted-foreground tnum">
                          {formatCurrency(row.stripeFee)}
                        </TableCell>
                        <TableCell className="px-4 py-2.5 text-right font-mono font-semibold text-foreground tnum">
                          {formatCurrency(row.driverAmount)}
                        </TableCell>
                        <TableCell className="px-4 py-2.5">
                          <PersonInfo
                            fullName={row.driver.fullName}
                            email={row.driver.email}
                            phoneNumber={row.driver.phoneNumber}
                            profileImageUrl={row.driver.profileImageUrl}
                          />
                        </TableCell>
                        <TableCell className="px-4 py-2.5">
                          <PersonInfo
                            fullName={row.passenger.fullName}
                            email={row.passenger.email}
                            phoneNumber={row.passenger.phoneNumber}
                            profileImageUrl={row.passenger.profileImageUrl}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination Footer */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between px-1 py-1 text-[14px] text-muted-foreground">
          <div>
            Showing <span className="font-semibold text-foreground tnum">{revenueRows.length}</span> of{" "}
            <span className="font-semibold text-foreground tnum">{pagination?.total ?? revenueRows.length}</span> records
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span>Rows:</span>
              <Select
                value={String(limit)}
                onValueChange={(value) => {
                  setLimit(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-7 w-16 text-[13px] bg-card border-border/70">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-[14px] tnum">
              Page <span className="font-semibold text-foreground">{pagination?.page ?? page}</span> of{" "}
              <span className="font-semibold text-foreground">{pagination?.totalPages ?? 1}</span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={!canGoPrev || revenueQuery.isFetching}
                className="h-7 px-2 text-[13px] rounded-md border-border/70 cursor-pointer"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((prev) =>
                    Math.min(pagination?.totalPages ?? prev + 1, prev + 1)
                  )
                }
                disabled={!canGoNext || revenueQuery.isFetching}
                className="h-7 px-2 text-[13px] rounded-md border-border/70 cursor-pointer"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
