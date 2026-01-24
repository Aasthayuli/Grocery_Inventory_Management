/**
 * Barcode Services
 * Handles barcode generation, scanning, and validation
 */

import api, { getErrorMessage } from "./api";

/**
 * Search product by barcode
 * @param {String} barcodeNumber - Barcode Number
 * @returns {Promise} - Product Details
 */
export const searchByBarcode = async (barcodeNumber) => {
  try {
    const response = await api.get(`/api/barcode/search/${barcodeNumber}`);
    if (!response) {
      throw new Error("No response received from server");
    }
    if (!response.data.success) {
      throw new Error(response.data?.message || "Search via barcode failed");
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get barcode image URL for a product
 * @param {number} productId
 * @returns {Promise} barcode image URL
 */
export const getBarcodeImageUrl = async (productId) => {
  try {
    const response = await api.get(`/api/barcode/image/${productId}`);
    if (!response) {
      throw new Error("No response received from server");
    }
    if (!response.data.success) {
      throw new Error(
        response.data?.message || "Failed to get barcode Image URL",
      );
    }

    return response.data.data.barcode_url;
  } catch (error) {
    throw error;
  }
};

/**
 * Format Barcode for Display
 * @param {String} barcode - raw Barcode
 * @returns {String} - formatted barcode (e.g., 1234-5678-9012)
 */
export const formatBarcode = (barcode) => {
  if (!barcode) return "";

  const cleaned = barcode.replace(/\D/g, ""); // Remove non-digits

  if (cleaned.length === 12) {
    //format as XXXX-XXXX-XXXX
    return cleaned.replace(/(\d{1})(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");
  } else if (cleaned.length === 13) {
    //format as XXXX-XXXX-XXXX
    return cleaned.replace(/(\d{1})(\d{4})(\d{4})(\d{4})/, "$1-$2-$3-$4");
  }

  return barcode; // return as it isif unexpected length
};

export default {
  searchByBarcode,
  getBarcodeImageUrl,
  formatBarcode,
};
