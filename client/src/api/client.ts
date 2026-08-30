import useAuthStore from "@/features/auth/store/useAuthStore";
import type { RefreshResponse } from "@/features/auth";
import axios, { type AxiosRequestConfig } from "axios";
import { refresh } from "@/features/auth";

export const BASE_URL = import.meta.env.VITE_BASE_API_URL;

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 5000, // 5 seconds
});

client.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  null,
  { synchronous: true },
);

type RetryableRequest = {
  _retry?: boolean;
} & AxiosRequestConfig;

let refreshPromise: Promise<RefreshResponse> | null = null;

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (
      error.response?.status !== 401 ||
      error.config._retry ||
      error.config.url?.includes("/refresh")
    )
      return Promise.reject(error);

    const originalRequest: RetryableRequest = error.config;

    originalRequest._retry = true;

    try {
      if (refreshPromise === null) {
        refreshPromise = refresh().then((data) => {
          useAuthStore.getState().setAuth(data.user, data.accessToken);
          return data;
        });
      }

      const { accessToken } = await refreshPromise;
      originalRequest.headers!.Authorization = `Bearer ${accessToken}`;

      return client(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().clearAuth();
      return Promise.reject(refreshError);
    } finally {
      refreshPromise = null;
    }
  },
);

export default client;
