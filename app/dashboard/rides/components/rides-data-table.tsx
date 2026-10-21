"use client";

import { useState } from "react";
import {
  Filter,
  RotateCcw,
  Search,
  Navigation,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { TablePagination } from "@/components/ui/table-pagination";
import type { Ride, RideFilters, RideStatus, RideType } from "@/lib/api/rides.api";
import { useRouter } from "next/navigation";
import { US_STATES } from "@/lib/constants/states";

interface RidesDataTableProps {
  rides: Ride[];
  filters: RideFilters;
  searchQuery: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  onFilterChange: (filters: RideFilters) => void;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (limit: number) => void;
  onRefresh?: () => void;
}

const formatDateTime = (value: string) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
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

const formatStatus = (value: string) => {
  if (!value) {
    return "Unknown";
  }

  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getStatusColor = (status: RideStatus) => {
  switch (status) {
    case "requested":
      return "text-blue-700 bg-blue-700/10 border-blue-700/20 dark:text-blue-400 dark:bg-blue-400/10";
    case "accepted":
      return "text-indigo-700 bg-indigo-700/10 border-indigo-700/20 dark:text-indigo-400 dark:bg-indigo-400/10";
    case "on-the-way":
      return "text-cyan-700 bg-cyan-700/10 border-cyan-700/20 dark:text-cyan-400 dark:bg-cyan-400/10";
    case "arrived":
      return "text-purple-700 bg-purple-700/10 border-purple-700/20 dark:text-purple-400 dark:bg-purple-400/10";
    case "in-progress":
      return "text-amber-700 bg-amber-700/10 border-amber-700/20 dark:text-amber-400 dark:bg-amber-400/10";
    case "completed":
      return "text-emerald-700 bg-emerald-700/10 border-emerald-700/20 dark:text-emerald-400 dark:bg-emerald-400/10";
    case "cancelled":
      return "text-red-700 bg-red-700/10 border-red-700/20 dark:text-red-400 dark:bg-red-400/10";
    case "expired":
      return "text-muted-foreground bg-muted border-border";
    default:
      return "text-muted-foreground bg-muted border-border";
  }
};

export function RidesDataTable({
  rides,
  filters,
  searchQuery,
  page,
  limit,
  total,
  totalPages,
  isLoading,
  isFetching,
  error,
  onFilterChange,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onRefresh,
}: RidesDataTableProps) {
  const [draftFilters, setDraftFilters] = useState<RideFilters>(filters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const router = useRouter();

  const activeFilterCount = [
    filters.status,
    filters.rideType,
    filters.state,
  ].filter((value) => value !== "all").length;

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.rideType !== "all" ||
    (filters.state && filters.state !== "all") ||
    searchQuery !== "";

  const handleClearFilters = () => {
    onFilterChange({
      status: "all",
      rideType: "all",
      isOnGoing: true,
      state: "all",
    });
    onSearchChange("");
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground font-medium">
          {total > 0 && `${total.toLocaleString()} total rides`}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-64 sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rides..."
              className="pl-9 pr-8 h-9 text-xs sm:text-sm bg-card border-border/80 focus:ring-primary/20"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0 border-border/80 relative text-foreground hover:bg-muted"
            onClick={() => {
              setDraftFilters(filters);
              setIsFilterOpen(true);
            }}
            title="Open filters"
          >
            <Filter className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white shadow-xs">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={handleClearFilters}
              title="Reset all filters"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      <Dialog
        open={isFilterOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDraftFilters(filters);
          }
          setIsFilterOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl border bg-card">
          <DialogHeader className="border-b bg-muted/30 px-6 py-5">
            <DialogTitle className="text-foreground text-lg">Filter Rides</DialogTitle>
            <DialogDescription className="text-xs">
              Select your criteria and click Save to apply all filters at once.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Ride Status</Label>
                <Select
                  value={draftFilters.status}
                  onValueChange={(value) =>
                    setDraftFilters({ ...draftFilters, status: value as RideFilters["status"] })
                  }
                >
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="requested">Requested</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="on-the-way">On The Way</SelectItem>
                    <SelectItem value="arrived">Arrived</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Ride Type</Label>
                <Select
                  value={draftFilters.rideType}
                  onValueChange={(value) =>
                    setDraftFilters({ ...draftFilters, rideType: value as RideFilters["rideType"] })
                  }
                >
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="quick">Quick</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">State</Label>
              <Select
                value={draftFilters.state || "all"}
                onValueChange={(value) =>
                  setDraftFilters({
                    ...draftFilters,
                    state: value,
                  })
                }
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">All States</SelectItem>
                  {US_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
              {activeFilterCount > 0
                ? `${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} currently applied.`
                : "No filters are currently applied."}
            </div>
          </div>

          <DialogFooter className="border-t bg-muted/10 px-6 py-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setDraftFilters({
                  status: "all",
                  rideType: "all",
                  isOnGoing: true,
                  state: "all",
                })
              }
            >
              Reset All
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white hover:text-white transition-colors"
              onClick={() => {
                onFilterChange(draftFilters);
                setIsFilterOpen(false);
              }}
            >
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unified Table Card */}
      <div className="rounded-xl border border-border/80 bg-card text-card-foreground shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Passenger</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Security</TableHead>
                <TableHead className="text-right">Fare</TableHead>
                <TableHead className="text-right">Start Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton columns={7} rows={limit} showAvatar={false} />
              ) : error ? (
                <TableErrorState colSpan={7} error={error} onRetry={onRefresh} />
              ) : rides.length > 0 ? (
                rides.map((ride) => (
                  <TableRow
                    key={ride.id}
                    className="cursor-pointer transition-colors"
                    onClick={() => router.push(`/dashboard/rides/${ride.id}`)}
                  >
                    <TableCell>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {ride.passengerName || "Unknown Passenger"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {ride.passengerEmail || "No email"}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize font-medium rounded-full px-2.5 py-0.5 border ${getStatusColor(
                          ride.rideStatus
                        )}`}
                      >
                        {formatStatus(ride.rideStatus)}
                      </Badge>
                    </TableCell>

                    <TableCell className="capitalize text-foreground font-medium">
                      {formatStatus(ride.rideCategory)}
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="text-foreground font-medium">{ride.city || "-"}</p>
                        <p className="text-xs text-muted-foreground">{ride.state || "-"}</p>
                      </div>
                    </TableCell>

                    <TableCell className="capitalize text-muted-foreground">
                      {formatStatus(ride.rideSecurity)}
                    </TableCell>

                    <TableCell className="text-right font-semibold text-foreground">
                      ${ride.actualFare.toFixed(2)}
                    </TableCell>

                    <TableCell className="text-right text-muted-foreground">
                      {formatDateTime(ride.startTime)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmptyState
                  colSpan={7}
                  icon={Navigation}
                  title="No rides found"
                  description={
                    hasActiveFilters
                      ? "No rides match your current filter settings or search query."
                      : "There are currently no rides registered in the system."
                  }
                  actionLabel={hasActiveFilters ? "Clear all filters" : undefined}
                  onAction={handleClearFilters}
                />
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Unified Pagination */}
      <TablePagination
        page={page}
        totalPages={totalPages}
        limit={limit}
        total={total}
        entityLabel="rides"
        isFetching={isFetching}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}