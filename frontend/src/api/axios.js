import axios from "axios";

import { getAuthToken, setAuthToken } from "@/context/auth/authStorage";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

const normalizeApiError = (error) => {
  const response = error?.response;
  const status = response?.status;
  const data = response?.data;

  let message = "Request failed";

  if (typeof data === "string" && data.trim().length > 0) {
    message = data;
  } else if (data && typeof data === "object") {
    if (typeof data.message === "string" && data.message.trim().length > 0) {
      message = data.message;
    } else if (Array.isArray(data.errors) && data.errors.length > 0) {
      message = data.errors
        .map((e) => e?.message || e?.msg || e)
        .filter(Boolean)
        .join("\n");
    }
  }

  if (
    (message === "Request failed" || !message) &&
    typeof error?.message === "string"
  ) {
    message = error.message;
  }

  // Network errors typically have no `response`
  if (!response && (message === "Request failed" || !message)) {
    message = "Network error. Please check your connection and try again.";
  }

  const normalized = new Error(message);
  normalized.name = "ApiError";
  normalized.status = status;
  normalized.data = data;
  normalized.original = error;

  if (Array.isArray(data?.errors)) {
    const fieldErrors = {};
    for (const err of data.errors) {
      const field = err?.path || err?.param || err?.field;
      const fieldMessage = err?.message || err?.msg;
      if (field && fieldMessage && !fieldErrors[field]) {
        fieldErrors[field] = fieldMessage;
      }
    }
    if (Object.keys(fieldErrors).length > 0) {
      normalized.fieldErrors = fieldErrors;
    }
  }

  return normalized;
};

// Request Interceptor (Attach token)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Let the browser set the correct `Content-Type` (with boundary) for multipart requests.
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor (Handle errors globally)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response) {
      // Example: Unauthorized
      if (error.response.status === 401) {
        setAuthToken(null);
      }
    }

    return Promise.reject(normalizeApiError(error));
  },
);

export default axiosInstance;
