"use client";

import { useState } from "react";
import {
  Check,
  X,
  Loader2,
  Search,
  Filter,
  RotateCcw,
  Star,
  CarTaxiFront,
  CheckCircle2,
} from "lucide-react";
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
import type { Driver, DriverSecurityType, DriverStatus } from "@/lib/api/drivers.api";
import { useRouter } from "next/navigation";
import { US_STATES } from "@/lib/constants/states";

export interface DriverFilters {
  status: "all" | DriverStatus;
  armedType: "all" | DriverSecurityType;
  rating: string;
  rideCount: string;
  sortBy: "asc" | "desc";
  state: string | "all";
}

interface DriversDataTableProps {
  drivers: Driver[];
  filters: DriverFilters;
  searchQuery: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  onFilterChange: (filters: DriverFilters) => void;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (limit: number) => void;
  onApproveDriver: (driverId: string) => void;
  onRejectDriver: (driverId: string, rejectionReason: string) => void;
  actionDriverId: string | null;
  onRefresh: () => void;
}

const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getStatusColor = (status: DriverStatus) => {
  switch (status) {
    case "approved":
      return "text-emerald-700 bg-emerald-700/10 border-emerald-700/20 dark:text-emerald-400 dark:bg-emerald-400/10";
    case "pending":
      return "text-amber-700 bg-amber-700/10 border-amber-700/20 dark:text-amber-400 dark:bg-amber-400/10";
    case "rejected":
      return "text-red-700 bg-red-700/10 border-red-700/20 dark:text-red-400 dark:bg-red-400/10";
    case "suspended":
      return "text-orange-700 bg-orange-700/10 border-orange-700/20 dark:text-orange-400 dark:bg-orange-400/10";
    default:
      return "text-muted-foreground bg-muted border-border";
  }
};

