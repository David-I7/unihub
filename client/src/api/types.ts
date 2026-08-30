import axios from "axios";

export interface ApiError {
  type: string;
  title: string;
  status: number;
  instance: string;
  detail?: string;
  errors?: ConstraintValidation[];
}

export interface ConstraintValidation {
  type: "FIELD" | "OBJECT";
  objectName: string;
  field?: string;
  message: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PaginatedRequest {
  page: number;
  size: number;
  sort?: string;
}

export function getPaginatedNextPageParam<T>(
  lastPage: PaginatedResponse<T>,
): number | undefined {
  return lastPage.last ? undefined : lastPage.number + 1;
}

export function getPaginatedPrevPageParam<T>(
  firstPage: PaginatedResponse<T>,
): number | undefined {
  return firstPage.first ? undefined : firstPage.number - 1;
}

export function getErrorMessage(
  err: unknown,
  fallback = "An unexpected error occurred.",
): string {
  if (axios.isAxiosError(err)) {
    if (err.response) {
      // Your server responded with an HTTP error
      const data = err.response.data as ApiError;
      return data.detail || data.title || fallback;
    } else if (err.request) {
      return "Failed to connect to the server. Please check your internet connection.";
    } else {
      // Axios failed before making the request
      return "An unexpected error occurred while making the request.";
    }
  }
  // non-Axios error (throw inside a .then() or .catch() callback, etc.)
  if (err instanceof Error) {
    return err.message || fallback;
  }

  return fallback;
}

export function getFormErrors(
  err: unknown,
  fallback = "An unexpected error occurred.",
) {
  if (axios.isAxiosError(err)) {
    if (err.response) {
      const apiError: ApiError = err.response!.data;

      if (!apiError.errors) {
        return { server: apiError.detail || apiError.title };
      } else {
        return { validation: apiError.errors };
      }
    } else if (err.request) {
      return {
        server:
          "Failed to connect to the server. Please check your internet connection.",
      };
    }

    return {
      server: "An unexpected error occurred while making the request.",
    };
  }

  if (err instanceof Error) {
    return { server: err.message || fallback };
  }
  return { server: fallback };
}
