/**
 * Transaction Service
 * Handles Stock IN/OUT operations and transaction history
 */

import api from "./api";

/**
 * Stock IN - Add Stock (Purchases)
 * @param {Object} data - Stock IN data
 * @param {number} data.product_id - Product ID
 * @param {number} data.quantity - Quantity added
 * @param {String} data.notes - Notes (optional)
 * @returns {Promise} - Transaction and Updated Products
 */
export const stockIn = async (data) => {
  try {
    const response = await api.post("/api/transactions/stock-in", data);
    if (!response) {
      throw new Error("No response received from server");
    }
    if (!response.data.success) {
      throw new Error(response.data?.message || "Failed to Stock in");
    }

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Stock OUT - Remove Stock (Sale)
 * @param {Object} data - Stock Out data
 * @param {number} data.product_id - Product ID
 * @param {number} data.quantity - Quantity sold/removed
 * @param {String} data.notes - Notes (Optional)
 * @returns {Promise} - Transaction and Updated Product
 */
export const stockOut = async (data) => {
  try {
    const response = await api.post("/api/transactions/stock-out", data);
    if (!response) {
      throw new Error("No response received from server");
    }
    if (!response.data.success) {
      throw new Error(response.data?.message || "Failed to Stock Out");
    }

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Get Transaction statistics
 * @param {Object} params - Date Range
 * @param {string} params.from_date - start_date (YYYY-MM-DD)
 * @param {string} params.to_date - End Date (YYYY-MM-DD)
 * @returns {Promise} - statistics
 */
export const getTransactionStats = async (params = {}) => {
  try {
    const response = await api.get("/api/transactions/stats", { params });
    if (!response) {
      throw new Error("No response received from server");
    }
    if (!response.data.success) {
      throw new Error(
        response.data?.message || "Failed to get Transaction Statistics",
      );
    }

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Validate Stock OUT quantity
 * @param {number} requestedQTY - requested Quantity
 * @param {number} availableQty - available Quantity
 * @returns {Object} -Validation result {isValid, error}
 */
export const validateStockOut = (requestedQTY, availableQty) => {
  if (!requestedQTY || requestedQTY < 0) {
    return { isValid: false, error: "Quantity must be greater than 0." };
  }

  if (requestedQTY > availableQty) {
    return {
      isValid: false,
      error: `Insufficient Stock. Available: ${availableQty}, Requested: ${requestedQTY}`,
    };
  }

  return { isValid: true, error: null };
};

// export all functions
export default {
  stockIn,
  stockOut,

  getTransactionStats,
  validateStockOut,
};
