"use client";

import { Loader2, MapPin, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FilterBar,
  FilterSelect,
  InitialAvatar,
  PageFooter,
  SearchField,
  StatusDot,
  StatusTabs,
  TableCard,
  TableMessage,
  tdClass,
  thClass,
  type Tone,
} from "@/components/data-table-ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AccountStatus, Passenger } from "@/lib/api/users.api";
import { useRouter } from "next/navigation";
import { US_STATES } from "@/lib/constants/states";

interface PassengerFilters {
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const statusTone = (status: AccountStatus): Tone => {
  switch (status) {
    case "approved":
    case "admin-approved":
      return "success";
    case "pending":
    case "onHold":
      return "warning";
    case "rejected":
    case "deleted":
      return "danger";
    default:
      return "neutral";
  }
};

const STATUS_TABS = [
  { id: "all", label: "All riders" },
  { id: "approved", label: "Approved" },
  { id: "pending", label: "Pending" },
  { id: "onHold", label: "On hold" },
  { id: "rejected", label: "Rejected" },
];

const DEFAULT_FILTERS: PassengerFilters = {
  status: "all",
  date: "",
  rideCount: "",
  sortBy: "asc",
  state: "all",
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
  const router = useRouter();

  const hasActiveFilters =
    filters.status !== "all" ||
    (filters.state && filters.state !== "all") ||
    Boolean(filters.date) ||
    Boolean(filters.rideCount) ||
    Boolean(searchQuery.trim());

  const stateOptions = [
    { value: "all", label: "All states" },
    ...US_STATES.map((st) => ({ value: st, label: st })),
  ];

  return (
    <div className="space-y-5">
      <StatusTabs
        tabs={STATUS_TABS}
        value={filters.status}
        onChange={(id) => onFilterChange({ ...filters, status: id as PassengerFilters["status"] })}
      />

      <TableCard
        title="Rider accounts"
        subtitle="Every rider account with contact details, standing and trip count"
      >
        <FilterBar>
          <SearchField
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search by name, email or phone"
          />
          <FilterSelect
            icon={MapPin}
            value={filters.state || "all"}
            onChange={(v) => onFilterChange({ ...filters, state: v })}
            options={stateOptions}
            className="w-[170px]"
          />
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-10 cursor-pointer rounded-lg px-3 text-[14px] text-muted-foreground hover:text-foreground"
              onClick={() => {
                onFilterChange(DEFAULT_FILTERS);
                onSearchChange("");
              }}
            >
              <RotateCcw className="size-4" />
              Reset
            </Button>
          )}
          <span className="ml-auto text-[13px] text-muted-foreground tnum">{total} shown</span>
        </FilterBar>

        <div className="overflow-x-auto">
          <Table className="w-full min-w-[860px] text-[14px]">
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className={`${thClass} text-left`}>Rider</TableHead>
                <TableHead className={`${thClass} text-left`}>Phone</TableHead>
                <TableHead className={`${thClass} text-left`}>Status</TableHead>
                <TableHead className={`${thClass} text-right`}>Rides</TableHead>
                <TableHead className={`${thClass} text-left`}>State</TableHead>
                <TableHead className={`${thClass} text-left`}>Registered</TableHead>
                <TableHead className={`${thClass} text-right`}>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="p-0">
                    <TableMessage>Loading rider registry...</TableMessage>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="p-0">
                    <TableMessage tone="error">{error}</TableMessage>
                  </TableCell>
                </TableRow>
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
                      className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-accent/60"
                      onClick={() => router.push(`/dashboard/users/${passenger.id}`)}
                    >
                      <TableCell className={tdClass}>
                        <div className="flex items-center gap-3">
                          <InitialAvatar name={passenger.name} />
                          <div className="min-w-0 leading-tight">
                            <p className="font-semibold text-foreground">{passenger.name}</p>
                            <p className="max-w-[220px] truncate text-[12px] text-muted-foreground">
                              {passenger.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className={`${tdClass} text-muted-foreground tnum`}>
                        {passenger.phone || "—"}
                      </TableCell>
                      <TableCell className={tdClass}>
                        <StatusDot tone={statusTone(passenger.status)}>{passenger.status}</StatusDot>
                      </TableCell>
                      <TableCell className={`${tdClass} text-right font-semibold tnum`}>
                        {passenger.totalRides}
                      </TableCell>
                      <TableCell className={`${tdClass} text-muted-foreground`}>
                        {passenger?.state || "—"}
                      </TableCell>
                      <TableCell className={`${tdClass} text-muted-foreground tnum`}>
                        {formatDate(passenger.regDate)}
                      </TableCell>
                      <TableCell className={`${tdClass} text-right`}>
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/users/${passenger.id}`)}
                            className="h-8 cursor-pointer rounded-lg px-3 text-[13px] text-primary hover:bg-primary/10"
                          >
                            View
                          </Button>
                          {canToggleRestriction ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className={`h-8 cursor-pointer rounded-lg px-3 text-[13px] font-medium ${
                                isOnHoldStatus
                                  ? "border-primary/40 text-primary hover:bg-primary/10"
                                  : "border-destructive/40 text-destructive hover:bg-destructive/10"
                              }`}
                              onClick={() => onToggleRestrict(passenger.id, normalizedStatus === "approved")}
                              disabled={isRowUpdating || isFetching}
                            >
                              {isRowUpdating ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : isOnHoldStatus ? (
                                "Unrestrict"
                              ) : (
                                "Restrict"
                              )}
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="p-0">
                    <TableMessage>No riders found matching your filters.</TableMessage>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <PageFooter
          shown={passengers.length}
          total={total}
          page={page}
          totalPages={totalPages}
          limit={limit}
          noun="riders"
          disabled={isFetching}
          onPage={onPageChange}
          onPageSize={onPageSizeChange}
        />
      </TableCard>
    </div>
  );
}
