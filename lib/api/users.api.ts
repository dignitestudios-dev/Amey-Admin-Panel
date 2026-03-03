import axios from "axios";
import { API } from "./axios";

export type AccountStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "onHold"
  | "admin-approved"
  | "deleted";
export type PassengerStatus = AccountStatus;

export interface Passenger {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: AccountStatus;
  isRestricted?: boolean;
  totalRides: number;
  regDate: string;
}

export interface PassengerProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  deviceInfo: string;
  accountStatus: string;
  gender: string;
  genderDescription: string;
  walletBalance: number;
  allowNotifications: boolean;
  profileImageUrl: string | null;
  customerId: string | null;
  currentRideId: string | null;
  createdAt: string;
  updatedAt: string;
  isRestricted: boolean;
}

export interface PassengerRideHistory {
  id: string;
  rideId: string;
  rideStatus: string;
  rideCategory: string;
  city: string;
  specialRequest: string;
  feedback: string;
  cancellationReason: string;
  rideSecurity: string;
  actualFare: number;
  cancellationFee: number;
  rideDistance: number;
  rideDuration: number;
  additionalDuration: number;
  tipPaid: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  pickupPointName: string;
  pickupCoordinates: number[];
  dropOffPointName: string;
  dropOffCoordinates: number[];
  driverName: string;
  driverPhoneNumber: string;
  driverEmail: string;
  driverRating: number;
  driverCity: string;
  driverAddress: string;
  vehicleModel: string;
  vehiclePlateNumber: string;
  vehicleBodyType: string;
}

export interface PassengerReview {
  id: string;
  driverId: string;
  passengerId: string;
  rating: number;
  type: string;
  description: string;
  images: string[];
  createdAt: string;
}

export interface PassengerDetails {
  profile: PassengerProfile;
  rideHistory: PassengerRideHistory[];
  reviews: PassengerReview[];
  totalSpent: number;
}

export interface PassengerDetailsResponse {
  message: string;
  passenger: PassengerDetails;
}

export interface TogglePassengerRestrictPayload {
  passengerID: string;
  isRestricted: boolean;
}

export interface TogglePassengerRestrictResponse {
  message: string;
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
  status?: AccountStatus;
  search?: string;
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

type RawPassengerProfile = {
  _id?: string;
  session?: {
    deviceInfo?: string;
  };
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  accountStatus?: string;
  gender?: string;
  genderDescription?: string;
  walletBalance?: number;
  allowNotifications?: boolean;
  profileImageUrl?: string | null;
  customerId?: string | null;
  currentRideId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type RawPassengerDetailsContainer = {
  passenger?: RawPassengerProfile;
  rideHistory?: Array<{
    _id?: string;
    rideId?: string;
    rideStatus?: string;
    rideCategory?: string;
    city?: string;
    specialRequest?: string;
    feedback?: string | null;
    cancellationReason?: string;
    rideSecurity?: string;
    actualFare?: number;
    cancellationFee?: number;
    rideDistance?: number;
    rideDuration?: number;
    additionalDuration?: number;
    tipPaid?: number;
    startTime?: string;
    endTime?: string;
    createdAt?: string;
    updatedAt?: string;
    pickupPoint?: {
      placeName?: string;
      location?: {
        coordinates?: number[];
      };
    };
    dropOffPoint?: {
      placeName?: string;
      location?: {
        coordinates?: number[];
      };
    };
    driver?: {
      fullName?: string;
      phoneNumber?: string;
      email?: string;
      avgRating?: number;
      city?: string;
      address?: string;
      vehicleInfo?: {
        carModel?: string;
        licensePlateNumber?: string;
        bodyType?: string;
      };
    };
  }>;
  reviews?: Array<{
    _id?: string;
    driverId?: string;
    passengerId?: string;
    rating?: number;
    type?: string;
    description?: string;
    images?: string[] | null;
    createdAt?: string;
  }>;
  totalSpent?: number;
};

interface RawPassengerDetailsResponse {
  message: string;
  passenger: RawPassengerDetailsContainer;
}

const getSafeText = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") {
    return value;
  }

  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (typeof value === "object") {
    const maybeDescription =
      (value as { description?: unknown }).description;
    if (typeof maybeDescription === "string") {
      return maybeDescription;
    }
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }

