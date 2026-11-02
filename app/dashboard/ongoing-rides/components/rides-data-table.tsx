"use client";

import { Button } from "@/components/ui/button";
import {
  FilterBar,
  InitialAvatar,
  PageFooter,
  SearchField,
  StatusDot,
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
import type { Ride, RideStatus } from "@/lib/api/rides.api";
import { useRouter } from "next/navigation";

interface RideFilters {
  status: "all" | RideStatus;
  rideType: "all";
  isOnGoing: boolean;
  state: string | "all";
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
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (limit: number) => void;
}

const formatDateTime = (value: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatStatus = (value: string) => {
  if (!value) return "Unknown";
  return value.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

const statusTone = (status: RideStatus): Tone => {
  switch (status) {
    case "requested":
      return "info";
    case "accepted":
    case "on-the-way":
    case "arrived":
      return "warning";
    case "in-progress":
    case "completed":
      return "success";
    case "cancelled":
    case "expired":
      return "danger";
    default:
      return "neutral";
  }
};

export function RidesDataTable({
  rides,
  searchQuery,
  page,
  limit,
  total,
  totalPages,
  isLoading,
  isFetching,
  error,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
}: RidesDataTableProps) {
  const router = useRouter();

  return (
    <TableCard title="Live dispatch" subtitle="Trips currently in transit, with passenger, route and fare">
      <FilterBar>
        <SearchField
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search by passenger, driver or city"
        />
        <span className="ml-auto text-[13px] text-muted-foreground tnum">{total} shown</span>
      </FilterBar>

      <div className="overflow-x-auto">
        <Table className="w-full min-w-[900px] text-[14px]">
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className={`${thClass} text-left`}>Passenger</TableHead>
              <TableHead className={`${thClass} text-left`}>Status</TableHead>
              <TableHead className={`${thClass} text-left`}>Type</TableHead>
              <TableHead className={`${thClass} text-left`}>City / State</TableHead>
              <TableHead className={`${thClass} text-left`}>Security</TableHead>
              <TableHead className={`${thClass} text-right`}>Fare</TableHead>
              <TableHead className={`${thClass} text-left`}>Time</TableHead>
              <TableHead className={`${thClass} text-right`}>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="p-0">
                  <TableMessage>Loading active dispatches...</TableMessage>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="p-0">
                  <TableMessage tone="error">{error}</TableMessage>
                </TableCell>
              </TableRow>
            ) : rides.length > 0 ? (
              rides.map((ride) => (
                <TableRow
                  key={ride.id}
                  className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-accent/60"
                  onClick={() => router.push(`/dashboard/ongoing-rides/${ride.id}`)}
                >
                  <TableCell className={tdClass}>
                    <div className="flex items-center gap-3">
                      <InitialAvatar name={ride.passengerName} />
                      <div className="min-w-0 leading-tight">
                        <p className="font-semibold text-foreground">
                          {ride.passengerName || "Unknown passenger"}
                        </p>
                        <p className="max-w-[200px] truncate text-[12px] text-muted-foreground">
                          {ride.passengerEmail}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className={tdClass}>
                    <StatusDot tone={statusTone(ride.rideStatus)}>{formatStatus(ride.rideStatus)}</StatusDot>
                  </TableCell>
                  <TableCell className={`${tdClass} text-muted-foreground`}>
                    {formatStatus(ride.rideCategory)}
                  </TableCell>
                  <TableCell className={tdClass}>
                    <div className="leading-tight">
                      <p className="text-foreground">{ride.city}</p>
                      <p className="text-[12px] text-muted-foreground">{ride.state}</p>
                    </div>
                  </TableCell>
                  <TableCell className={`${tdClass} text-muted-foreground`}>
                    {formatStatus(ride.rideSecurity)}
                  </TableCell>
                  <TableCell className={`${tdClass} text-right font-semibold tnum`}>
                    ${ride.actualFare.toFixed(2)}
                  </TableCell>
                  <TableCell className={`${tdClass} text-muted-foreground tnum`}>
                    {formatDateTime(ride.startTime)}
                  </TableCell>
                  <TableCell className={`${tdClass} text-right`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 cursor-pointer rounded-lg px-3 text-[13px] text-primary hover:bg-primary/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/ongoing-rides/${ride.id}`);
                      }}
                    >
                      Track
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="p-0">
                  <TableMessage>No active rides in transit currently.</TableMessage>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PageFooter
        shown={rides.length}
        total={total}
        page={page}
        totalPages={totalPages}
        limit={limit}
        noun="active rides"
        disabled={isFetching}
        onPage={onPageChange}
        onPageSize={onPageSizeChange}
      />
    </TableCard>
  );
}
