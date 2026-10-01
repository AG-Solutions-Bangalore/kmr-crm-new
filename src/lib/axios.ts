import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

const TOKEN_KEY = "kmr-crm-token";

export function getAuthToken(): string | null {
  try {
    return (
      localStorage.getItem(TOKEN_KEY) ??
      localStorage.getItem("access_token") ??
      localStorage.getItem("token")
    );
  } catch {
    return null;
  }
}

export function setAuthToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // storage unavailable (SSR / private mode) — ignore
  }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
  } catch {
    // ignore
  }
}

export const API_BASE_URL = "https://kmrlive.in/crmapi/public/api";

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: {
    // NOTE: no default Content-Type on purpose — axios sets
    // `multipart/form-data` (with boundary) for FormData bodies and
    // `application/json` for plain objects automatically.
    Accept: "application/json",
  },
});

/**
 * The KMR backend returns HTTP 200 even for business failures and puts the
 * real status in `body.code` (200/201 = success). This guard throws a plain
 * Error with the server message for any non-success code.
 */
export function throwIfApiError<T extends { code?: number; message?: string }>(
  body: T,
  fallbackMessage = "Something went wrong. Please try again.",
): asserts body is T {
  if (body.code !== undefined && body.code !== 200 && body.code !== 201) {
    throw new Error(body.message || fallbackMessage);
  }
}

/** Extracts a human-readable message from any axios / API error. */
export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = "Something went wrong. Please try again.",
): string {
  if (error instanceof Error && error.message) return error.message;
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; code?: number }
      | undefined;
    if (data?.message) return data.message;
    if (error.message) return error.message;
  }
  return fallbackMessage;
}

/** Builds a FormData body from a flat record (skips undefined / null). */
export function toFormData(values: Record<string, unknown>): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null) continue;
    form.append(key, String(value));
  }
  return form;
}

// Attach auth token to every request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Global response / error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;

    // Unauthorized — token expired/invalid: clear it and go to login.
    // Guard `window` so this never breaks SSR / tests.
    if (status === 401 && typeof window !== "undefined") {
      clearAuthToken();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
