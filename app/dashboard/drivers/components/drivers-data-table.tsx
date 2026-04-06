"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  Check,
  X,
  Loader2,
  Search,
  Filter,
  RotateCcw,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Driver, DriverSecurityType, DriverStatus } from "@/lib/api/drivers.api";
import { useRouter } from "next/navigation";


interface DriverFilters {
  status: "all" | DriverStatus;
  armedType: "all" | DriverSecurityType;
  rating: string;
  rideCount: string;
  sortBy: "asc" | "desc";
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

const getStatusColor = (status: DriverStatus) => {
  switch (status) {
    case "approved":
      return "text-green-700 bg-green-700/10 border-green-700/10";
    case "pending":
      return "text-amber-700 bg-amber-700/10 border-amber-700/10";
    case "rejected":
      return "text-red-700 bg-red-700/10 border-red-700/10";
    case "suspended":
      return "text-orange-700 bg-orange-700/10 border-orange-700/10";
    default:
      return "text-gray-700 bg-gray-700/10 border-gray-700/10";
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
}: DriversDataTableProps) {
  const [draftFilters, setDraftFilters] = useState<DriverFilters>(filters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const router = useRouter();
  const activeFilterCount = [
    filters.status,
    filters.armedType,
    filters.rating || "all",
    filters.rideCount || "all",
  ].filter((value) => value !== "all").length;

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.armedType !== "all" ||
    Boolean(filters.rating) ||
    Boolean(filters.rideCount) ||
    searchQuery !== "";

  const renderActionButtons = (driver: Driver) => {
    if (driver.status !== "pending") {
      return null;
    }

    const isActionPending = actionDriverId === driver.id;

    return (
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="default"
          className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white"
          title="Approve"
          onClick={() => onApproveDriver(driver.id)}
          disabled={isActionPending || isFetching}
        >
          {isActionPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="h-8 w-8 p-0"
          title="Reject"
          onClick={() => {
            setSelectedDriverId(driver.id);
            setRejectReason("");
            setIsRejectDialogOpen(true);
          }}
          disabled={isActionPending || isFetching}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span />

        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search drivers..."
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
                  armedType: "all",
                  rating: "",
                  rideCount: "",
                  sortBy: "asc",
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
            <DialogTitle className="text-black">Filter Drivers</DialogTitle>
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
                    setDraftFilters({ ...draftFilters, status: value as DriverFilters["status"] })
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
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-black block">Sort Order</Label>
                <Select
                  value={draftFilters.sortBy}
                  onValueChange={(value) =>
                    setDraftFilters({ ...draftFilters, sortBy: value as "asc" | "desc" })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-black block">Minimum Rating</Label>
                <Input
                  type="number"
                  min={0}
                  max={5}
                  step="0.1"
                  value={draftFilters.rating}
                  placeholder="e.g. 2"
                  onChange={(event) =>
                    setDraftFilters({ ...draftFilters, rating: event.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-black block">Minimum Rides</Label>
                <Input
                  type="number"
                  min={0}
                  value={draftFilters.rideCount}
                  placeholder="e.g. 1"
                  onChange={(event) =>
                    setDraftFilters({ ...draftFilters, rideCount: event.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-black block">Armed Type</Label>
                <Select
                  value={draftFilters.armedType}
                  onValueChange={(value) =>
                    setDraftFilters({ ...draftFilters, armedType: value as DriverFilters["armedType"] })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="armed">Armed</SelectItem>
                    <SelectItem value="unarmed">Unarmed</SelectItem>
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
                  armedType: "all",
                  rating: "",
                  rideCount: "",
                  sortBy: "asc",
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

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Driver</DialogTitle>
            <DialogDescription>
              Provide a rejection reason. This is required to reject the driver.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="reject-reason">Reason</Label>
            <Input
              id="reject-reason"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Enter rejection reason"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false);
                setRejectReason("");
                setSelectedDriverId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={
                !rejectReason.trim() ||
                !selectedDriverId ||
                Boolean(actionDriverId && actionDriverId === selectedDriverId)
              }
              onClick={() => {
                if (!selectedDriverId || !rejectReason.trim()) {
                  return;
                }

                onRejectDriver(selectedDriverId, rejectReason.trim());
                setIsRejectDialogOpen(false);
                setRejectReason("");
                setSelectedDriverId(null);
              }}
            >
              Reject
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
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Rating</TableHead>
                  <TableHead className="text-center">Total Rides</TableHead>
                  <TableHead className="text-right">Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow >
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading drivers...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-red-600">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : drivers.length > 0 ? (
                  drivers.map((driver) => (
                    <TableRow
                     onClick={()=>router.push(`/dashboard/drivers/${driver.id}`)}
                      key={driver.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <TableCell>
                        <div>
                          <p>{driver.name || "Unnamed driver"}</p>
                          <p className="text-xs text-muted-foreground">
                            {driver.id}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs rounded-full px-2 py-0.5 ${getStatusColor(driver.status)}`}
                        >
                          {driver.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-light">
                        <span className="text-black">
                          <Star className="w-4 h-4 inline mr-1 mb-1 text-yellow-500" />
                          {driver.rating}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-black">{driver.totalRides}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-black">${driver.earnings.toLocaleString()}</span>
                      </TableCell>
                     
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">
                        No drivers found matching filters
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
        <div className="text-sm text-muted-foreground">Total: {total} drivers</div>

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
