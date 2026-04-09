import axios from "axios";
import { API } from "./axios";

export type RideStatus =
  | "requested"
  | "accepted"
  | "on-the-way"
  | "arrived"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "expired";

export type RideType = "hourly" | "quick" | "child";

export interface Ride {
  id: string;
  passengerId: string;
  passengerName: string;
  passengerEmail: string;
  city: string;
  state: string;
  rideStatus: RideStatus;
  rideCategory: RideType;
  rideSecurity: string;
  actualFare: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  pickupPointName: string;
  dropOffPointName: string;
}

export interface RideDriverDetails {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  accountStatus: string;
  gender: string;
  dateOfBirth: string;
  vehicleType: string;
  rideSecurityOption: string;
  avgRating: number;
  city: string;
  state: string;
  address: string;
  isVerified: boolean;
  isOnline: boolean;
  isProfileCompleted: boolean;
  allowNotifications: boolean;
  enabledIncomingRides: string[];
  createdAt: string;
}

export interface RideReview {
  rating: number;
  feedback: string;
  createdAt: string;
}

export interface RidePassengerDetails {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  accountStatus: string;
  gender: string;
  genderDescription: string;
  profileImageUrl: string | null;
  allowNotifications: boolean;
  deviceInfo: string;
  createdAt: string;
  updatedAt: string;
}

export interface RidePointDetails {
  placeName: string;
  coordinates: number[];
}

export interface RideJourneyPointDetails {
  placeName: string;
  hasReached: boolean;
  coordinates: number[];
}

export interface RideChildInfo {
  fullName: string;
  age: number;
  gender: string;
  relation: string;
  description: string;
}

export interface RideDetails {
  id: string;
  passengerId: string;
  state: string;
  city: string;
  rideStatus: string;
  rideCategory: string;

  pickupPoint: RidePointDetails;
  dropOffPoint: RidePointDetails;
  rideJourneyPoints: RideJourneyPointDetails[];
  childInfo: RideChildInfo[];

  rideDistance: number;
  rideBaseTotal: number;
  estimatedFare: number;
  actualFare: number;

  rideHistory?: {
    feedback?: {
      rating?: number;
      description?: string;
      images?: string[];
    };
  };

  rideDate: string;
  startTime: string;
  endTime: string;
  rideDuration: number;
  additionalDuration: number;

  vehicleType: string;
  rideSecurity: string;
  specialRequest: string;
  isChildCarSeat: boolean;

  createdAt: string;
  updatedAt: string;

  driverId?: RideDriverDetails | any;

  passenger?: RidePassengerDetails | null;

  passengerReview?: RideReview | null;
  driverReview?: RideReview | null;
}

export interface RideDetailsResponse {
  message: string;
  ride: RideDetails;

}

export interface RidesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface RidesResponse {
  message: string;
  rides: Ride[];
  pagination: RidesPagination;
}

export interface RideFilters {
  status: "all" | RideStatus;
  rideType: "all" | RideType;
  isOnGoing: boolean;
    state?: string | "all"; // ✅ add this

}

export interface GetRidesParams {
  status?: RideStatus;
  rideType?: RideType;
  isOnGoing?: boolean;
  search?: string;
  page: number;
  limit: number;
}

type RawRide = {
  _id?: string;
  passengerId?: string;
  state?: string;
  city?: string;
  rideStatus?: string;
  rideCategory?: string;
  pickupPoint?: { placeName?: string };
  dropOffPoint?: { placeName?: string };
  actualFare?: number;
  startTime?: string;
  endTime?: string;
  createdAt?: string;
  rideSecurity?: string;
  passenger?: {
    fullName?: string;
    email?: string;
  };
};

type RawRidesResponse = {
  message: string;
  rides: RawRide[];
  pagination: RidesPagination;
};

type RawRideDetailsResponse = {
  message: string;
  ride?: {
    _id?: string;
    passengerId?: string | {
      _id?: string;
      email?: string;
      accountStatus?: string;
      gender?: string;
      genderDescription?: string;
      fullName?: string;
      profileImageUrl?: string | null;
      phoneNumber?: string;
      allowNotifications?: boolean;
      session?: { deviceInfo?: string };
      createdAt?: string;
      updatedAt?: string;
    };
    state?: string;
    city?: string;
    rideStatus?: string;
    childInfo?: Array<{
      fullName?: string;
      age?: number;
      gender?: string;
      relation?: string;
      description?: string;
    }>;
    rideCategory?: string;
    pickupPoint?: {
      placeName?: string;
      location?: { coordinates?: number[] };
    };
    dropOffPoint?: {
      placeName?: string;
      location?: { coordinates?: number[] };
    };
    rideJourneyPoints?: Array<{
      placeName?: string;
      hasReached?: boolean;
      location?: { coordinates?: number[] };
    }>;
    rideDistance?: number;
    rideBaseTotal?: number;
    estimatedFare?: number;
    actualFare?: number;
    rideDate?: string;
    startTime?: string;
    endTime?: string;
    rideDuration?: number;
    additionalDuration?: number;
    vehicleType?: string;
    rideSecurity?: string;
    specialRequest?: string;
    isChildCarSeat?: boolean;
    createdAt?: string;
    updatedAt?: string;
    driverId?: string | null;
    rideHistory?: {
      feedback?: {
        rating?: number;
        " rating"?: number;
        description?: string;
        images?: string[];
      };
    };
  };
};

