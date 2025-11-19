import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { toast } from "sonner";

/**
 * Standard API request configuration
 */
export interface ApiRequestConfig extends Omit<AxiosRequestConfig, "data"> {
  data?: unknown;
}

/**
 * Standard API success response type
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message?: string;
  data: T;
}

/**
 * Standard API error response type
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    stack?: string;
  };
}

/**
 * Union type for API responses
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Custom API error class
 */
export class ApiError extends Error {
  statusCode?: number;
  stack?: string;
  originalError?: unknown;

  constructor(
    message: string,
    statusCode?: number,
    stack?: string,
    originalError?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.stack = stack;
    this.originalError = originalError;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Handles API errors and converts them to a standardized format
 */
export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const response = axiosError.response;

    if (response) {
      // Server responded with an error status
      const errorData = response.data;

      // Check if response matches our error format: { success: false, error: { message, stack } }
      if (
        errorData &&
        typeof errorData === "object" &&
        "success" in errorData &&
        errorData.success === false &&
        "error" in errorData &&
        errorData.error &&
        typeof errorData.error === "object" &&
        "message" in errorData.error
      ) {
        return new ApiError(
          errorData.error.message,
          response.status,
          errorData.error.stack,
          error
        );
      }

      // Fallback for other error formats
      return new ApiError(
        (errorData as { message?: string })?.message ||
          response.statusText ||
          "An error occurred",
        response.status,
        undefined,
        error
      );
    } else if (axiosError.request) {
      // Request was made but no response received
      return new ApiError(
        "Network error: No response from server",
        undefined,
        undefined,
        error
      );
    }
  }

  // Handle non-axios errors
  if (error instanceof Error) {
    return new ApiError(error.message, undefined, error.stack, error);
  }

  // Unknown error type
  return new ApiError(
    "An unexpected error occurred",
    undefined,
    undefined,
    error
  );
};

/**
 * Standard API call utility
 * Provides consistent error handling and response formatting
 */
export const makeRequest = async <T = unknown>(
  method: "get" | "post" | "put" | "patch" | "delete",
  url: string,
  config?: ApiRequestConfig
): Promise<T> => {
  try {
    const { data, ...axiosConfig } = config || {};

    let response: AxiosResponse<ApiResponse<T> | T>;

    switch (method) {
      case "get":
        response = await axios.get<T>(url, axiosConfig);
        break;
      case "post":
        response = await axios.post<T>(url, data, axiosConfig);
        break;
      case "put":
        response = await axios.put<T>(url, data, axiosConfig);
        break;
      case "patch":
        response = await axios.patch<T>(url, data, axiosConfig);
        break;
      case "delete":
        response = await axios.delete<T>(url, axiosConfig);
        break;
      default:
        // throw new Error(`Unsupported HTTP method: ${method}`);
        return null as T;
    }

    // Handle wrapped response format: { success: true, message, data }
    if (
      response.data &&
      typeof response.data === "object" &&
      "success" in response.data &&
      response.data.success === true &&
      "data" in response.data
    ) {
      return (response.data as ApiSuccessResponse<T>).data;
    }

    // Return data directly if not wrapped
    return response.data as T;
  } catch (error) {
    const apiError = handleApiError(error);
    // console.error("API Error:", {
    //   message: apiError.message,
    //   statusCode: apiError.statusCode,
    //   stack: apiError.stack,
    // });
    toast.error(apiError.message);
    // throw apiError;
    return null as T;
  }
};

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: <T = unknown>(url: string, config?: ApiRequestConfig) =>
    makeRequest<T>("get", url, config),
  post: <T = unknown>(url: string, data?: unknown, config?: ApiRequestConfig) =>
    makeRequest<T>("post", url, { ...config, data }),
  put: <T = unknown>(url: string, data?: unknown, config?: ApiRequestConfig) =>
    makeRequest<T>("put", url, { ...config, data }),
  patch: <T = unknown>(
    url: string,
    data?: unknown,
    config?: ApiRequestConfig
  ) => makeRequest<T>("patch", url, { ...config, data }),
  delete: <T = unknown>(url: string, config?: ApiRequestConfig) =>
    makeRequest<T>("delete", url, config),
};
