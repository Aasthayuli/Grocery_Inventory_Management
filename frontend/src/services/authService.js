/**
 * Authentication Services
 * Handles all authentication-related API Calls
 */

import api from "./api";

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || "grocery_auth_token";
const REFRESH_TOKEN_KEY =
  import.meta.env.VITE_REFRESH_TOKEN_KEY || "grocery_refresh_token";
const USER_KEY = "grocery_user";

/**
 * Register New user
 * @param {Object} - UserData - User registration data
 * @param {string} - UserData.username
 * @param {string} - userData.email
 * @param {string} - userData.password
 * @param {string} - userData.role (admin/staff)
 * @returns {Promise} - API response
 */
export const register = async (userData) => {
  try {
    const response = await api.post("/api/auth/register", userData);
    if (!response) {
      throw new Error("No response received from server");
    }
    if (!response.data.success) {
      throw new Error(response.data?.message || "Registration failed");
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Login User
 * @param {Object} credentials - Login Credentials
 * @param {string} credentials.username - Username
 * @param {string} credentials.password - Password
 * @returns {Promise} - API Response with tokens and user data
 */
export const login = async (credentials) => {
  try {
    const response = await api.post("/api/auth/login", credentials);
    if (!response) {
      throw new Error("No response received from server");
    }
    if (!response.data.success) {
      throw new Error(response.data?.message || "Login failed");
    }

    const { user, access_token, refresh_token } = response.data?.data;
    // Store tokens and user data
    localStorage.setItem(TOKEN_KEY, access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Logoutuser
 * @returns {Promise}
 */
export const logout = async () => {
  try {
    //call logout API (optional - JWT is stateless)
    await api.post("/api/auth/logout");
  } catch (error) {
    console.error("Logout Error: ", error.response?.data);
  } finally {
    //clearing localstorage regardless of API call result
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

/**
 * Get current user profile
 * @returns {Promise} - User profile data
 */
export const getProfile = async () => {
  try {
    const response = await api.get("/api/auth/profile");
    if (!response) {
      throw new Error("No response received from server");
    }
    if (!response.data.success) {
      throw new Error(response.data?.message || "Failed to get profile");
    }
    //update stored user data
    const userData = response.data.data;
    localStorage.setItem(USER_KEY, JSON.stringify(userData));

    return userData;
  } catch (error) {
    console.error("failed to fetch profile: ", error);
    throw error;
  }
};

/**
 * Check if user is Authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return !!token;
};

/**
 * Get stored user data
 * @returns {Object | null} - User Object or null
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("grocery_user");

  if (!userStr) {
    return null;
  }

  try {
    const user = JSON.parse(userStr);

    return user;
  } catch (error) {
    return null;
  }
};

/**
 * check if current user is Admin
 * @returns {boolean}
 */
export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.role === "admin";
};

export default {
  register,
  login,
  logout,
  getProfile,
  isAuthenticated,
  getCurrentUser,
};
