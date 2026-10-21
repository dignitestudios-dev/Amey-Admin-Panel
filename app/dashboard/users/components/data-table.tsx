"use client";

import { useState } from "react";
import { Filter, Loader2, RotateCcw, Search, Users, ShieldAlert, CheckCircle2, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { AccountStatus, Passenger } from "@/lib/api/users.api";
import { useRouter } from "next/navigation";
import { US_STATES } from "@/lib/constants/states";

export interface PassengerFilters {
  status: "all" | AccountStatus;
  date: string;
  rideCount: string;
  sortBy: "asc" | "desc";
  state: string | "all";
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
      return "text-emerald-700 bg-emerald-700/10 border-emerald-700/20 dark:text-emerald-400 dark:bg-emerald-400/10";
    case "pending":
      return "text-amber-700 bg-amber-700/10 border-amber-700/20 dark:text-amber-400 dark:bg-amber-400/10";
    case "rejected":
      return "text-red-700 bg-red-700/10 border-red-700/20 dark:text-red-400 dark:bg-red-400/10";
    case "onHold":
      return "text-orange-700 bg-orange-700/10 border-orange-700/20 dark:text-orange-400 dark:bg-orange-400/10";
    case "admin-approved":
      return "text-blue-700 bg-blue-700/10 border-blue-700/20 dark:text-blue-400 dark:bg-blue-400/10";
    case "deleted":
      return "text-muted-foreground bg-muted border-border";
    default:
      return "text-muted-foreground bg-muted border-border";
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
  onRefresh,
}: DataTableProps) {
  const [draftFilters, setDraftFilters] = useState<PassengerFilters>(filters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const router = useRouter();

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    passengerId: string;
    passengerName: string;
    isRestricting: boolean;
  }>({
    open: false,
    passengerId: "",
    passengerName: "",
    isRestricting: true,
  });

  const activeFilterCount = [
    filters.status,
    filters.date || "all",
    filters.rideCount || "all",
    filters.sortBy !== "asc" ? filters.sortBy : "all",
    filters.state,
  ].filter((value) => value !== "all").length;

  const hasActiveFilters =
    filters.status !== "all" ||
    Boolean(filters.date) ||
    Boolean(filters.rideCount) ||
    filters.sortBy !== "asc" ||
    filters.state !== "all" ||
    searchQuery !== "";

  const handleClearFilters = () => {
    onFilterChange({
      status: "all",
      date: "",
      rideCount: "",
      sortBy: "asc",
      state: "all",
    });
    onSearchChange("");
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground font-medium">
          {total > 0 && `${total.toLocaleString()} total passengers`}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-64 sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search passengers..."
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

      {/* Filter Dialog */}
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
            <DialogTitle className="text-foreground text-lg">Filter Passengers</DialogTitle>
            <DialogDescription className="text-xs">
              Select your criteria and click Save to apply all filters at once.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Status</Label>
                <Select
                  value={draftFilters.status}
                  onValueChange={(value) =>
                    setDraftFilters({
                      ...draftFilters,
                      status: value as PassengerFilters["status"],
                    })
                  }
                >
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="onHold">On Hold</SelectItem>
                    <SelectItem value="admin-approved">Admin Approved</SelectItem>
                    <SelectItem value="deleted">Deleted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Registration Date</Label>
                <Input
                  type="date"
                  className="text-xs"
                  value={draftFilters.date}
                  onChange={(event) =>
                    setDraftFilters({
                      ...draftFilters,
                      date: event.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Sort Order</Label>
                <Select
                  value={draftFilters.sortBy}
                  onValueChange={(value) =>
                    setDraftFilters({
                      ...draftFilters,
                      sortBy: value as "asc" | "desc",
                    })
                  }
                >
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending (Oldest First)</SelectItem>
                    <SelectItem value="desc">Descending (Newest First)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Minimum Rides</Label>
                <Input
                  type="number"
                  min={0}
                  className="text-xs"
                  value={draftFilters.rideCount}
                  placeholder="e.g. 5"
                  onChange={(event) =>
                    setDraftFilters({
                      ...draftFilters,
                      rideCount: event.target.value,
                    })
                  }
                />
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
                  date: "",
                  rideCount: "",
                  sortBy: "asc",
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
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Total Rides</TableHead>
                <TableHead className="text-center">State</TableHead>
                <TableHead className="text-right">Registration Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton columns={7} rows={limit} />
              ) : error ? (
                <TableErrorState colSpan={7} error={error} onRetry={onRefresh} />
              ) : passengers.length > 0 ? (
                passengers.map((passenger) => {
                  const normalizedStatus = String(passenger.status).toLowerCase();
                  const canToggleRestriction =
                    normalizedStatus === "approved" || normalizedStatus === "onhold";
                  const isOnHoldStatus = normalizedStatus === "onhold";
                  const isRowUpdating = restrictingPassengerId === passenger.id;

                  return (
                    <TableRow
                      key={passenger.id}
                      className="cursor-pointer transition-colors"
                      onClick={() => router.push(`/dashboard/users/${passenger.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 shrink-0 border border-border/60">
                            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                              {getInitials(passenger.name || "P")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{passenger.name || "Unnamed Passenger"}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {passenger.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {passenger.phone || "-"}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs capitalize font-medium rounded-full px-2.5 py-0.5 border ${getStatusClasses(
                            passenger.status
                          )}`}
                        >
                          {passenger.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center font-medium text-foreground">
                        {passenger.totalRides.toLocaleString()}
                      </TableCell>

                      <TableCell className="text-center text-muted-foreground">
                        {passenger?.state || "-"}
                      </TableCell>

                      <TableCell className="text-right text-muted-foreground">
                        {formatDate(passenger.regDate)}
                      </TableCell>

                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end items-center gap-2">
                          {canToggleRestriction ? (
                            <Button
                              variant={isOnHoldStatus ? "default" : "destructive"}
                              size="sm"
                              className={`h-8 px-3 text-xs font-medium rounded-lg shadow-2xs ${
                                isOnHoldStatus
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                  : ""
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmModal({
                                  open: true,
                                  passengerId: passenger.id,
                                  passengerName: passenger.name || "this passenger",
                                  isRestricting: normalizedStatus === "approved",
                                });
                              }}
                              disabled={isRowUpdating || isFetching}
                              title={isOnHoldStatus ? "Unrestrict passenger" : "Restrict passenger"}
                            >
                              {isRowUpdating ? (
                                <>
                                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                  Updating...
                                </>
                              ) : isOnHoldStatus ? (
                                "Unrestrict"
                              ) : (
                                "Restrict"
                              )}
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground/60 italic">—</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableEmptyState
                  colSpan={7}
                  icon={Users}
                  title="No passengers found"
                  description={
                    hasActiveFilters
                      ? "No passengers match your current filters or search term."
                      : "There are currently no passenger accounts registered in the system."
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
        entityLabel="passengers"
        isFetching={isFetching}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />

      {/* Action Confirmation Modal */}
      <ConfirmDialog
        open={confirmModal.open}
        onOpenChange={(open) => setConfirmModal((prev) => ({ ...prev, open }))}
        title={confirmModal.isRestricting ? "Restrict Passenger" : "Unrestrict Passenger"}
        description={
          confirmModal.isRestricting
            ? `Are you sure you want to restrict ${confirmModal.passengerName}? They will be temporarily suspended and unable to book rides.`
            : `Are you sure you want to unrestrict ${confirmModal.passengerName}? Their account access will be restored and they can book rides immediately.`
        }
        confirmText={confirmModal.isRestricting ? "Restrict Passenger" : "Unrestrict Passenger"}
        variant={confirmModal.isRestricting ? "destructive" : "primary"}
        icon={confirmModal.isRestricting ? ShieldAlert : CheckCircle2}
        isLoading={Boolean(restrictingPassengerId && restrictingPassengerId === confirmModal.passengerId)}
        onConfirm={async () => {
          await onToggleRestrict(confirmModal.passengerId, confirmModal.isRestricting);
          setConfirmModal((prev) => ({ ...prev, open: false }));
        }}
      />
    </div>
  );
}
