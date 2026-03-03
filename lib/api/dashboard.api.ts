import axios from "axios";
import { API } from "./axios";

export interface DashboardCounts {
  ridesCount: number;
  passengersCount: number;
  activeRidesCount: number;
  driversCount: number;
  revenue: number;
  pendingDriversCount: number;
  platformCommission: number;
}

export interface DashboardCountsResponse {
  message: string;
  data: DashboardCounts;
}

export interface DashboardCountsParams {
  startDate?: string;
  endDate?: string;
}

export interface DashboardRidesByMonth {
  month: number;
  totalRides: number;
}

export interface DashboardRevenueByMonth {
  month: number;
  totalRevenue: number;
  platformCommission: number;
  netRevenue: number;
}

export interface DashboardStats {
  ridesByMonth: DashboardRidesByMonth[];
  revenueByMonth: DashboardRevenueByMonth[];
}

export interface DashboardStatsResponse {
  message: string;
  data: DashboardStats;
}

export interface DashboardStatsParams {
  year: number;
}

const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string } | undefined)?.message ||
      "Failed to load dashboard statistics."
    );
  }

  return "Something went wrong. Please try again.";
};

export const getDashboardCounts = async (
  params?: DashboardCountsParams,
): Promise<DashboardCountsResponse> => {
  try {
    const response = await API.get<DashboardCountsResponse>("/admin/dashboard-counts", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const getDashboardStats = async (
  params: DashboardStatsParams,
): Promise<DashboardStatsResponse> => {
  try {
    const response = await API.get<DashboardStatsResponse>("/admin/dashboard-stats", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};
