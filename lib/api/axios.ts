import axios from "axios";

export const AUTH_TOKEN_KEY = "authToken";
export const RESET_EMAIL_KEY = "resetEmail";
export const RESET_TOKEN_KEY = "resetToken";
export const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://18.144.10.94/api/v1";

export const API = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(RESET_EMAIL_KEY);
      localStorage.removeItem(RESET_TOKEN_KEY);
      if (!window.location.pathname.startsWith("/auth/login")) {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  },
);
