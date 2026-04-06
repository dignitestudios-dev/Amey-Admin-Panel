"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DataTable } from "./components/data-table";
import {
  getPassengers,
  togglePassengerRestrict,
  type AccountStatus,
} from "@/lib/api/users.api";

interface PassengerFilters {
  status: "all" | AccountStatus;
  date: string;
  rideCount: string;
  sortBy: "asc" | "desc";
}

export default function PassengersPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [filters, setFilters] = useState<PassengerFilters>({
    status: "all",
    date: "",
    rideCount: "",
    sortBy: "asc",
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [restrictingPassengerId, setRestrictingPassengerId] = useState<string | null>(null);

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
      search: debouncedSearchQuery.trim() || undefined,
      date: filters.date || undefined,
      rideCount: filters.rideCount ? Number(filters.rideCount) : undefined,
      sortBy: filters.sortBy,
      page,
      limit,
    };
  }, [filters, debouncedSearchQuery, page, limit]);

  const passengersQuery = useQuery({
    queryKey: ["passengers", queryParams],
    queryFn: () => getPassengers(queryParams),
    placeholderData: (previousData) => previousData,
  });

  const passengers = passengersQuery.data?.passengers ?? [];
  const pagination = passengersQuery.data?.pagination;

  const toggleRestrictMutation = useMutation({
    mutationFn: togglePassengerRestrict,
  });

  const handleFilterChange = (nextFilters: PassengerFilters) => {
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

  const handleToggleRestrict = async (passengerID: string, isRestricted: boolean) => {
    setRestrictingPassengerId(passengerID);
    try {
      await toggleRestrictMutation.mutateAsync({
        passengerID,
        isRestricted,
      });
      await Promise.all([
        passengersQuery.refetch(),
        queryClient.invalidateQueries({ queryKey: ["passenger-details", passengerID] }),
      ]);
      toast.success(
        isRestricted
          ? "Passenger restricted successfully."
          : "Passenger unrestricted successfully.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update passenger status.",
      );
    } finally {
      setRestrictingPassengerId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 @container/main px-4 lg:px-6 mt-2">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-black">Passenger Management</h1>
        <p className="text-sm text-gray-500 mt-2">
          Manage passenger accounts, review statuses, and monitor ride activity
        </p>
      </div>

      <DataTable
        passengers={passengers}
        filters={filters}
        searchQuery={searchQuery}
        page={pagination?.page ?? page}
        limit={pagination?.limit ?? limit}
        total={pagination?.total ?? 0}
        totalPages={pagination?.totalPages ?? 1}
        isLoading={passengersQuery.isLoading}
        isFetching={passengersQuery.isFetching}
        error={passengersQuery.error?.message ?? null}
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
        onToggleRestrict={handleToggleRestrict}
        restrictingPassengerId={restrictingPassengerId}
        onRefresh={() => passengersQuery.refetch()}
      />
    </div>
  );
}
