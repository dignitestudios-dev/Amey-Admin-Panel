"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DriversDataTable } from "./components/drivers-data-table";
import {
  approveDriver,
  getDrivers,
  rejectDriver,
  type DriverSecurityType,
  type DriverStatus,
} from "@/lib/api/drivers.api";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface DriverFilters {
  status: "all" | DriverStatus;
  armedType: "all" | DriverSecurityType;
  rating: string;
  rideCount: string;
  sortBy: "asc" | "desc";
  state: string | "all";
}

export default function DriversPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<DriverFilters>({
    status: (searchParams.get("status") as DriverStatus) || "all",
    armedType: "all",
    rating: "",
    rideCount: "",
    sortBy: (searchParams.get("sortBy") as "asc" | "desc") || "asc",
    state: (searchParams.get("state") as string) || "all",
  });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [actionDriverId, setActionDriverId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const queryParams = useMemo(() => {
    return {
      status: filters.status === "all" ? undefined : filters.status,
      armedType: filters.armedType === "all" ? undefined : filters.armedType,
      search: debouncedSearchQuery.trim() || undefined,
      rating: filters.rating ? Number(filters.rating) : undefined,
      rideCount: filters.rideCount ? Number(filters.rideCount) : undefined,
      state: filters.state === "all" ? undefined : filters.state,
      sortBy: filters.sortBy,
      page,
      limit,
    };
  }, [filters, debouncedSearchQuery, page, limit]);

  const driversQuery = useQuery({
    queryKey: ["drivers", queryParams],
    queryFn: () => getDrivers(queryParams),
    placeholderData: (previousData) => previousData,
  });

  const drivers = driversQuery.data?.drivers ?? [];
  const pagination = driversQuery.data?.pagination;

  const approveMutation = useMutation({
    mutationFn: approveDriver,
  });

  const rejectMutation = useMutation({
    mutationFn: rejectDriver,
  });

  const handleFilterChange = (nextFilters: DriverFilters) => {
    setFilters(nextFilters);
    setPage(1);

    const params = new URLSearchParams();

    if (nextFilters.status !== "all") {
      params.set("status", nextFilters.status);
    }

    if (nextFilters.armedType !== "all") {
      params.set("armedType", nextFilters.armedType);
    }

    if (nextFilters.state && nextFilters.state !== "all") {
      params.set("state", nextFilters.state);
    }

    if (nextFilters.sortBy) {
      params.set("sortBy", nextFilters.sortBy);
    }

    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (nextPage: number) => {
    if (!pagination) return;
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    setPage(nextPage);
  };

  const handlePageSizeChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
  };

  const handleApprove = async (driverId: string) => {
    setActionDriverId(driverId);
    try {
      const response = await approveMutation.mutateAsync({ driverId });
      toast.success(response.message || "Driver application approved successfully.");
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-counts"] });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to approve driver."
      );
    } finally {
      setActionDriverId(null);
    }
  };

  const handleReject = async (driverId: string, reason: string) => {
    setActionDriverId(driverId);
    try {
      const response = await rejectMutation.mutateAsync({
        driverId,
        rejectionReason: reason,
      });
      toast.success(response.message || "Driver application rejected.");
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-counts"] });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to reject driver."
      );
    } finally {
      setActionDriverId(null);
    }
  };

  return (
    <div className="flex flex-col min-w-0">
      {/* Signature EpicRides Page Header */}
      <header className="border-b border-border/60 bg-card/60 px-5 sm:px-6 pt-5 pb-5 backdrop-blur-md">
        <nav className="mb-2 flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <span>Fleet</span>
          <ChevronRight className="size-3 opacity-50" />
          <span className="text-foreground font-medium">Driver Onboarding</span>
        </nav>
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <p className="eyebrow mb-1">Driver pipeline & fleet</p>
            <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
              Driver Onboarding
            </h1>
            <p className="text-[15px] leading-relaxed text-muted-foreground mt-0.5">
              Application pipeline, background verifications, document review, and active roster.
            </p>
          </div>

          {/* Quick Metrics Badges in Header */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-baseline gap-1.5 rounded-md border border-border/70 bg-background/60 px-2.5 py-1">
              <span className="text-[12px] uppercase tracking-[0.05em] text-muted-foreground">Total Drivers</span>
              <span className="text-xs font-semibold tnum text-primary">
                {pagination?.total?.toLocaleString("en-US") ?? "0"}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 rounded-md border border-border/70 bg-background/60 px-2.5 py-1">
              <span className="text-[12px] uppercase tracking-[0.05em] text-muted-foreground">Status</span>
              <span className="text-xs font-semibold text-foreground capitalize">
                {filters.status}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 lg:p-7 max-w-[1600px] w-full mx-auto space-y-4">
        <DriversDataTable
          drivers={drivers}
          filters={filters}
          searchQuery={searchQuery}
          page={pagination?.page ?? page}
          limit={pagination?.limit ?? limit}
          total={pagination?.total ?? 0}
          totalPages={pagination?.totalPages ?? 1}
          isLoading={driversQuery.isLoading}
          isFetching={driversQuery.isFetching}
          error={driversQuery.error?.message ?? null}
          onFilterChange={handleFilterChange}
          onSearchChange={(value) => {
            setSearchQuery(value);
            if (!value.trim()) {
              setDebouncedSearchQuery("");
              setPage(1);
            }
          }}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onApproveDriver={handleApprove}
          onRejectDriver={handleReject}
          actionDriverId={actionDriverId}
          onRefresh={() => driversQuery.refetch()}
        />
      </div>
    </div>
  );
}
