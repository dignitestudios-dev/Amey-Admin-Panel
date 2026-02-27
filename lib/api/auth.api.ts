import axios from "axios";
import { API, RESET_EMAIL_KEY, RESET_TOKEN_KEY } from "./axios";

export { RESET_EMAIL_KEY, RESET_TOKEN_KEY };

export interface LoginPayload {
  email: string;
  password: string;
}

interface LoginData {
  token: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginData;
}

interface BaseApiResponse<TData = null> {
  success: boolean;
  message: string;
  data: TData;
}

interface VerifyResetOtpData {
  token?: string;
  resetToken?: string;
  accessToken?: string;
}

export interface SendResetOtpPayload {
  email: string;
}

export interface VerifyResetOtpPayload {
  email: string;
  otpCode: string;
}

export interface ResetPasswordPayload {
  newPassword: string;
  resetToken: string;
}

const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string } | undefined)?.message ||
      "Unable to login. Please verify credentials and try again."
    );
  }

  return "Something went wrong. Please try again.";
};

export const loginAdmin = async (
  credentials: LoginPayload,
): Promise<LoginResponse> => {
  try {
    const response = await API.post<LoginResponse>("/admin/login", credentials);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const sendResetOtp = async (
  payload: SendResetOtpPayload,
): Promise<BaseApiResponse> => {
  try {
    const response = await API.post<BaseApiResponse>("/admin/send-reset-otp", payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const verifyResetOtp = async (
  payload: VerifyResetOtpPayload,
): Promise<{ message: string; token: string }> => {
  try {
    const response = await API.post<BaseApiResponse<VerifyResetOtpData>>(
      "/admin/verify-reset-otp",
      payload,
    );

    const token =
      response.data?.data?.token ||
      response.data?.data?.resetToken ||
      response.data?.data?.accessToken;

    if (!token) {
      throw new Error("Reset token was not returned by server.");
    }

    return {
      message: response.data.message,
      token,
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const resetPassword = async (
  payload: ResetPasswordPayload,
): Promise<BaseApiResponse> => {
  try {
    const response = await API.post<BaseApiResponse>(
      "/admin/reset-password",
      { newPassword: payload.newPassword },
      {
        headers: {
          Authorization: `Bearer ${payload.resetToken}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};