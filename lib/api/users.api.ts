import axios from "axios";
import { API } from "./axios";

export type PassengerStatus = "pending" | "approved" | "rejected" | "deleted";

export interface Passenger {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: PassengerStatus;
  totalRides: number;
  regDate: string;
}

export interface PassengersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PassengersResponse {
  message: string;
  passengers: Passenger[];
  pagination: PassengersPagination;
}

export interface GetPassengersParams {
  status?: PassengerStatus;
  date?: string;
  rideCount?: number;
  page: number;
  limit: number;
}

const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string } | undefined)?.message ||
      "Failed to load passengers."
    );
  }

  return "Something went wrong. Please try again.";
};

export const getPassengers = async (
  params: GetPassengersParams,
): Promise<PassengersResponse> => {
  try {
    const response = await API.get<PassengersResponse>("/admin/passengers", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};
