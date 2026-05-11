import axios, { AxiosError } from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string; message?: string }>;
    return (
      axiosError.response?.data?.error ||
      axiosError.response?.data?.message ||
      axiosError.message ||
      fallback
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
