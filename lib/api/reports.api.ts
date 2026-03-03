import axios from "axios";
import { API } from "./axios";

export interface ReportPerson {
  id: string;
  fullName: string;
  profileImageUrl: string;
  email: string;
  phoneNumber: string;
}

export interface RevenueReportItem {
  rideId: string;
  rideDate: string;
  actualFare: number;
  platformCommission: number;
  stripeFee: number;
  driverAmount: number;
  driver: ReportPerson;
  passenger: ReportPerson;
}

export interface RevenueReportPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface RevenueReportResponse {
  message: string;
  data: {
    revenue: RevenueReportItem[];
    pagination: RevenueReportPagination;
  };
}

export interface RevenueReportParams {
  page: number;
  limit: number;
}

export interface AnalyticsStateItem {
  id: string;
  totalRides: number;
}

export interface ReportDriverAnalytics {
  totalDrivers: number;
  armedDriver: number;
}

export interface ReportPassengerAnalytics {
  totalUsers: number;
  activeUsers: number;
  dormantUsers: number;
  activeRatio: number;
  dormantRatio: number;
}

export interface ReportAnalyticsResponse {
  message: string;
  data: {
    states: {
      topStates: AnalyticsStateItem[];
      leastStates: AnalyticsStateItem[];
    };
    driver: ReportDriverAnalytics;
    passenger: ReportPassengerAnalytics[];
  };
}

interface RawReportPerson {
  _id?: string;
  fullName?: string;
  profileImageUrl?: string;
  email?: string;
  phoneNumber?: string;
}

interface RawRevenueReportItem {
  rideId?: string;
  rideDate?: string;
  actualFare?: number;
  platformCommission?: number;
  stripeFee?: number;
  driverAmount?: number;
  driver?: RawReportPerson;
  passenger?: RawReportPerson;
}

interface RawRevenueReportResponse {
  message: string;
  data?: {
    revenue?: RawRevenueReportItem[];
    pagination?: RevenueReportPagination;
  };
}

interface RawReportAnalyticsResponse {
  message: string;
  data?: {
    states?: {
      topStates?: Array<{ _id?: string; totalRides?: number }>;
      leastStates?: Array<{ _id?: string; totalRides?: number }>;
    };
    driver?: ReportDriverAnalytics;
    passenger?: ReportPassengerAnalytics[];
  };
}

const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string } | undefined)?.message ||
      "Failed to load reports."
    );
  }

  return "Something went wrong. Please try again.";
};

const mapPerson = (person?: RawReportPerson): ReportPerson => ({
  id: person?._id ?? "",
  fullName: person?.fullName ?? "-",
  profileImageUrl: person?.profileImageUrl ?? "",
  email: person?.email ?? "-",
  phoneNumber: person?.phoneNumber ?? "-",
});

export const getRevenueReport = async (
  params: RevenueReportParams,
): Promise<RevenueReportResponse> => {
  try {
    const response = await API.get<RawRevenueReportResponse>("/admin/revenue-report", {
      params,
    });

    const revenue = (response.data.data?.revenue ?? []).map((item) => ({
      rideId: item.rideId ?? "",
      rideDate: item.rideDate ?? "",
      actualFare: item.actualFare ?? 0,
      platformCommission: item.platformCommission ?? 0,
      stripeFee: item.stripeFee ?? 0,
      driverAmount: item.driverAmount ?? 0,
      driver: mapPerson(item.driver),
      passenger: mapPerson(item.passenger),
    }));

    const pagination = response.data.data?.pagination ?? {
      page: params.page,
      limit: params.limit,
      total: revenue.length,
      totalPages: 1,
    };

    return {
      message: response.data.message,
      data: {
        revenue,
        pagination,
      },
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const getReportAnalytics = async (): Promise<ReportAnalyticsResponse> => {
  try {
    const response = await API.get<RawReportAnalyticsResponse>("/admin/report-analytics");

    const topStates = (response.data.data?.states?.topStates ?? []).map((item) => ({
      id: item._id ?? "Unknown",
      totalRides: item.totalRides ?? 0,
    }));

    const leastStates = (response.data.data?.states?.leastStates ?? []).map((item) => ({
      id: item._id ?? "Unknown",
      totalRides: item.totalRides ?? 0,
    }));

    return {
      message: response.data.message,
      data: {
        states: {
          topStates,
          leastStates,
        },
        driver: response.data.data?.driver ?? {
          totalDrivers: 0,
          armedDriver: 0,
        },
        passenger: response.data.data?.passenger ?? [],
      },
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};