export function DriversDataTable({
  drivers,
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
  onApproveDriver,
  onRejectDriver,
  actionDriverId,
  onRefresh,
}: DriversDataTableProps) {
  const [draftFilters, setDraftFilters] = useState<DriverFilters>(filters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedDriverForReject, setSelectedDriverForReject] = useState<{ id: string; name: string } | null>(null);
  const [approveConfirmModal, setApproveConfirmModal] = useState<{
    open: boolean;
    driverId: string;
    driverName: string;
  }>({
    open: false,
    driverId: "",
    driverName: "",
  });

  const router = useRouter();

  const activeFilterCount = [
    filters.status,
    filters.armedType,
    filters.rating || "all",
    filters.rideCount || "all",
    filters.state || "all",
    filters.sortBy !== "asc" ? filters.sortBy : "all",
  ].filter((value) => value !== "all").length;

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.armedType !== "all" ||
    Boolean(filters.rating) ||
    Boolean(filters.rideCount) ||
    filters.sortBy !== "asc" ||
    filters.state !== "all" ||
    searchQuery !== "";

  const handleClearFilters = () => {
    onFilterChange({
      status: "all",
      armedType: "all",
      rating: "",
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
          {total > 0 && `${total.toLocaleString()} total drivers`}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-64 sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search drivers..."
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
            <DialogTitle className="text-foreground text-lg">Filter Drivers</DialogTitle>
            <DialogDescription className="text-xs">
              Select criteria and save to apply all filters at once.
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
                      status: value as DriverFilters["status"],
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
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Security Type</Label>
                <Select
                  value={draftFilters.armedType}
                  onValueChange={(value) =>
                    setDraftFilters({
                      ...draftFilters,
                      armedType: value as DriverFilters["armedType"],
                    })
                  }
                >
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Security Types</SelectItem>
                    <SelectItem value="armed">Armed</SelectItem>
                    <SelectItem value="unarmed">Unarmed</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Minimum Rating</Label>
                <Input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  className="text-xs"
                  value={draftFilters.rating}
                  placeholder="e.g. 4.5"
                  onChange={(event) =>
                    setDraftFilters({
                      ...draftFilters,
                      rating: event.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Minimum Rides</Label>
                <Input
                  type="number"
                  min={0}
                  className="text-xs"
                  value={draftFilters.rideCount}
                  placeholder="e.g. 10"
                  onChange={(event) =>
                    setDraftFilters({
                      ...draftFilters,
                      rideCount: event.target.value,
                    })
                  }
                />
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
                  armedType: "all",
                  rating: "",
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

      {/* Reject Reason Confirmation Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground">Reject Driver Application</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Please provide a specific reason for rejecting{" "}
              <span className="font-semibold text-foreground">
                {selectedDriverForReject?.name || "this driver"}
              </span>
              . This explanation will be recorded.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-3">
            <Label htmlFor="reject-reason" className="text-xs font-medium text-foreground">
              Rejection Reason <span className="text-destructive">*</span>
            </Label>
            <Input
              id="reject-reason"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="e.g. Incomplete background check, expired documents"
              className="text-xs focus:ring-destructive/20"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsRejectDialogOpen(false);
                setRejectReason("");
                setSelectedDriverForReject(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white hover:text-white transition-colors"
              disabled={
                !rejectReason.trim() ||
                !selectedDriverForReject ||
                Boolean(actionDriverId && actionDriverId === selectedDriverForReject.id)
              }
              onClick={() => {
                if (!selectedDriverForReject || !rejectReason.trim()) {
                  return;
                }
                onRejectDriver(selectedDriverForReject.id, rejectReason.trim());
                setIsRejectDialogOpen(false);
                setRejectReason("");
                setSelectedDriverForReject(null);
              }}
            >
              {actionDriverId === selectedDriverForReject?.id ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Confirm Rejection"
              )}
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
                <TableHead>Driver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">State</TableHead>
                <TableHead className="text-center">Rating</TableHead>
                <TableHead className="text-center">Total Rides</TableHead>
                <TableHead className="text-right">Earnings</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton columns={7} rows={limit} />
              ) : error ? (
                <TableErrorState colSpan={7} error={error} onRetry={onRefresh} />
              ) : drivers.length > 0 ? (
                drivers.map((driver) => {
                  const isActionPending = actionDriverId === driver.id;
                  const isPending = driver.status === "pending";

                  return (
                    <TableRow
                      key={driver.id}
                      onClick={() => router.push(`/dashboard/drivers/${driver.id}`)}
                      className="cursor-pointer transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 shrink-0 border border-border/60">
                            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                              {getInitials(driver.name || "D")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {driver.name || "Unnamed Driver"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              ID: {driver.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs capitalize font-medium rounded-full px-2.5 py-0.5 border ${getStatusColor(
                            driver.status
                          )}`}
                        >
                          {driver.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center text-muted-foreground">
                        {driver?.state || "-"}
                      </TableCell>

                      <TableCell className="text-center font-medium text-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {driver.rating ? Number(driver.rating).toFixed(1) : "0.0"}
                        </span>
                      </TableCell>

                      <TableCell className="text-center font-medium text-foreground">
                        {driver.totalRides.toLocaleString()}
                      </TableCell>

                      <TableCell className="text-right font-medium text-foreground">
                        ${driver.earnings.toLocaleString()}
                      </TableCell>

                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end items-center gap-1.5">
                          {isPending ? (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                className="h-8 w-8 p-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs"
                                title="Approve driver"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setApproveConfirmModal({
                                    open: true,
                                    driverId: driver.id,
                                    driverName: driver.name || "this driver",
                                  });
                                }}
                                disabled={isActionPending || isFetching}
                              >
                                {isActionPending ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8 w-8 p-0 rounded-lg shadow-2xs"
                                title="Reject driver"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDriverForReject({
                                    id: driver.id,
                                    name: driver.name || "this driver",
                                  });
                                  setRejectReason("");
                                  setIsRejectDialogOpen(true);
                                }}
                                disabled={isActionPending || isFetching}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/dashboard/drivers/${driver.id}`);
                              }}
                            >
                              View Details
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableEmptyState
                  colSpan={7}
                  icon={CarTaxiFront}
                  title="No drivers found"
                  description={
                    hasActiveFilters
                      ? "No drivers match your active filters or search term."
                      : "There are currently no driver accounts registered in the platform."
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
        entityLabel="drivers"
        isFetching={isFetching}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />

      {/* Approve Driver Confirmation Modal */}
      <ConfirmDialog
        open={approveConfirmModal.open}
        onOpenChange={(open) => setApproveConfirmModal((prev) => ({ ...prev, open }))}
        title="Approve Driver Application"
        description={`Are you sure you want to approve ${approveConfirmModal.driverName}? Once approved, they will be activated and authorized to accept passenger rides immediately.`}
        confirmText="Approve Driver"
        variant="primary"
        icon={CheckCircle2}
        isLoading={Boolean(actionDriverId && actionDriverId === approveConfirmModal.driverId)}
        onConfirm={async () => {
          await onApproveDriver(approveConfirmModal.driverId);
          setApproveConfirmModal((prev) => ({ ...prev, open: false }));
        }}
      />
    </div>
  );
}
