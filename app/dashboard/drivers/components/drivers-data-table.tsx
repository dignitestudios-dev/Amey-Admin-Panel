"use client";

import { useState } from "react";
import { MapPin, RotateCcw, ShieldCheck, Star, Loader2 } from "lucide-react";
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
import type {
  Driver,
  DriverSecurityType,
  DriverStatus,
} from "@/lib/api/drivers.api";
import { useRouter } from "next/navigation";
import { US_STATES } from "@/lib/constants/states";

interface DriverFilters {
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
  onRejectDriver: (driverId: string, reason: string) => void;
  actionDriverId: string | null;
  onRefresh: () => void;
}

const statusTone = (status: DriverStatus): Tone => {
  switch (String(status).toLowerCase()) {
    case "approved":
      return "success";
    case "pending":
    case "onhold":
      return "warning";
    case "rejected":
    case "suspended":
      return "danger";
    default:
      return "neutral";
  }
};

const STATUS_TABS = [
  { id: "all", label: "All drivers" },
  { id: "pending", label: "Pending review" },
  { id: "approved", label: "Approved" },
  { id: "onHold", label: "On hold" },
  { id: "rejected", label: "Rejected" },
  { id: "suspended", label: "Suspended" },
];

const DEFAULT_FILTERS: DriverFilters = {
  status: "all",
  armedType: "all",
  rating: "",
  rideCount: "",
  sortBy: "asc",
  state: "all",
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
  const router = useRouter();
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.armedType !== "all" ||
    (filters.state && filters.state !== "all") ||
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
        onChange={(id) => onFilterChange({ ...filters, status: id as DriverFilters["status"] })}
      />

      <TableCard
        title="Driver roster"
        subtitle="Applications, verification status, ratings and earnings for every driver"
      >
        <FilterBar>
          <SearchField
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search by name, phone or license"
          />
          <FilterSelect
            icon={MapPin}
            value={filters.state || "all"}
            onChange={(v) => onFilterChange({ ...filters, state: v })}
            options={stateOptions}
            className="w-[170px]"
          />
          <FilterSelect
            icon={ShieldCheck}
            value={filters.armedType}
            onChange={(v) => onFilterChange({ ...filters, armedType: v as DriverFilters["armedType"] })}
            options={[
              { value: "all", label: "All security" },
              { value: "armed", label: "Armed" },
              { value: "unarmed", label: "Unarmed" },
            ]}
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
          <Table className="w-full min-w-[820px] text-[14px]">
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className={`${thClass} text-left`}>Driver</TableHead>
                <TableHead className={`${thClass} text-left`}>Status</TableHead>
                <TableHead className={`${thClass} text-left`}>State</TableHead>
                <TableHead className={`${thClass} text-right`}>Rating</TableHead>
                <TableHead className={`${thClass} text-right`}>Trips</TableHead>
                <TableHead className={`${thClass} text-right`}>Earnings</TableHead>
                <TableHead className={`${thClass} text-right`}>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="p-0">
                    <TableMessage>Loading driver roster...</TableMessage>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="p-0">
                    <TableMessage tone="error">{error}</TableMessage>
                  </TableCell>
                </TableRow>
              ) : drivers.length > 0 ? (
                drivers.map((driver) => {
                  const isPending = driver.status === "pending";
                  const isActing = actionDriverId === driver.id;

                  return (
                    <TableRow
                      key={driver.id}
                      className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-accent/60"
                      onClick={() => router.push(`/dashboard/drivers/${driver.id}`)}
                    >
                      <TableCell className={tdClass}>
                        <div className="flex items-center gap-3">
                          <InitialAvatar name={driver.name} />
                          <div className="min-w-0 leading-tight">
                            <p className="font-semibold text-foreground">{driver.name || "Unnamed driver"}</p>
                            <p className="max-w-[200px] truncate text-[12px] text-muted-foreground">
                              {driver.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className={tdClass}>
                        <StatusDot tone={statusTone(driver.status)}>{driver.status}</StatusDot>
                      </TableCell>
                      <TableCell className={`${tdClass} text-muted-foreground`}>{driver?.state || "—"}</TableCell>
                      <TableCell className={`${tdClass} text-right`}>
                        <span className="inline-flex items-center gap-1 font-semibold tnum text-foreground">
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          {driver.rating || "5.0"}
                        </span>
                      </TableCell>
                      <TableCell className={`${tdClass} text-right font-semibold tnum`}>{driver.totalRides}</TableCell>
                      <TableCell className={`${tdClass} text-right font-semibold tnum`}>
                        ${driver.earnings.toLocaleString()}
                      </TableCell>
                      <TableCell className={`${tdClass} text-right`}>
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          {isPending ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => onApproveDriver(driver.id)}
                                disabled={isActing}
                                className="h-8 cursor-pointer rounded-lg px-3 text-[13px] font-semibold"
                              >
                                {isActing ? <Loader2 className="size-3.5 animate-spin" /> : "Approve"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedDriverId(driver.id);
                                  setIsRejectDialogOpen(true);
                                }}
                                disabled={isActing}
                                className="h-8 cursor-pointer rounded-lg border-destructive/40 px-3 text-[13px] text-destructive hover:bg-destructive/10"
                              >
                                Reject
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/dashboard/drivers/${driver.id}`)}
                              className="h-8 cursor-pointer rounded-lg px-3 text-[13px] text-primary hover:bg-primary/10"
                            >
                              View
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="p-0">
                    <TableMessage>No drivers found in this view.</TableMessage>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <PageFooter
          shown={drivers.length}
          total={total}
          page={page}
          totalPages={totalPages}
          limit={limit}
          noun="drivers"
          disabled={isFetching}
          onPage={onPageChange}
          onPageSize={onPageSizeChange}
        />
      </TableCard>

      {/* Reject Modal Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-border/70 bg-card rounded-lg">
          <DialogHeader className="border-b border-border/60 bg-muted/20 px-5 py-4">
            <DialogTitle className="text-[16px] font-semibold tracking-tight text-foreground">
              Reject Driver Application
            </DialogTitle>
            <DialogDescription className="text-[14px] text-muted-foreground">
              State the reason for compliance records and driver notice.
            </DialogDescription>
          </DialogHeader>

          <div className="p-5 space-y-2">
            <Label className="text-[13px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
              Rejection Reason
            </Label>
            <Input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Expired vehicle registration or background check incomplete"
              className="h-9 text-[14px] bg-background border-border/70"
            />
          </div>

          <DialogFooter className="border-t border-border/60 bg-muted/10 px-5 py-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsRejectDialogOpen(false);
                setRejectReason("");
                setSelectedDriverId(null);
              }}
              className="h-8 text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={!rejectReason.trim()}
              onClick={() => {
                if (!selectedDriverId || !rejectReason.trim()) return;
                onRejectDriver(selectedDriverId, rejectReason.trim());
                setIsRejectDialogOpen(false);
                setRejectReason("");
                setSelectedDriverId(null);
              }}
              className="h-8 text-xs font-semibold cursor-pointer"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
