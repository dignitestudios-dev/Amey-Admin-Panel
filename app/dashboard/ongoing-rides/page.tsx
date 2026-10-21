"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RidesDataTable, type OngoingRideFilters } from "./components/rides-data-table";
import {
  getRides,
  type RideStatus,
} from "@/lib/api/rides.api";
import { useRouter, useSearchParams } from "next/navigation";

const OngoingRidesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const [filters, setFilters] = useState<OngoingRideFilters>({
    status: (searchParams.get("status") as RideStatus) || "all",
    rideType: "all",
    isOnGoing: true,
    state: searchParams.get("state") || "all",
  });
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
      rideType: filters.rideType === "all" ? undefined : filters.rideType,
      state: filters.state === "all" ? undefined : filters.state,
      isOnGoing: true,
      search: debouncedSearchQuery.trim() || undefined,
      page,
      limit,
    };
  }, [filters, debouncedSearchQuery, page, limit]);

  const ridesQuery = useQuery({
    queryKey: ["rides", "ongoing", queryParams],
    queryFn: () => getRides(queryParams),
    placeholderData: (previousData) => previousData,
  });

  const rides = ridesQuery.data?.rides ?? [];
  const pagination = ridesQuery.data?.pagination;

  const handleFilterChange = (nextFilters: OngoingRideFilters) => {
    setFilters(nextFilters);
    setPage(1);

    const params = new URLSearchParams();
    if (nextFilters.status !== "all") {
      params.set("status", nextFilters.status);
    }
    if (nextFilters.state && nextFilters.state !== "all") {
      params.set("state", nextFilters.state);
    }
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (nextPage: number) => {
    if (!pagination) {
      return;
    }

    if (nextPage < 1 || nextPage > pagination.totalPages) {
      return;
    }

    setPage(nextPage);
  };

  const handlePageSizeChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
  };

  useEffect(() => {
    const stateParam = searchParams.get("state") || "all";
    const statusParam = (searchParams.get("status") as RideStatus) || "all";

    setFilters((prev) => ({
      ...prev,
      state: stateParam,
      status: statusParam,
    }));

    setPage(1);
  }, [searchParams]);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Ongoing Rides</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track active rides in real time, monitor statuses, and review route activity
        </p>
      </div>

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
        onRefresh={() => ridesQuery.refetch()}
      />
    </div>
  );
};

export default OngoingRidesPage;
