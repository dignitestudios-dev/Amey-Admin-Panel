"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Search,
  Route,
  Activity,
  Users,
  CarTaxiFront,
  ArrowUpRight,
  LayoutGrid,
  Table as TableIcon,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableEmptyState, TableErrorState } from "@/components/ui/table-empty-state";
import { getDashboardOverview, type StateOverview } from "@/lib/api/states.api";

export const STATE_CODE_MAP: Record<string, string> = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  "District of Columbia": "DC",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
};

const getStateCode = (stateName: string): string => {
  return STATE_CODE_MAP[stateName] || stateName.slice(0, 2).toUpperCase();
};

export default function StateCardsView() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: getDashboardOverview,
  });

  // Filter and sort the state list
  const filteredAndSortedStates = useMemo(() => {
    if (!data) return [];

    let list = [...data];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.state.toLowerCase().includes(q) ||
          getStateCode(item.state).toLowerCase().includes(q)
      );
    }

    // Default sort by total rides descending, then state name
    list.sort((a, b) => b.totalRides - a.totalRides || a.state.localeCompare(b.state));

    return list;
  }, [data, searchQuery]);

  const handleNavigate = (type: "rides" | "activeRides" | "passengers" | "drivers", state: string) => {
    const encoded = encodeURIComponent(state);
    switch (type) {
      case "drivers":
        router.push(`/dashboard/drivers?state=${encoded}`);
        break;
      case "passengers":
        router.push(`/dashboard/users?state=${encoded}`);
        break;
      case "rides":
        router.push(`/dashboard/rides?state=${encoded}`);
        break;
      case "activeRides":
        router.push(`/dashboard/ongoing-rides?state=${encoded}&status=active`);
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Toolbar */}
      <div className="flex items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search state name or code..."
            className="pl-9 pr-8 h-9 text-xs sm:text-sm bg-card border-border/80 focus:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center rounded-lg border border-border/80 bg-muted/40 p-0.5">
          <button
            type="button"
            title="Cards Grid View"
            onClick={() => setViewMode("cards")}
            className={`rounded-md p-1.5 transition-all ${
              viewMode === "cards"
                ? "bg-card text-primary shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Table View"
            onClick={() => setViewMode("table")}
            className={`rounded-md p-1.5 transition-all ${
              viewMode === "table"
                ? "bg-card text-primary shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <TableIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content Rendering: Cards Grid or Table */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={`skeleton-card-${index}`}
              className="rounded-xl border border-border/70 bg-card p-3.5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-border/50">
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <TableErrorState
          error={error instanceof Error ? error.message : "Failed to load state metrics"}
          onRetry={() => refetch()}
        />
      ) : filteredAndSortedStates.length === 0 ? (
        <TableEmptyState
          icon={MapPin}
          title="No states found"
          description={
            searchQuery
              ? `No states matched your search "${searchQuery}".`
              : "No states available."
          }
          actionLabel={searchQuery ? "Clear search" : undefined}
          onAction={searchQuery ? () => setSearchQuery("") : undefined}
        />
      ) : viewMode === "cards" ? (
        /* Professional Compact State Cards Grid */
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {filteredAndSortedStates.map((item) => {
            const code = getStateCode(item.state);
            const hasActiveRides = item.activeRides > 0;

            return (
              <div
                key={item.state}
                className="group relative flex flex-col justify-between rounded-xl border border-border/70 bg-card p-3.5 transition-all duration-200 hover:border-primary/40 hover:shadow-xs"
              >
                <div>
                  {/* Card Header: State Badge & Live/Idle Status */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs border border-primary/20 tracking-wider">
                        {code}
                      </div>
                      <h3 className="font-semibold text-sm text-foreground tracking-tight truncate group-hover:text-primary transition-colors">
                        {item.state}
                      </h3>
                    </div>

                    {hasActiveRides ? (
                      <Badge
                        variant="outline"
                        className="rounded-full border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium text-[10px] px-2 py-0.5 inline-flex items-center gap-1.5 shrink-0"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {item.activeRides} Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="rounded-full border-border/50 bg-muted/30 text-muted-foreground/70 font-medium text-[10px] px-2 py-0.5 shrink-0"
                      >
                        Idle
                      </Badge>
                    )}
                  </div>

                  {/* 2x2 Metric Tiles */}
                  <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-border/50">
                    {/* Rides */}
                    <button
                      type="button"
                      onClick={() => handleNavigate("rides", item.state)}
                      className="flex flex-col justify-between rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/60 hover:border-border transition-all p-2 text-left cursor-pointer group/tile"
                    >
                      <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                        <span className="flex items-center gap-1.5 truncate font-medium">
                          <Route className="h-3 w-3 text-muted-foreground/80 group-hover/tile:text-primary transition-colors" />
                          Rides
                        </span>
                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover/tile:opacity-100 transition-opacity text-primary shrink-0" />
                      </div>
                      <span className="mt-1 text-sm font-bold text-foreground tabular-nums">
                        {item.totalRides.toLocaleString()}
                      </span>
                    </button>

                    {/* Active */}
                    <button
                      type="button"
                      onClick={() => handleNavigate("activeRides", item.state)}
                      className={`flex flex-col justify-between rounded-lg border transition-all p-2 text-left cursor-pointer group/tile ${
                        hasActiveRides
                          ? "border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40"
                          : "border-border/40 bg-muted/20 hover:bg-muted/60 hover:border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                        <span className="flex items-center gap-1.5 truncate font-medium">
                          <Activity
                            className={`h-3 w-3 ${
                              hasActiveRides ? "text-emerald-500" : "text-muted-foreground/80"
                            }`}
                          />
                          Active
                        </span>
                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover/tile:opacity-100 transition-opacity text-emerald-500 shrink-0" />
                      </div>
                      <span
                        className={`mt-1 text-sm font-bold tabular-nums ${
                          hasActiveRides ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                        }`}
                      >
                        {item.activeRides.toLocaleString()}
                      </span>
                    </button>

                    {/* Drivers */}
                    <button
                      type="button"
                      onClick={() => handleNavigate("drivers", item.state)}
                      className="flex flex-col justify-between rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/60 hover:border-border transition-all p-2 text-left cursor-pointer group/tile"
                    >
                      <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                        <span className="flex items-center gap-1.5 truncate font-medium">
                          <CarTaxiFront className="h-3 w-3 text-muted-foreground/80 group-hover/tile:text-amber-500 transition-colors" />
                          Drivers
                        </span>
                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover/tile:opacity-100 transition-opacity text-amber-500 shrink-0" />
                      </div>
                      <span className="mt-1 text-sm font-bold text-foreground tabular-nums">
                        {item.drivers.toLocaleString()}
                      </span>
                    </button>

                    {/* Passengers */}
                    <button
                      type="button"
                      onClick={() => handleNavigate("passengers", item.state)}
                      className="flex flex-col justify-between rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/60 hover:border-border transition-all p-2 text-left cursor-pointer group/tile"
                    >
                      <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                        <span className="flex items-center gap-1.5 truncate font-medium">
                          <Users className="h-3 w-3 text-muted-foreground/80 group-hover/tile:text-purple-500 transition-colors" />
                          Passengers
                        </span>
                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover/tile:opacity-100 transition-opacity text-purple-500 shrink-0" />
                      </div>
                      <span className="mt-1 text-sm font-bold text-foreground tabular-nums">
                        {item.passengers.toLocaleString()}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Alternate Clean Table View */
        <div className="rounded-xl border border-border/80 bg-card text-card-foreground shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>State</TableHead>
                  <TableHead className="text-center">Total Rides</TableHead>
                  <TableHead className="text-center">Active Rides</TableHead>
                  <TableHead className="text-center">Passengers</TableHead>
                  <TableHead className="text-center">Drivers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedStates.map((row) => (
                  <TableRow key={row.state} className="transition-colors">
                    <TableCell className="font-semibold text-foreground">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                          {getStateCode(row.state)}
                        </span>
                        <span>{row.state}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() => handleNavigate("rides", row.state)}
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline hover:opacity-80 transition-opacity cursor-pointer text-sm"
                      >
                        {row.totalRides.toLocaleString()}
                        <ArrowUpRight className="h-3 w-3 opacity-60" />
                      </button>
                    </TableCell>

                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() => handleNavigate("activeRides", row.state)}
                        className={`inline-flex items-center gap-1 font-semibold hover:underline hover:opacity-80 transition-opacity cursor-pointer text-sm ${
                          row.activeRides > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {row.activeRides.toLocaleString()}
                        <ArrowUpRight className="h-3 w-3 opacity-60" />
                      </button>
                    </TableCell>

                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() => handleNavigate("passengers", row.state)}
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline hover:opacity-80 transition-opacity cursor-pointer text-sm"
                      >
                        {row.passengers.toLocaleString()}
                        <ArrowUpRight className="h-3 w-3 opacity-60" />
                      </button>
                    </TableCell>

                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() => handleNavigate("drivers", row.state)}
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline hover:opacity-80 transition-opacity cursor-pointer text-sm"
                      >
                        {row.drivers.toLocaleString()}
                        <ArrowUpRight className="h-3 w-3 opacity-60" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
