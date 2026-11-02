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
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface PassengerFilters {
  status: "all" | AccountStatus;
  date: string;
  rideCount: string;
  sortBy: "asc" | "desc";
  state: string | "all";
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
    state: "all",
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

  const router = useRouter();

  const queryParams = useMemo(() => {
    return {
      status: filters.status === "all" ? undefined : filters.status,
      state: filters.state === "all" ? undefined : filters.state,
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

    const params = new URLSearchParams();

    if (nextFilters.status !== "all") {
      params.set("status", nextFilters.status);
    }

    if (nextFilters.sortBy) {
      params.set("sortBy", nextFilters.sortBy);
    }

    if (nextFilters.state && nextFilters.state !== "all") {
      params.set("state", nextFilters.state);
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

  const handleToggleRestrict = (passengerId: string, currentStatus: boolean) => {
    setRestrictingPassengerId(passengerId);
    toggleRestrictMutation.mutate(
      { passengerID: passengerId, isRestricted: !currentStatus },
      {
        onSuccess: (data) => {
          toast.success(data?.message || "Passenger status updated");
          queryClient.invalidateQueries({ queryKey: ["passengers"] });
        },
        onError: (err) => {
          toast.error(err.message || "Failed to update status");
        },
        onSettled: () => {
          setRestrictingPassengerId(null);
        },
      }
    );
  };

  return (
    <div className="flex flex-col min-w-0">
      {/* Signature EpicRides Page Header */}
      <header className="border-b border-border/60 bg-card/60 px-5 sm:px-6 pt-5 pb-5 backdrop-blur-md">
        <nav className="mb-2 flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <span>Network</span>
          <ChevronRight className="size-3 opacity-50" />
          <span className="text-foreground font-medium">Riders</span>
        </nav>
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <p className="eyebrow mb-1">Customer registry</p>
            <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
              Riders
            </h1>
            <p className="text-[15px] leading-relaxed text-muted-foreground mt-0.5">
              Registered rider profiles, booking velocity, security status, and ride counts.
            </p>
          </div>

          {/* Quick Metrics Badges in Header */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-baseline gap-1.5 rounded-md border border-border/70 bg-background/60 px-2.5 py-1">
              <span className="text-[12px] uppercase tracking-[0.05em] text-muted-foreground">Total Riders</span>
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
    </div>
  );
}