const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string } | undefined)?.message ||
      "Failed to load rides."
    );
  }

  return "Something went wrong. Please try again.";
};

const isRideStatus = (value: string): value is RideStatus => {
  return [
    "requested",
    "accepted",
    "on-the-way",
    "arrived",
    "in-progress",
    "completed",
    "cancelled",
    "expired",
  ].includes(value);
};

const isRideType = (value: string): value is RideType => {
  return ["hourly", "quick", "child"].includes(value);
};

export const getRides = async (
  params: GetRidesParams,
): Promise<RidesResponse> => {
  try {
    const response = await API.get<RawRidesResponse>("/admin/rides", {
      params,
    });

    return {
      message: response.data.message,
      pagination: response.data.pagination,
      rides: (response.data.rides ?? []).map((ride) => {
        const rawStatus = (ride.rideStatus ?? "requested").toLowerCase();
        const rawType = (ride.rideCategory ?? "quick").toLowerCase();

        return {
          id: ride._id ?? "",
          passengerId: ride.passengerId ?? "",
          passengerName: ride.passenger?.fullName ?? "-",
          passengerEmail: ride.passenger?.email ?? "-",
          city: ride.city ?? "-",
          state: ride.state ?? "-",
          rideStatus: isRideStatus(rawStatus) ? rawStatus : "requested",
          rideCategory: isRideType(rawType) ? rawType : "quick",
          rideSecurity: ride.rideSecurity ?? "-",
          actualFare: ride.actualFare ?? 0,
          startTime: ride.startTime ?? "",
          endTime: ride.endTime ?? "",
          createdAt: ride.createdAt ?? "",
          pickupPointName: ride.pickupPoint?.placeName ?? "-",
          dropOffPointName: ride.dropOffPoint?.placeName ?? "-",
        };
      }),
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const getRideById = async (rideId: string): Promise<RideDetailsResponse> => {
  try {
    const response = await API.get<RawRideDetailsResponse>(`/admin/rides/${rideId}`);
    const ride = response.data.ride;

    if (!ride?._id) {
      throw new Error("Ride details are unavailable.");
    }

    const passengerData =
      ride.passengerId && typeof ride.passengerId === "object" ? ride.passengerId : null;

    return {
      message: response.data.message,
      ride: {
        id: ride._id,
        passengerId:
          typeof ride.passengerId === "string"
            ? ride.passengerId
            : (ride.passengerId?._id ?? ""),
        state: ride.state ?? "-",
        city: ride.city ?? "-",
        rideStatus: ride.rideStatus ?? "unknown",
        rideCategory: ride.rideCategory ?? "-",
        pickupPoint: {
          placeName: ride.pickupPoint?.placeName ?? "-",
          coordinates: ride.pickupPoint?.location?.coordinates ?? [],
        },
        dropOffPoint: {
          placeName: ride.dropOffPoint?.placeName ?? "-",
          coordinates: ride.dropOffPoint?.location?.coordinates ?? [],
        },
        rideJourneyPoints: (ride.rideJourneyPoints ?? []).map((point) => ({
          placeName: point.placeName ?? "-",
          hasReached: point.hasReached ?? false,
          coordinates: point.location?.coordinates ?? [],
        })),
        childInfo: (ride.childInfo ?? []).map((child) => ({
          fullName: child.fullName ?? "-",
          age: child.age ?? 0,
          gender: child.gender ?? "-",
          relation: child.relation ?? "-",
          description: child.description ?? "",
        })),
        rideDistance: ride.rideDistance ?? 0,
        rideBaseTotal: ride.rideBaseTotal ?? 0,
        estimatedFare: ride.estimatedFare ?? 0,
        actualFare: ride.actualFare ?? 0,
        rideDate: ride.rideDate ?? "",
        startTime: ride.startTime ?? "",
        endTime: ride.endTime ?? "",
        rideDuration: ride.rideDuration ?? 0,
        additionalDuration: ride.additionalDuration ?? 0,
        vehicleType: ride.vehicleType ?? "-",
        rideSecurity: ride.rideSecurity ?? "-",
        specialRequest: ride.specialRequest ?? "",
        isChildCarSeat: ride.isChildCarSeat ?? false,
        createdAt: ride.createdAt ?? "",
        updatedAt: ride.updatedAt ?? "",
        driverId: ride.driverId ?? null,
        passenger: passengerData
          ? {
            id: passengerData._id ?? "",
            fullName: passengerData.fullName ?? "-",
            email: passengerData.email ?? "-",
            phoneNumber: passengerData.phoneNumber ?? "-",
            accountStatus: passengerData.accountStatus ?? "unknown",
            gender: passengerData.gender ?? "-",
            genderDescription: passengerData.genderDescription ?? "",
            profileImageUrl: passengerData.profileImageUrl ?? null,
            allowNotifications: passengerData.allowNotifications ?? false,
            deviceInfo: passengerData.session?.deviceInfo ?? "-",
            createdAt: passengerData.createdAt ?? "",
            updatedAt: passengerData.updatedAt ?? "",
          }
          : null,
        rideHistory: ride.rideHistory?.feedback
          ? {
              feedback: {
                rating:
                  ride.rideHistory.feedback?.rating ??
                  ride.rideHistory.feedback?.[" rating"] ??
                  0,
                description: ride.rideHistory.feedback?.description ?? "",
                images: ride.rideHistory.feedback?.images ?? [],
              },
            }
          : undefined,
      },
    };  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};