  return fallback;
};

export const getPassengerDetails = async (
  passengerId: string,
): Promise<PassengerDetailsResponse> => {
  try {
    const response = await API.get<RawPassengerDetailsResponse>(
      `/admin/passengers/${passengerId}`,
    );

    const detailsContainer = response.data.passenger;
    const profile = detailsContainer.passenger;

    if (!profile?._id) {
      throw new Error("Passenger details are unavailable.");
    }

    return {
      message: response.data.message,
      passenger: {
        profile: {
          id: profile._id,
          fullName: profile.fullName ?? "-",
          email: profile.email ?? "-",
          phoneNumber: profile.phoneNumber ?? "-",
          deviceInfo: profile.session?.deviceInfo ?? "-",
          accountStatus: profile.accountStatus ?? "unknown",
          gender: profile.gender ?? "-",
          genderDescription: profile.genderDescription ?? "",
          walletBalance: profile.walletBalance ?? 0,
          allowNotifications: profile.allowNotifications ?? false,
          profileImageUrl: profile.profileImageUrl ?? null,
          customerId: profile.customerId ?? null,
          currentRideId: profile.currentRideId ?? null,
          createdAt: profile.createdAt ?? "",
          updatedAt: profile.updatedAt ?? "",
          isRestricted: (profile.accountStatus ?? "").toLowerCase() === "onhold",
        },
        rideHistory: (detailsContainer.rideHistory ?? []).map((ride) => ({
          id: ride._id ?? "",
          rideId: ride.rideId ?? "",
          rideStatus: ride.rideStatus ?? "unknown",
          rideCategory: ride.rideCategory ?? "-",
          city: ride.city ?? "-",
          specialRequest: getSafeText(ride.specialRequest, ""),
          feedback: getSafeText(ride.feedback, ""),
          cancellationReason: getSafeText(ride.cancellationReason, ""),
          rideSecurity: ride.rideSecurity ?? "-",
          actualFare: ride.actualFare ?? 0,
          cancellationFee: ride.cancellationFee ?? 0,
          rideDistance: ride.rideDistance ?? 0,
          rideDuration: ride.rideDuration ?? 0,
          additionalDuration: ride.additionalDuration ?? 0,
          tipPaid: ride.tipPaid ?? 0,
          startTime: ride.startTime ?? "",
          endTime: ride.endTime ?? "",
          createdAt: ride.createdAt ?? "",
          updatedAt: ride.updatedAt ?? "",
          pickupPointName: ride.pickupPoint?.placeName ?? "-",
          pickupCoordinates: ride.pickupPoint?.location?.coordinates ?? [],
          dropOffPointName: ride.dropOffPoint?.placeName ?? "-",
          dropOffCoordinates: ride.dropOffPoint?.location?.coordinates ?? [],
          driverName: ride.driver?.fullName ?? "-",
          driverPhoneNumber: ride.driver?.phoneNumber ?? "-",
          driverEmail: ride.driver?.email ?? "-",
          driverRating: ride.driver?.avgRating ?? 0,
          driverCity: ride.driver?.city ?? "-",
          driverAddress: ride.driver?.address ?? "-",
          vehicleModel: ride.driver?.vehicleInfo?.carModel ?? "-",
          vehiclePlateNumber: ride.driver?.vehicleInfo?.licensePlateNumber ?? "-",
          vehicleBodyType: ride.driver?.vehicleInfo?.bodyType ?? "-",
        })),
        reviews: (detailsContainer.reviews ?? []).map((review) => ({
          id: review._id ?? "",
          driverId: review.driverId ?? "",
          passengerId: review.passengerId ?? "",
          rating: review.rating ?? 0,
          type: review.type ?? "unknown",
          description: review.description ?? "",
          images: review.images ?? [],
          createdAt: review.createdAt ?? "",
        })),
        totalSpent: detailsContainer.totalSpent ?? 0,
      },
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const togglePassengerRestrict = async (
  payload: TogglePassengerRestrictPayload,
): Promise<TogglePassengerRestrictResponse> => {
  try {
    const response = await API.patch<TogglePassengerRestrictResponse>(
      "/admin/passengers/toggle-restrict",
      payload,
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};
