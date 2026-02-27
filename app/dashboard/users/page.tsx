"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "./components/data-table";
import {
  getPassengers,
  type PassengerStatus,
} from "@/lib/api/users.api";

interface UserFilters {
  status: "all" | PassengerStatus;
  date: string;
  rideCount: string;
}

export default function UsersPage() {
  const [filters, setFilters] = useState<UserFilters>({
    status: "all",
    date: "",
    rideCount: "",
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const queryParams = useMemo(() => {
    return {
      status: filters.status === "all" ? undefined : filters.status,
      date: filters.date || undefined,
      rideCount: filters.rideCount ? Number(filters.rideCount) : undefined,
      page,
      limit,
    };
  }, [filters, page, limit]);

  const passengersQuery = useQuery({
    queryKey: ["passengers", queryParams],
    queryFn: () => getPassengers(queryParams),
    placeholderData: (previousData) => previousData,
  });

  const passengers = passengersQuery.data?.passengers ?? [];
  const pagination = passengersQuery.data?.pagination;

  const handleFilterChange = (nextFilters: UserFilters) => {
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
    <div className="flex flex-col gap-4 @container/main px-4 lg:px-6 mt-2">
      <DataTable
        users={passengers}
        filters={filters}
        page={pagination?.page ?? page}
        limit={pagination?.limit ?? limit}
        total={pagination?.total ?? 0}
        totalPages={pagination?.totalPages ?? 1}
        isLoading={passengersQuery.isLoading}
        isFetching={passengersQuery.isFetching}
        error={passengersQuery.error?.message ?? null}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onRefresh={() => passengersQuery.refetch()}
      />
    </div>
  );
}
