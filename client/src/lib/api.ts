import axios from "axios";
import type { ApiResponse } from "@/types/transit";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export const TOKEN_STORAGE_KEY = "transitops.token";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function getApiData<T>(path: string) {
  const response = await apiClient.get<ApiResponse<T>>(path);

  return response.data.data;
}

export async function postApiData<T, D>(path: string, payload: D) {
  const response = await apiClient.post<ApiResponse<T>>(path, payload);

  return response.data.data;
}
