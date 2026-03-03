import axios from "axios";
import { API } from "./axios";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

export interface NotificationsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetNotificationsParams {
  page: number;
  limit: number;
}

export interface GetNotificationsResponse {
  message: string;
  notifications: NotificationItem[];
  pagination: NotificationsPagination;
}

export interface CreateNotificationPayload {
  title: string;
  message: string;
}

export interface CreateNotificationResponse {
  message: string;
}

interface RawNotificationItem {
  _id?: string;
  title?: string;
  message?: string;
  createdAt?: string;
}

interface RawNotificationsResponse {
  message: string;
  notifications?: RawNotificationItem[];
  pagination?: NotificationsPagination;
  pagintion?: NotificationsPagination;
}

const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string } | undefined)?.message ||
      "Failed to load notifications."
    );
  }

  return "Something went wrong. Please try again.";
};

export const getNotifications = async (
  params: GetNotificationsParams,
): Promise<GetNotificationsResponse> => {
  try {
    const response = await API.get<RawNotificationsResponse>("/admin/notification", {
      params,
    });

    const notifications = (response.data.notifications ?? []).map((item) => ({
      id: item._id ?? "",
      title: item.title ?? "-",
      message: item.message ?? "-",
      createdAt: item.createdAt ?? "",
    }));

    const pagination = response.data.pagination ?? response.data.pagintion ?? {
      page: params.page,
      limit: params.limit,
      total: notifications.length,
      totalPages: 1,
    };

    return {
      message: response.data.message,
      notifications,
      pagination,
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const createNotification = async (
  payload: CreateNotificationPayload,
): Promise<CreateNotificationResponse> => {
  try {
    const response = await API.post<CreateNotificationResponse>("/admin/notification", payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};
