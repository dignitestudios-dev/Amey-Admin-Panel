"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Filter, Loader2, RotateCcw, Search, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import type { AccountStatus, Passenger } from "@/lib/api/users.api";

interface PassengerFilters {
  status: "all" | AccountStatus;
  date: string;
  rideCount: string;
}

interface DataTableProps {
  passengers: Passenger[];
  filters: PassengerFilters;
  searchQuery: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  onFilterChange: (filters: PassengerFilters) => void;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (limit: number) => void;
  onToggleRestrict: (passengerID: string, isRestricted: boolean) => void;
  restrictingPassengerId: string | null;
  onRefresh: () => void;
}

const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const getStatusClasses = (status: AccountStatus) => {
  switch (status) {
    case "approved":
      return "text-green-700 bg-green-700/10 border-green-700/10";
    case "pending":
      return "text-amber-700 bg-amber-700/10 border-amber-700/10";
    case "rejected":
      return "text-red-700 bg-red-700/10 border-red-700/10";
    case "onHold":
      return "text-orange-700 bg-orange-700/10 border-orange-700/10";
    case "admin-approved":
      return "text-blue-700 bg-blue-700/10 border-blue-700/10";
    case "deleted":
      return "text-gray-700 bg-gray-700/10 border-gray-700/10";
    default:
      return "text-gray-700 bg-gray-700/10 border-gray-700/10";
  }
};

export function DataTable({
  passengers,
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
  onToggleRestrict,
  restrictingPassengerId,
}: DataTableProps) {
  const [draftFilters, setDraftFilters] = useState<PassengerFilters>(filters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeFilterCount = [
    filters.status,
    filters.date || "all",
    filters.rideCount || "all",
  ].filter((value) => value !== "all").length;

  const hasActiveFilters =
    filters.status !== "all" ||
    Boolean(filters.date) ||
    Boolean(filters.rideCount) ||
    searchQuery !== "";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span />

        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search passengers..."
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
                onFilterChange({
                  status: "all",
                  date: "",
                  rideCount: "",
                });
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
            <DialogTitle className="text-black">Filter Passengers</DialogTitle>
            <DialogDescription>
              Select your criteria and save to apply all filters at once.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-5 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm text-black block">Status</Label>
                <Select
                  value={draftFilters.status}
                  onValueChange={(value) =>
                    setDraftFilters({
                      ...draftFilters,
                      status: value as PassengerFilters["status"],
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="onHold">On Hold</SelectItem>
                    <SelectItem value="admin-approved">
                      Admin Approved
                    </SelectItem>
                    <SelectItem value="deleted">Deleted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-black block">
                  Registration Date
                </Label>
                <Input
                  type="date"
                  value={draftFilters.date}
                  onChange={(event) =>
                    setDraftFilters({
                      ...draftFilters,
                      date: event.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-black block">
                  Minimum Rides
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={draftFilters.rideCount}
                  placeholder="e.g. 7"
                  onChange={(event) =>
                    setDraftFilters({
                      ...draftFilters,
                      rideCount: event.target.value,
                    })
                  }
                />
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
                  date: "",
                  rideCount: "",
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
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Total Rides</TableHead>
                  <TableHead className="text-right">
                    Registration Date
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Loading passengers...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-red-600"
                    >
                      {error}
                    </TableCell>
                  </TableRow>
                ) : passengers.length > 0 ? (
                  passengers.map((passenger) => {
                    const normalizedStatus = String(
                      passenger.status,
                    ).toLowerCase();
                    const canToggleRestriction =
                      normalizedStatus === "approved" ||
                      normalizedStatus === "onhold";
                    const isOnHoldStatus = normalizedStatus === "onhold";
                    const isRowUpdating =
                      restrictingPassengerId === passenger.id;

                    return (
                      <TableRow
                        key={passenger.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs font-medium">
                                {getInitials(passenger.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p>{passenger.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {passenger.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{passenger.phone || "-"}</TableCell>
                        <TableCell>
                          <Badge
                            className={`text-xs rounded-full px-2 py-0.5 ${getStatusClasses(passenger.status)}`}
                          >
                            {passenger.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-black">
                            {passenger.totalRides}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-black">
                            {formatDate(passenger.regDate)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-2">
                            {canToggleRestriction ? (
                              <Button
                                variant={
                                  isOnHoldStatus ? "default" : "destructive"
                                }
                                className={
                                  isOnHoldStatus
                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                    : undefined
                                }
                                size="sm"
                                onClick={() =>
                                  onToggleRestrict(
                                    passenger.id,
                                    normalizedStatus === "approved",
                                  )
                                }
                                disabled={isRowUpdating || isFetching}
                                title={
                                  isOnHoldStatus
                                    ? "Unrestrict passenger"
                                    : "Restrict passenger"
                                }
                              >
                                {isRowUpdating ? (
                                  <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Updating...
                                  </>
                                ) : isOnHoldStatus ? (
                                  "Unrestrict"
                                ) : (
                                  "Restrict"
                                )}
                              </Button>
                            ) : null}

                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              asChild
                            >
                              <Link
                                href={`/dashboard/users/${passenger.id}`}
                                title="View passenger"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">
                        No passengers found matching filters
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-1">
        <div className="text-sm text-muted-foreground">
          Total: {total} passengers
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="page-size">Rows</Label>
            <Select
              value={String(limit)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger id="page-size" className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm">
            Page {page} of {totalPages || 1}
          </div>

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
