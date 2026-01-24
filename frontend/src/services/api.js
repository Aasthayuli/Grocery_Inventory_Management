/**
 * API Service Configuration
 * Axios instance with base URL and interceptors
 */

import axios from "axios";

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || "grocery_auth_token";
const REFRESH_TOKEN_KEY =
  import.meta.env.VITE_REFRESH_TOKEN_KEY || "grocery_refresh_token";
const USER_KEY = "grocery_user";
const API_URL = import.meta.env.VITE_API_URL;

// create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL || "http://localhost:5000",
  timeout: 10000, // 10 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    //get token from LocalStorage
    const token = localStorage.getItem(TOKEN_KEY);

    //Add token to headers if exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

let isRefreshing = false;
let failedQueue = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // If already refreshing, wait in queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            originalRequest.headers.Authorization = `Bearer ${localStorage.getItem(TOKEN_KEY)}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        const response = await axios.post(
          `${API_URL}/api/auth/refresh`,
          {},
          {
            headers: { Authorization: `Bearer ${refreshToken}` },
          },
        );

        if (response.data?.success) {
          const newToken = response.data.data.access_token;
          localStorage.setItem(TOKEN_KEY, newToken);

          // Update all queued requests
          api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

          // Resolve all queued promises
          failedQueue.forEach((promise) => promise.resolve());
          failedQueue = [];

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Reject all queued promises
        failedQueue.forEach((promise) => promise.reject(refreshError));
        failedQueue = [];

        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
/**
 * Helper functions to handle API errors consistently
 * @param {Error} error - Axios error Object
 * @returns {string} - User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (error.response) {
    //server responded with error
    return error.response.data?.message || "An error occurred at server.";
  } else if (error.request) {
    //request made but no response
    return "Network error. Please check your connection.";
  } else {
    //something else happened
    return error.message || "An unexpected Error occurred";
  }
};

/**
 * Helper function to get current user from token
 * Note: Basic Implementation. In production, needed decoding JWT Properly.
 * @returns {object|null}
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("grocery_user");
  return userStr ? JSON.parse(userStr) : null;
};

export default api;
