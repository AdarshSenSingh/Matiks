import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

// API response interface
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Create a base axios instance with default config
const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for HTTP-only cookies
});

// Request interceptor
http.interceptors.request.use(
  (config) => {
    // You can modify the request config here (e.g., add headers)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track refresh attempts to prevent infinite loops
let refreshAttempts = 0;
let refreshLocked = false;
const MAX_REFRESH_ATTEMPTS = 2;
const REFRESH_LOCK_DURATION = 10000; // 10 seconds

// Check if current page is a public page (login, register)
const isPublicPage = () => {
  const publicPaths = ["/login", "/register"];
  return publicPaths.some((path) => window.location.pathname.startsWith(path));
};

// Response interceptor
http.interceptors.response.use(
  (response) => {
    // Reset refresh attempts on successful response
    refreshAttempts = 0;
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized errors (token expired)
    // Skip auth refresh on public pages
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !refreshLocked &&
      !isPublicPage()
    ) {
      // Check if we've exceeded max refresh attempts
      if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
        console.warn(
          "Max refresh attempts reached, locking refresh for 10 seconds"
        );
        refreshLocked = true;

        // Reset after lock duration
        setTimeout(() => {
          refreshLocked = false;
          refreshAttempts = 0;
        }, REFRESH_LOCK_DURATION);

        // Notify about authentication failure
        window.dispatchEvent(new CustomEvent("auth:logout"));
        return Promise.reject(error);
      }

      // Increment refresh attempts
      refreshAttempts++;

      // Only try to refresh once per request
      originalRequest._retry = true;

      try {
        // Check if the failed request was itself a refresh token request
        const isRefreshRequest = originalRequest.url === "/auth/refresh";

        // If the refresh token request itself failed with 401, redirect to login
        if (isRefreshRequest) {
          // Use a custom event to notify the app about authentication failure
          window.dispatchEvent(new CustomEvent("auth:logout"));
          return Promise.reject(error);
        }

        // Try to refresh the token
        await http.post("/auth/refresh");

        // Reset refresh attempts on successful refresh
        refreshAttempts = 0;

        // Retry the original request
        return http(originalRequest);
      } catch (refreshError) {
        // If refresh fails, notify the app about authentication failure
        window.dispatchEvent(new CustomEvent("auth:logout"));
        return Promise.reject(refreshError);
      }
    }

    // Handle other common errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const data = error.response.data as ApiResponse<any>;
      const status = error.response.status;

      // Handle specific status codes
      switch (status) {
        case 400: // Bad Request
          console.error("Bad Request:", data.message || "Invalid request");
          break;
        case 403: // Forbidden
          console.error(
            "Forbidden:",
            data.message || "You do not have permission to access this resource"
          );
          break;
        case 404: // Not Found
          console.error("Not Found:", data.message || "Resource not found");
          break;
        case 500: // Server Error
          console.error(
            "Server Error:",
            data.message || "Internal server error"
          );
          break;
        default:
          console.error(
            `Error ${status}:`,
            data.message || "An error occurred"
          );
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Network Error:", "No response received from server");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Request Error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Wrapper functions for HTTP methods with better typing and error handling
export const get = async <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await http.get<ApiResponse<T>>(url, config);
    if (!response.data.success) {
      throw new Error(response.data.message || "Request failed");
    }
    return response.data.data as T;
  } catch (error) {
    // Rethrow the error after logging
    throw error;
  }
};

export const post = async <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await http.post<ApiResponse<T>>(url, data, config);
    if (!response.data.success) {
      throw new Error(response.data.message || "Request failed");
    }
    return response.data.data as T;
  } catch (error) {
    // Rethrow the error after logging
    throw error;
  }
};

export const put = async <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await http.put<ApiResponse<T>>(url, data, config);
    if (!response.data.success) {
      throw new Error(response.data.message || "Request failed");
    }
    return response.data.data as T;
  } catch (error) {
    // Rethrow the error after logging
    throw error;
  }
};

export const del = async <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await http.delete<ApiResponse<T>>(url, config);
    if (!response.data.success) {
      throw new Error(response.data.message || "Request failed");
    }
    return response.data.data as T;
  } catch (error) {
    // Rethrow the error after logging
    throw error;
  }
};

export default http;
