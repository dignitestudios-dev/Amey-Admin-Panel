"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RidesDataTable } from "./components/rides-data-table";
import { getRides, type RideStatus } from "@/lib/api/rides.api";
import { useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface RideFilters {
  status: "all" | RideStatus;
  rideType: "all";
  isOnGoing: boolean;
  state: string | "all";
}

export default function OngoingRidesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const searchParams = useSearchParams();

  const stateParam = searchParams.get("state") || "all";
  const statusParam = (searchParams.get("status") as RideStatus) || "all";

  const filters: RideFilters = useMemo(
    () => ({
      status: statusParam,
      rideType: "all",
      isOnGoing: true,
      state: stateParam,
    }),
    [statusParam, stateParam]
  );

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

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
      rideType: undefined,
      state: filters.state === "all" ? undefined : filters.state,
      isOnGoing: true,
      search: debouncedSearchQuery.trim() || undefined,
      page,
      limit,
    };
  }, [filters, debouncedSearchQuery, page, limit]);

  const ridesQuery = useQuery({
    queryKey: ["rides", queryParams],
    queryFn: () => getRides(queryParams),
    placeholderData: (previousData) => previousData,
    refetchInterval: 10000, // Live poll every 10s for active rides
  });

  const rides = ridesQuery.data?.rides ?? [];
  const pagination = ridesQuery.data?.pagination;

  const handlePageChange = (nextPage: number) => {
    if (!pagination) return;
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    setPage(nextPage);
  };

  const handlePageSizeChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
  };

  return (
    <div className="flex flex-col min-w-0">
      {/* Signature EpicRides Page Header */}
      <header className="border-b border-border/60 bg-card/60 px-5 sm:px-6 pt-5 pb-5 backdrop-blur-md">
        <nav className="mb-2 flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <span>Operate</span>
          <ChevronRight className="size-3 opacity-50" />
          <span className="text-foreground font-medium">Ongoing Rides</span>
        </nav>
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <p className="eyebrow mb-1">Live Telemetry</p>
            <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
              Ongoing Dispatch
            </h1>
            <p className="text-[15px] leading-relaxed text-muted-foreground mt-0.5">
              Live active trips in transit, route updates, and realtime telemetry.
            </p>
          </div>

          {/* Quick Realtime KPI Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-baseline gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1">
              <span className="relative flex size-2 mr-0.5 self-center">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              <span className="text-[12px] uppercase tracking-[0.05em] text-primary font-semibold">Active:</span>
              <span className="text-xs font-semibold tnum text-primary">
                {pagination?.total?.toLocaleString("en-US") ?? "0"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 lg:p-7 max-w-[1600px] w-full mx-auto space-y-4">
        <RidesDataTable
          rides={rides}
          filters={filters}
          searchQuery={searchQuery}
          page={pagination?.page ?? page}
          limit={pagination?.limit ?? limit}
          total={pagination?.total ?? 0}
          totalPages={pagination?.totalPages ?? 1}
          isLoading={ridesQuery.isLoading}
          isFetching={ridesQuery.isFetching}
          error={ridesQuery.error?.message ?? null}
          onSearchChange={(value) => {
            setSearchQuery(value);
            if (!value.trim()) {
              setDebouncedSearchQuery("");
              setPage(1);
            }
          }}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
}
