"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RidesDataTable } from "./components/rides-data-table";
import {
  getRides,
  type RideFilters,
  type RideStatus,
  type RideType,
} from "@/lib/api/rides.api";
import { useSearchParams } from "next/navigation";

const RidesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const searchParams = useSearchParams(); 
  const [filters, setFilters] = useState<RideFilters>({
    status: (searchParams.get("status") as RideFilters["status"]) || "all",
    rideType: "all",
    isOnGoing: false,
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
      isOnGoing: false,
      search: debouncedSearchQuery.trim() || undefined,
      page,
      limit,
    };
  }, [filters, debouncedSearchQuery, page, limit]);

  const ridesQuery = useQuery({
    queryKey: ["rides", queryParams],
    queryFn: () => getRides(queryParams),
    placeholderData: (previousData) => previousData,
  });

  const rides = ridesQuery.data?.rides ?? [];
  const pagination = ridesQuery.data?.pagination;

  const handleFilterChange = (nextFilters: RideFilters) => {
    setFilters(nextFilters);
    setPage(1);
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

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black">Ride Management</h1>
        <p className="text-sm text-gray-500 mt-2">
          Track rides, monitor statuses, and review route activity
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
      />
    </div>
  );
};

export default RidesPage;
