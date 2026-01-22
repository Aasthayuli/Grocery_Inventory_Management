/**
 * Product Service
 * Handles all product-related API Calls
 */

import api, { getErrorMessage } from "./api";

/**
 * Get all products with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.per_page - Items per page
 * @param {number} params.category_id - Filter by Category
 * @param {number} params.supplier_id - Filter by Supplier
 * @param {String} params.search - Search term
 * @param {boolean} params.low_stock - Filter by low stock items
 * @param {boolean} params.expiring - Filter expiring items
 * @returns {Promise} - Products data with pagination
 */
export const getAllProducts = async (params = {}) => {
  try {
    const response = await api.get("/api/products", { params });
    if (!response) {
      throw new Error("No response received from server");
    }
    if (!response.data.success) {
      throw new Error(response.data?.message || "Failed to get all products");
    }

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Get Single Product by ID
 * @param {number} productId - Product ID
 * @returns {Promise} - Product details
 */
export const getProduct = async (productId) => {
  try {
    const response = await api.get(`/api/products/${productId}`);
    if (!response) {
      throw new Error("No response received from server");
    }
    if (!response.data.success) {
      throw new Error(response.data?.message || "Failed to get product by id");
    }

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Create new Product
 * @param {Object} productData - Product Information
 * @param {String} productData.name - product name
 * @param {String} productData.sku - Stock keeping unit
 * @param {number} productData.price - Price
 * @param {number} productData.quantity - Initial Stock quantity
 * @param {number} productData.category_id - Category ID
 * @param {number} productData.supplier_id - Supplier ID
 * @param {String} productData.expiry_date - Expiry date (YYYY-MM-DD) -optional
 * @param {String} productData.barcode - Barcode number -optional
 * @returns {Promise} - Created Product
 */
export const createProduct = async (productData) => {
  try {
    const response = await api.post("/api/products", productData);
    if (!response) {
      throw new Error("No response received from server");
    }
    if (!response.data.success) {
      throw new Error(response.data?.message || "Failed to create product");
    }

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Update Existing Product
 * @param {number} productId - Product ID
 * @param {Object} productData - Updated product Information
 * @returns {Promise} - updated product
 */
export const updateProduct = async (productId, productData) => {
  try {
    const response = await api.put(`/api/products/${productId}`, productData);
    if (!response) {
      throw new Error("No response received from server");
    }
    if (!response.data.success) {
      throw new Error(response.data?.message || "Failed to update product");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Delete product (Admin Only)
 * @param {number} productId - Product ID
 * @returns {Promise} - Deletion Confirmation
 */
export const deleteProduct = async (productId) => {
  try {
    const response = await api.delete(`/api/products/${productId}`);
    if (!response) {
      throw new Error("No response received from server");
    }
    if (!response.data.success) {
      throw new Error(response.data?.message || "Failed to delete product");
    }

    return response.data;
  } catch (error) {
    console.error("Error in deleteProduct: ", getErrorMessage(error));
    throw error;
  }
};

/**
 * Get products expiring within Specified days
 * @param {number} days - Days threshold (default: 7)
 * @returns {Promise} - Expiring products
 */
export const getExpiringProducts = async (days = 7) => {
  try {
    const response = await api.get("/api/products/expiring", {
      params: { days },
    });
    if (!response) {
      throw new Error("No response received from server");
    }
    if (!response.data.success) {
      throw new Error(
        response.data?.message || "Failed to get expiring products",
      );
    }

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Get Expired products
 * @returns {Promise} - Expired Products
 */
export const getExpiredProducts = async () => {
  try {
    const response = await api.get("/api/products/expired");
    if (!response) {
      throw new Error("No response received from server");
    }
    if (!response.data.success) {
      throw new Error(
        response.data?.message || "Failed to get expired product",
      );
    }

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
/**
 * Get products with low stock
 * @param {number} threshold -Stock threshold (default: 10)
 * @returns {Promise} -Low stock products
 */
export const getLowStockProducts = async (threshold = 10) => {
  try {
    const response = await api.get("/api/products/low-stock", {
      params: { threshold },
    });
    if (!response) {
      throw new Error("No response received from server");
    }
    if (!response.data.success) {
      throw new Error(
        response.data?.message || "Failed to get Low stock products",
      );
    }

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Get all categories
 * @returns {Promise} - List of categories
 */
export const getCategories = async () => {
  try {
    const response = await api.get("/api/categories");
    if (!response) {
      throw new Error("No response received from server");
    }
    if (!response.data.success) {
      throw new Error(response.data?.message || "Failed to get all categories");
    }

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createCategory = async (data) => {
  try {
    const response = await api.post("/api/categories", data);
    if (!response) {
      throw new Error("No response received from server");
    }
    if (!response.data.success) {
      throw new Error(response.data?.message || "Failed to create category");
    }

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Delete category
export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/api/categories/${id}`);
    if (!response) {
      throw new Error("No response received from server");
    }
    if (!response.data.success) {
      throw new Error(response.data?.message || "Failed to delete Category");
    }

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Get all Suppliers
 * @returns {Promise} - List of Suppliers
 */
export const getSuppliers = async () => {
  try {
    const response = await api.get("/api/suppliers");
    if (!response) {
      throw new Error("No response received from server");
    }
    if (!response.data.success) {
      throw new Error(response.data?.message || "Failed to get all suppliers");
    }

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
// Create new supplier
export const createSupplier = async (supplier) => {
  try {
    const response = await api.post("/api/suppliers", supplier);
    if (!response) {
      throw new Error("No response received from server");
    }
    if (!response.data.success) {
      throw new Error(response.data?.message || "Failed to create Supplier");
    }

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateSupplier = async (supplierId, supplierData) => {
  try {
    const response = await api.put(
      `/api/suppliers/${supplierId}`,
      supplierData,
    );
    if (!response) {
      throw new Error("No response received from server");
    }
    if (!response.data.success) {
      throw new Error(response.data?.message || "Failed to create Supplier");
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete supplier
export const deleteSupplier = async (id) => {
  try {
    const response = await api.delete(`/api/suppliers/${id}`);
    if (!response) {
      throw new Error("No response received from server");
    }
    if (!response.data.success) {
      throw new Error(response.data?.message || "Failed to delete Supplier");
    }

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
