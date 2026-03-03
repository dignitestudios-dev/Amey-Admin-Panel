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

interface DriverFilters {
  status: "all" | DriverStatus;
  armedType: "all" | DriverSecurityType;
  rating: string;
  rideCount: string;
}

const Drivers = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [filters, setFilters] = useState<DriverFilters>({
    status: "all",
    armedType: "all",
    rating: "",
    rideCount: "",
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [actionDriverId, setActionDriverId] = useState<string | null>(null);

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

  const handleApprove = async (driverId: string) => {
    setActionDriverId(driverId);
    try {
      await approveMutation.mutateAsync({ driverId });
      await Promise.all([
        driversQuery.refetch(),
        queryClient.invalidateQueries({ queryKey: ["driver-application-details", driverId] }),
      ]);
      toast.success("Driver approved successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to approve driver.");
    } finally {
      setActionDriverId(null);
    }
  };

  const handleReject = async (driverId: string, rejectionReason: string) => {
    setActionDriverId(driverId);
    try {
      await rejectMutation.mutateAsync({ driverId, rejectionReason });
      await Promise.all([
        driversQuery.refetch(),
        queryClient.invalidateQueries({ queryKey: ["driver-application-details", driverId] }),
      ]);
      toast.success("Driver rejected successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reject driver.");
    } finally {
      setActionDriverId(null);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black">Driver Management</h1>
        <p className="text-sm text-gray-500 mt-2">
          Manage driver accounts, approve applications, and monitor driver activities
        </p>
      </div>
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
  );
};

export default Drivers;
