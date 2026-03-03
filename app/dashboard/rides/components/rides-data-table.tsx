"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  Filter,
  RotateCcw,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import type { Ride, RideStatus, RideType } from "@/lib/api/rides.api";

interface RideFilters {
  status: "all" | RideStatus;
  rideType: "all" | RideType;
}

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
      return "text-blue-700 bg-blue-700/10 border-blue-700/10";
    case "accepted":
      return "text-indigo-700 bg-indigo-700/10 border-indigo-700/10";
    case "on-the-way":
      return "text-cyan-700 bg-cyan-700/10 border-cyan-700/10";
    case "arrived":
      return "text-purple-700 bg-purple-700/10 border-purple-700/10";
    case "in-progress":
      return "text-amber-700 bg-amber-700/10 border-amber-700/10";
    case "completed":
      return "text-green-700 bg-green-700/10 border-green-700/10";
    case "cancelled":
      return "text-red-700 bg-red-700/10 border-red-700/10";
    case "expired":
      return "text-gray-700 bg-gray-700/10 border-gray-700/10";
    default:
      return "text-gray-700 bg-gray-700/10 border-gray-700/10";
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
}: RidesDataTableProps) {
  const [draftFilters, setDraftFilters] = useState<RideFilters>(filters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeFilterCount = [filters.status, filters.rideType].filter(
    (value) => value !== "all",
  ).length;

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.rideType !== "all" ||
    searchQuery !== "";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span />

        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search rides..."
              className="pl-10 h-9 text-sm border border-gray-200 bg-white"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 border border-gray-200 relative"
            onClick={() => {
              setDraftFilters(filters);
              setIsFilterOpen(true);
            }}
            title="Open filters"
          >
            <Filter className="w-4 h-4 text-gray-700" />
            {activeFilterCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 h-4 min-w-4 rounded-full bg-black px-1 text-[10px] leading-4 text-white">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-black"
              onClick={() => {
                onFilterChange({ status: "all", rideType: "all" });
                onSearchChange("");
              }}
              title="Clear filters"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <Dialog
        open={isFilterOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDraftFilters(filters);
          }
          setIsFilterOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-140 p-0 overflow-hidden">
          <DialogHeader className="border-b bg-muted/30 px-6 py-5">
            <DialogTitle className="text-black">Filter Rides</DialogTitle>
            <DialogDescription>
              Select your criteria and save to apply all filters at once.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-5 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm text-black block">Ride Status</Label>
                <Select
                  value={draftFilters.status}
                  onValueChange={(value) =>
                    setDraftFilters({ ...draftFilters, status: value as RideFilters["status"] })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
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

              <div className="space-y-2">
                <Label className="text-sm text-black block">Ride Type</Label>
                <Select
                  value={draftFilters.rideType}
                  onValueChange={(value) =>
                    setDraftFilters({ ...draftFilters, rideType: value as RideFilters["rideType"] })
                  }
                >
                  <SelectTrigger className="w-full">
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

            <div className="rounded-lg bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              {activeFilterCount > 0
                ? `${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} currently applied.`
                : "No filters are currently applied."}
            </div>
          </div>

          <DialogFooter className="border-t px-6 py-4 gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setDraftFilters({
                  status: "all",
                  rideType: "all",
                })
              }
            >
              Reset
            </Button>
            <Button variant="outline" onClick={() => setIsFilterOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onFilterChange(draftFilters);
                setIsFilterOpen(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="shadow-none border-none pt-0 rounded-md overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50 rounded-2xl!">
                <TableRow className="h-16 border-none rounded-2xl!">
                  <TableHead>Passenger</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Security</TableHead>
                  <TableHead className="text-right">Fare</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Loading rides...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-red-600">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : rides.length > 0 ? (
                  rides.map((ride) => (
                    <TableRow key={ride.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell>
                        <div>
                          <p>{ride.passengerName || "Unknown passenger"}</p>
                          <p className="text-xs text-muted-foreground">{ride.passengerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs rounded-full px-2 py-0.5 ${getStatusColor(ride.rideStatus)}`}
                        >
                          {formatStatus(ride.rideStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatStatus(ride.rideCategory)}</TableCell>
                      <TableCell>
                        <div>
                          <p>{ride.city}</p>
                          <p className="text-xs text-muted-foreground">{ride.state}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatStatus(ride.rideSecurity)}</TableCell>
                      <TableCell className="text-right">${ride.actualFare.toFixed(2)}</TableCell>
                      <TableCell>{formatDateTime(ride.startTime)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
                          <Link href={`/dashboard/rides/${ride.id}`} title="View ride">
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <p className="text-muted-foreground">No rides found matching filters</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-1">
        <div className="text-sm text-muted-foreground">Total: {total} rides</div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="page-size">Rows</Label>
            <Select value={String(limit)} onValueChange={(value) => onPageSizeChange(Number(value))}>
              <SelectTrigger id="page-size" className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm">Page {page} of {totalPages || 1}</div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || isFetching}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= (totalPages || 1) || isFetching}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
