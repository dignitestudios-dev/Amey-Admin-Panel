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
