/**
 * Add/Edit Product Page
 * Create new product or update existing product
 */

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X, ArrowLeft, Save, Barcode as BarcodeIcon } from "lucide-react";
import {
  createProduct,
  updateProduct,
  getProduct,
  getCategories,
  getSuppliers,
} from "../services/productService";

export const AddProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [msg, setMsg] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    quantity: "",
    category_id: "",
    supplier_id: "",
    expiry_date: "",
    barcode: "",
  });

  useEffect(() => {
    fetchCategories();
    fetchSuppliers();

    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoadingData(true);
      const response = await getProduct(id);
      const product = response.data;

      setFormData({
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity: product.quantity,
        category_id: product.category_id || "",
        supplier_id: product.supplier_id || "",
        expiry_date: product.expiry_date || "",
        barcode: product.barcode || "",
      });

      setLoadingData(false);
    } catch (err) {
      setError("Failed to load product data");
      setLoadingData(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data || []);
    } catch (error) {
      setError("Failed to fetch categories");
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await getSuppliers();
      setSuppliers(response.data.suppliers || []);
    } catch (error) {
      setError("Failed to fetch suppliers");
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!formData.category_id) {
      setError("Please select a category");
      setLoading(false);
      return;
    }

    if (!formData.supplier_id) {
      setError("Please select a supplier");
      setLoading(false);
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      setError("Price must be greater than 0");
      setLoading(false);
      return;
    }

    if (parseInt(formData.quantity) < 0) {
      setError("Quantity cannot be negative");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        category_id: parseInt(formData.category_id),
        supplier_id: parseInt(formData.supplier_id),
      };

      if (formData.expiry_date) {
        payload.expiry_date = formData.expiry_date;
      }

      if (formData.barcode) {
        payload.barcode = formData.barcode;
      }

      if (isEditMode) {
        await updateProduct(id, payload);
        setMsg("Product Updated Successfully!");
        setShowModal(true);
      } else {
        await createProduct(payload);
        setMsg("Product created successfully!");
        setShowModal(true);
      }

      setTimeout(() => {
        setShowModal(false);
      }, 7000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save product. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/products")}
            className="cursor-pointer flex items-center text-gray-600 hover:text-gray-800 mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Back to Products
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            {isEditMode
              ? "Update product information"
              : "Fill in the details to add a new product"}
          </p>
        </div>

        {/* Success Message */}
        {showModal && (
          <div className="mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
            <p className="text-sm text-green-700 font-medium">{msg}</p>
            <button
              onClick={() => setShowModal(false)}
              className="text-sm text-green-700 font-medium"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 md:p-8">
          {error && (
            <div className="mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                placeholder="e.g., Amul Milk 1L"
              />
            </div>

            {/* SKU and Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  SKU <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="MLK-001"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Stock Keeping Unit (unique identifier)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="60.00"
                />
              </div>
            </div>

            {/* Category and Supplier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Supplier <span className="text-red-500">*</span>
                </label>
                <select
                  name="supplier_id"
                  value={formData.supplier_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quantity and Expiry Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Initial Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Barcode */}
            {!isEditMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Barcode (Optional)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleInputChange}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Auto-generated or enter manually"
                  />
                </div>
              </div>
            )}
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer bg-green-600 text-white py-2 sm:py-3 rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                {loading ? (
                  <span>Saving...</span>
                ) : (
                  <div className="flex gap-1 px-2">
                    <Save className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>
                      {isEditMode ? "Update Product" : "Save Product"}
                    </span>
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="cursor-pointer px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
