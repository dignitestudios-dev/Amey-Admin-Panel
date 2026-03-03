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
import { Progress } from "@/components/ui/progress";
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
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getFullYear() <= 1971) {
    return "-";
  }

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
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

const RevenueTableSkeleton = () => (
  <Card className="border-primary/10">
    <CardHeader className="pb-3">
      <Skeleton className="h-5 w-44" />
      <Skeleton className="h-4 w-60" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-[360px] w-full" />
    </CardContent>
  </Card>
);

const PersonInfo = ({
  fullName,
  email,
  phoneNumber,
  profileImageUrl,
}: {
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImageUrl: string;
}) => (
  <div className="flex items-center gap-3">
    <Avatar className="size-8 border border-border/60">
      {profileImageUrl ? <AvatarImage src={profileImageUrl} alt={fullName} /> : null}
      <AvatarFallback className="text-[10px]">{getInitials(fullName)}</AvatarFallback>
    </Avatar>
    <div className="min-w-0">
      <p className="truncate text-sm font-medium">{fullName}</p>
      <p className="truncate text-xs text-muted-foreground">{email}</p>
      <p className="truncate text-xs text-muted-foreground">{phoneNumber}</p>
    </div>
  </div>
);

export default function ReportsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const revenueQuery = useQuery({
    queryKey: ["reports", "revenue", page, limit],
    queryFn: () => getRevenueReport({ page, limit }),
    placeholderData: (previousData) => previousData,
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
      { actualFare: 0, platformCommission: 0, stripeFee: 0, driverAmount: 0 },
    );
  }, [revenueRows]);

  const canGoPrev = page > 1;
  const canGoNext = page < (pagination?.totalPages ?? 1);

  return (
    <div className="flex flex-col gap-4 @container/main px-4 lg:px-6 mt-2 pb-4">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Revenue operations and platform health insights in one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-primary/10 transition-colors hover:border-primary/30">
          <CardHeader className="pb-2">
            <CardDescription>Total Fare (current page)</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(revenueTotals.actualFare)}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground inline-flex items-center gap-2">
            <DollarSign className="size-3.5 text-primary" />
            Sum of ride fares
          </CardContent>
        </Card>

        <Card className="border-primary/10 transition-colors hover:border-primary/30">
          <CardHeader className="pb-2">
            <CardDescription>Platform Commission</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(revenueTotals.platformCommission)}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground inline-flex items-center gap-2">
            <TrendingUp className="size-3.5 text-primary" />
            Revenue retained by platform
          </CardContent>
        </Card>

        <Card className="border-primary/10 transition-colors hover:border-primary/30">
          <CardHeader className="pb-2">
            <CardDescription>Total Drivers</CardDescription>
            <CardTitle className="text-2xl">{totalDrivers}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground inline-flex items-center gap-2">
            <Car className="size-3.5 text-primary" />
            Armed: {armedDrivers} · Unarmed: {unarmedDrivers}
          </CardContent>
        </Card>

        <Card className="border-primary/10 transition-colors hover:border-primary/30">
          <CardHeader className="pb-2">
            <CardDescription>Passenger Activity</CardDescription>
            <CardTitle className="text-2xl">{passengerAnalytics?.totalUsers ?? 0}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground inline-flex items-center gap-2">
            <Users className="size-3.5 text-primary" />
            Active: {passengerAnalytics?.activeUsers ?? 0} · Dormant: {passengerAnalytics?.dormantUsers ?? 0}
          </CardContent>
        </Card>
      </div>

      {analyticsQuery.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-primary/10">
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
          <Card className="border-primary/10">
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
          <Card className="border-primary/10">
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : analyticsQuery.error ? (
        <Card className="border-destructive/20">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
            <p className="text-sm text-destructive">
              {analyticsQuery.error instanceof Error
                ? analyticsQuery.error.message
                : "Unable to load report analytics."}
            </p>
            <Button onClick={() => analyticsQuery.refetch()} disabled={analyticsQuery.isFetching}>
              {analyticsQuery.isFetching && <Loader2 className="mr-2 size-4 animate-spin" />}
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base inline-flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" /> Top States by Rides
              </CardTitle>
              <CardDescription>Highest ride volume states.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(analytics?.states.topStates ?? []).map((item, index) => (
                <div key={`${item.id}-top`} className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <div className="inline-flex items-center gap-2 text-sm font-medium">
                    <Badge className="rounded-full border bg-primary/10 text-primary border-primary/20">#{index + 1}</Badge>
                    {item.id}
                  </div>
                  <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="size-4" />
                    <span className="font-semibold text-foreground">{item.totalRides}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base inline-flex items-center gap-2">
                <TrendingDown className="size-4 text-primary" /> Least States by Rides
              </CardTitle>
              <CardDescription>Lowest ride volume states.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(analytics?.states.leastStates ?? []).map((item, index) => (
                <div key={`${item.id}-least`} className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <div className="inline-flex items-center gap-2 text-sm font-medium">
                    <Badge className="rounded-full border bg-muted text-muted-foreground border-border">#{index + 1}</Badge>
                    {item.id}
                  </div>
                  <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="size-4" />
                    <span className="font-semibold text-foreground">{item.totalRides}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base inline-flex items-center gap-2">
                <Users className="size-4 text-primary" /> Driver & Passenger Analytics
              </CardTitle>
              <CardDescription>Complete user segmentation from report analytics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-card p-3 space-y-2">
                <div className="text-xs text-muted-foreground">Drivers</div>
                <div className="flex items-center justify-between text-sm">
                  <span>Total Drivers</span>
                  <span className="font-semibold">{totalDrivers}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Armed Drivers</span>
                  <span className="font-semibold">{armedDrivers}</span>
                </div>
                <Progress value={totalDrivers > 0 ? (armedDrivers / totalDrivers) * 100 : 0} />
              </div>

              <div className="rounded-lg border bg-card p-3 space-y-2">
                <div className="text-xs text-muted-foreground">Passengers</div>
                <div className="flex items-center justify-between text-sm">
                  <span>Total Users</span>
                  <span className="font-semibold">{passengerAnalytics?.totalUsers ?? 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Active Users</span>
                  <span className="font-semibold">{passengerAnalytics?.activeUsers ?? 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Dormant Users</span>
                  <span className="font-semibold">{passengerAnalytics?.dormantUsers ?? 0}</span>
                </div>
                <div className="space-y-1 pt-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="flex h-full w-full">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${passengerAnalytics?.activeRatio ?? 0}%` }}
                      />
                      <div
                        className="h-full bg-primary/30"
                        style={{ width: `${passengerAnalytics?.dormantRatio ?? 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Active: {passengerAnalytics?.activeRatio ?? 0}%</span>
                    <span>Dormant: {passengerAnalytics?.dormantRatio ?? 0}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {revenueQuery.isLoading && !revenueQuery.data ? (
        <RevenueTableSkeleton />
      ) : (
        <Card className="border-primary/10">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Revenue Report</CardTitle>
                <CardDescription>
                  Complete trip-wise revenue records in a cleaner table layout.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-primary" />
                <span className="text-xs text-muted-foreground">
                  Total records: {pagination?.total ?? revenueRows.length}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {revenueQuery.isLoading ? (
              <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
                Loading revenue report...
              </div>
            ) : revenueQuery.error ? (
              <div className="rounded-lg border border-destructive/20 p-8 text-center text-sm text-destructive">
                {revenueQuery.error instanceof Error
                  ? revenueQuery.error.message
                  : "Unable to load revenue report."}
              </div>
            ) : revenueRows.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No revenue records found.
              </div>
            ) : (
              <div className="rounded-md overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50 rounded-2xl!">
                      <TableRow className="h-16 border-none rounded-2xl!">
                        <TableHead className="min-w-[190px]">Ride</TableHead>
                        <TableHead className="min-w-[150px]">Date</TableHead>
                        <TableHead className="min-w-[130px] text-right">Fare</TableHead>
                        <TableHead className="min-w-[140px] text-right">Commission</TableHead>
                        <TableHead className="min-w-[120px] text-right">Stripe Fee</TableHead>
                        <TableHead className="min-w-[140px] text-right">Driver Amount</TableHead>
                        <TableHead className="min-w-[280px]">Driver</TableHead>
                        <TableHead className="min-w-[280px]">Passenger</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenueRows.map((row: RevenueReportItem) => (
                        <TableRow key={row.rideId} className="hover:bg-gray-50 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge className="rounded-full border bg-primary/10 text-primary border-primary/20">Ride</Badge>
                              <span className="text-xs font-medium break-all">{row.rideId || "-"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{formatDateTime(row.rideDate)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(row.actualFare)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(row.platformCommission)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(row.stripeFee)}</TableCell>
                          <TableCell className="text-right font-semibold text-primary">{formatCurrency(row.driverAmount)}</TableCell>
                          <TableCell>
                            <PersonInfo
                              fullName={row.driver.fullName}
                              email={row.driver.email}
                              phoneNumber={row.driver.phoneNumber}
                              profileImageUrl={row.driver.profileImageUrl}
                            />
                          </TableCell>
                          <TableCell>
                            <PersonInfo
                              fullName={row.passenger.fullName}
                              email={row.passenger.email}
                              phoneNumber={row.passenger.phoneNumber}
                              profileImageUrl={row.passenger.profileImageUrl}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                Page {pagination?.page ?? page} of {pagination?.totalPages ?? 1}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows:</span>
                <Select
                  value={String(limit)}
                  onValueChange={(value) => {
                    setLimit(Number(value));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  className="size-8 p-0"
                  title="First page"
                  onClick={() => setPage(1)}
                  disabled={!canGoPrev || revenueQuery.isFetching}
                >
                  <ChevronsLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="size-8 p-0"
                  title="Previous page"
                  onClick={() => setPage((previousPage) => Math.max(1, previousPage - 1))}
                  disabled={!canGoPrev || revenueQuery.isFetching}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="size-8 p-0"
                  title="Next page"
                  onClick={() =>
                    setPage((previousPage) =>
                      Math.min(pagination?.totalPages ?? previousPage + 1, previousPage + 1),
                    )
                  }
                  disabled={!canGoNext || revenueQuery.isFetching}
                >
                  <ChevronRight className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="size-8 p-0"
                  title="Last page"
                  onClick={() => setPage(pagination?.totalPages ?? 1)}
                  disabled={!canGoNext || revenueQuery.isFetching}
                >
                  <ChevronsRight className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
