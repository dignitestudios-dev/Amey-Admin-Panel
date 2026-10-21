"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { MapPinHouse, Search, ArrowUpRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getDashboardOverview } from "@/lib/api/states.api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { TableEmptyState, TableErrorState } from "@/components/ui/table-empty-state";

interface StateOverview {
  state: string;
  totalRides: number;
  activeRides: number;
  passengers: number;
  drivers: number;
}

export default function StatesOverviewTable() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: getDashboardOverview,
  });

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase().trim();
    return data.filter((item) => item.state.toLowerCase().includes(query));
  }, [data, searchQuery]);

  const handleClick = (type: string, state: string) => {
    switch (type) {
      case "drivers":
        router.push(`/dashboard/drivers?state=${encodeURIComponent(state)}`);
        break;
      case "passengers":
        router.push(`/dashboard/users?state=${encodeURIComponent(state)}`);
        break;
      case "rides":
        router.push(`/dashboard/rides?state=${encodeURIComponent(state)}`);
        break;
      case "activeRides":
        router.push(`/dashboard/ongoing-rides?state=${encodeURIComponent(state)}&status=active`);
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground font-medium">
          {data ? `${filteredData.length} of ${data.length} states` : ""}
        </div>

        <div className="relative w-64 sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search state..."
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
      </div>

      {/* Unified Table Card */}
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
              {isLoading ? (
                <TableSkeleton columns={5} rows={8} showAvatar={false} />
              ) : error ? (
                <TableErrorState
                  colSpan={5}
                  error={error instanceof Error ? error.message : "Failed to load state overview"}
                  onRetry={() => refetch()}
                />
              ) : filteredData.length > 0 ? (
                filteredData.map((row) => (
                  <TableRow key={row.state} className="transition-colors">
                    <TableCell className="font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <MapPinHouse className="h-4 w-4 text-primary" />
                        <span>{row.state}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() => handleClick("rides", row.state)}
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline hover:opacity-80 transition-opacity cursor-pointer text-sm"
                        title={`View rides in ${row.state}`}
                      >
                        {row.totalRides.toLocaleString()}
                        <ArrowUpRight className="h-3 w-3 opacity-60" />
                      </button>
                    </TableCell>

                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() => handleClick("activeRides", row.state)}
                        className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400 hover:underline hover:opacity-80 transition-opacity cursor-pointer text-sm"
                        title={`View ongoing rides in ${row.state}`}
                      >
                        {row.activeRides.toLocaleString()}
                        <ArrowUpRight className="h-3 w-3 opacity-60" />
                      </button>
                    </TableCell>

                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() => handleClick("passengers", row.state)}
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline hover:opacity-80 transition-opacity cursor-pointer text-sm"
                        title={`View passengers in ${row.state}`}
                      >
                        {row.passengers.toLocaleString()}
                        <ArrowUpRight className="h-3 w-3 opacity-60" />
                      </button>
                    </TableCell>

                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() => handleClick("drivers", row.state)}
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline hover:opacity-80 transition-opacity cursor-pointer text-sm"
                        title={`View drivers in ${row.state}`}
                      >
                        {row.drivers.toLocaleString()}
                        <ArrowUpRight className="h-3 w-3 opacity-60" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmptyState
                  colSpan={5}
                  icon={MapPinHouse}
                  title="No states found"
                  description={
                    searchQuery
                      ? `No state records matched "${searchQuery}".`
                      : "No state overview information is currently available."
                  }
                  actionLabel={searchQuery ? "Clear search" : undefined}
                  onAction={() => setSearchQuery("")}
                />
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}