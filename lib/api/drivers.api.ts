import axios from "axios";
import { API } from "./axios";

export type DriverStatus = "pending" | "approved" | "rejected" | "suspended";
export type DriverSecurityType = "armed" | "unarmed";

export interface Driver {
  id: string;
  name: string;
  status: DriverStatus;
  rating: number;
  totalRides: number;
  earnings: number;
  security: DriverSecurityType;
}

export interface DriversPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DriversResponse {
  message: string;
  drivers: Driver[];
  pagination: DriversPagination;
}

export interface GetDriversParams {
  status?: DriverStatus;
  armedType?: DriverSecurityType;
  search?: string;
  rating?: number;
  rideCount?: number;
  page: number;
  limit: number;
}

export interface DriverDocumentSide {
  frontSide: string;
  backSide: string;
}

export interface DriverLicenseDetails extends DriverDocumentSide {
  expiryDate: string;
  licenseNumber: string;
}

export interface VehicleRegistrationDetails {
  registrationNumber: string;
  registrationExpiryDate: string;
  stateOrRegionOfRegistration: string;
  document: DriverDocumentSide | null;
}

export interface VehiclePhotosDetails {
  exteriorImages: string[];
  interiorImages: string[];
}

export interface DriverApplicationDocuments {
  driverLicense: DriverLicenseDetails | null;
  governmentId: DriverDocumentSide | null;
  vehicleRegistration: VehicleRegistrationDetails | null;
  gunLicense: DriverDocumentSide | null;
  vehiclePhotos: VehiclePhotosDetails | null;
}

export interface DriverApplicationReview {
  driverId: string;
  accountStatus: string;
  submittedDate: string | null;
  rejectionReason: string;
  documents: DriverApplicationDocuments;
}

export interface DriverApplicationDetailsResponse {
  message: string;
  review: DriverApplicationReview;
}

export interface DriverActionPayload {
  driverId: string;
}

export interface RejectDriverPayload extends DriverActionPayload {
  rejectionReason: string;
}

export interface DriverActionResponse {
  message: string;
}

const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string } | undefined)?.message ||
      "Failed to load drivers."
    );
  }

  return "Something went wrong. Please try again.";
};

export const getDrivers = async (
  params: GetDriversParams,
): Promise<DriversResponse> => {
  try {
    const response = await API.get<DriversResponse>("/admin/drivers", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

const normalizeSides = (value: unknown): DriverDocumentSide | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const data = value as { frontSide?: unknown; backSide?: unknown };
  return {
    frontSide: typeof data.frontSide === "string" ? data.frontSide : "",
    backSide: typeof data.backSide === "string" ? data.backSide : "",
  };
};

export const getDriverApplicationDetails = async (
  driverId: string,
): Promise<DriverApplicationDetailsResponse> => {
  try {
    const response = await API.get<
      DriverApplicationDetailsResponse & {
        review?: DriverApplicationDetailsResponse["review"] & {
          rejectionReason?: string;
        };
      }
    >(`/admin/drivers/${driverId}`);
    const review = response.data.review;

    return {
      message: response.data.message,
      review: {
        driverId: review?.driverId ?? "",
        accountStatus: review?.accountStatus ?? "unknown",
        submittedDate: review?.submittedDate ?? null,
        rejectionReason: review?.rejectionReason ?? "",
        documents: {
          driverLicense: review?.documents?.driverLicense
            ? {
              frontSide: review.documents.driverLicense.frontSide ?? "",
              backSide: review.documents.driverLicense.backSide ?? "",
              expiryDate: review.documents.driverLicense.expiryDate ?? "",
              licenseNumber: review.documents.driverLicense.licenseNumber ?? "",
            }
            : null,
          governmentId: normalizeSides(review?.documents?.governmentId),
          vehicleRegistration: review?.documents?.vehicleRegistration
            ? {
              registrationNumber: review.documents.vehicleRegistration.registrationNumber ?? "",
              registrationExpiryDate:
                review.documents.vehicleRegistration.registrationExpiryDate ?? "",
              stateOrRegionOfRegistration:
                review.documents.vehicleRegistration.stateOrRegionOfRegistration ?? "",
              document: normalizeSides(review.documents.vehicleRegistration.document),
            }
            : null,
          gunLicense: normalizeSides(review?.documents?.gunLicense),
          vehiclePhotos: review?.documents?.vehiclePhotos
            ? {
              exteriorImages: Array.isArray(review.documents.vehiclePhotos.exteriorImages)
                ? review.documents.vehiclePhotos.exteriorImages.filter(
                  (value): value is string => typeof value === "string",
                )
                : [],
              interiorImages: Array.isArray(review.documents.vehiclePhotos.interiorImages)
                ? review.documents.vehiclePhotos.interiorImages.filter(
                  (value): value is string => typeof value === "string",
                )
                : [],
            }
            : null,
        },
      },
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const approveDriver = async (
  payload: DriverActionPayload,
): Promise<DriverActionResponse> => {
  try {
    const response = await API.post<DriverActionResponse>("/admin/approve-driver", payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const rejectDriver = async (
  payload: RejectDriverPayload,
): Promise<DriverActionResponse> => {
  try {
    const response = await API.post<DriverActionResponse>("/admin/reject-driver", payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};
