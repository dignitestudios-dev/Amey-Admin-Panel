"use client";

import { CalendarDays, RefreshCw, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { Passenger, PassengerStatus } from "@/lib/api/users.api";

interface UserFilters {
  status: "all" | PassengerStatus;
  date: string;
  rideCount: string;
}

interface DataTableProps {
  users: Passenger[];
  filters: UserFilters;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  onFilterChange: (filters: UserFilters) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (limit: number) => void;
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

const getStatusClasses = (status: PassengerStatus) => {
  switch (status) {
    case "approved":
      return "text-green-700 bg-green-700/10 border-green-700/10";
    case "pending":
      return "text-amber-700 bg-amber-700/10 border-amber-700/10";
    case "rejected":
      return "text-red-700 bg-red-700/10 border-red-700/10";
    case "deleted":
      return "text-gray-700 bg-gray-700/10 border-gray-700/10";
    default:
      return "text-gray-700 bg-gray-700/10 border-gray-700/10";
  }
};

export function DataTable({
  users,
  filters,
  page,
  limit,
  total,
  totalPages,
  isLoading,
  isFetching,
  error,
  onFilterChange,
  onPageChange,
  onPageSizeChange,
  onRefresh,
}: DataTableProps) {
  const hasFilters =
    filters.status !== "all" || Boolean(filters.date) || Boolean(filters.rideCount);

  const clearFilters = () => {
    onFilterChange({
      status: "all",
      date: "",
      rideCount: "",
    });
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-black">Users Management</h2>
          <p className="text-sm text-gray-500">Passengers data with server-side filtering and pagination</p>
        </div>
        <Button
          variant="outline"
          className="w-fit"
          onClick={onRefresh}
          disabled={isFetching}
        >
          <RefreshCw className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                onFilterChange({
                  ...filters,
                  status: value as UserFilters["status"],
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Registration Date</Label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-2.5 size-4 text-gray-400" />
              <Input
                type="date"
                value={filters.date}
                onChange={(e) => onFilterChange({ ...filters, date: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Minimum Rides</Label>
            <Input
              type="number"
              min={0}
              placeholder="e.g. 7"
              value={filters.rideCount}
              onChange={(e) => onFilterChange({ ...filters, rideCount: e.target.value })}
            />
          </div>

          <div className="flex items-end gap-2">
            <Button variant="outline" onClick={clearFilters} disabled={!hasFilters}>
              Clear
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Passenger</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Total Rides</TableHead>
              <TableHead className="text-right">Registration Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Loading passengers...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-red-600">
                  {error}
                </TableCell>
              </TableRow>
            ) : users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs font-medium">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.phone || "-"}</TableCell>
                  <TableCell>
                    <Badge className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusClasses(user.status)}`}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-medium">{user.totalRides}</TableCell>
                  <TableCell className="text-right">{formatDate(user.regDate)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  <div className="inline-flex items-center gap-2">
                    <Users className="size-4" />
                    No passengers found for these filters.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-1">
        <div className="text-sm text-muted-foreground">Total: {total} passengers</div>

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
