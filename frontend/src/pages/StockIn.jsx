/**
 * Stock IN Page
 * Add stock to inventory (Purchase from supplier)
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Search, Plus, ArrowLeft, Package } from "lucide-react";
import { getAllProducts } from "../services/productService";
import { stockIn } from "../services/transactionService";
import { searchByBarcode } from "../services/barcodeService";

const StockIn = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    product_id: "",
    quantity: "",
    notes: "",
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [barcodeSearch, setBarcodeSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getAllProducts({ per_page: 1000 });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setFormData({
      ...formData,
      product_id: product.id,
    });
    setError("");
    setSearchTerm("");
  };

  const handleBarcodeSearch = async () => {
    if (!barcodeSearch.trim()) {
      setError("Please enter a barcode");
      return;
    }

    try {
      setSearching(true);
      setError("");
      const response = await searchByBarcode(barcodeSearch.trim());
      const product = response.data;
      handleProductSelect(product);
      setBarcodeSearch("");
      setSearching(false);
    } catch (err) {
      setError("Product not found with barcode: " + barcodeSearch);
      setSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (!formData.product_id) {
      setError("Please select a product");
      setLoading(false);
      return;
    }

    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      setError("Quantity must be greater than 0");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        product_id: parseInt(formData.product_id),
        quantity: parseInt(formData.quantity),
      };

      if (formData.notes.trim()) {
        payload.notes = formData.notes.trim();
      }

      const response = await stockIn(payload);

      setSuccess(
        `Stock added successfully! New stock: ${response.data.product.quantity} units`,
      );

      // Reset form
      setFormData({
        product_id: "",
        quantity: "",
        notes: "",
      });
      setSelectedProduct(null);

      // Refresh products
      fetchProducts();

      setLoading(false);

      // Auto-clear success message after 7 seconds
      setTimeout(() => setSuccess(""), 7000);
    } catch (err) {
      console.error("Stock IN failed:", err);
      setError(err.response?.data?.message || "Failed to add stock");
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-200 px-4 py-6 sm:px-6 lg:px-14">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Back to Dashboard
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-3 bg-green-100 rounded-xl">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                Stock IN
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Add stock to inventory
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 lg:p-8">
          {/* Barcode Section */}
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-sm font-semibold text-green-800 mb-3 flex items-center">
              <Search className="h-4 w-4 mr-2" />
              Quick Search by Barcode
            </h3>
            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
              <input
                type="text"
                value={barcodeSearch}
                onChange={(e) => setBarcodeSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBarcodeSearch()}
                placeholder="Enter barcode..."
                className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={handleBarcodeSearch}
                disabled={searching}
                className="bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 transition text-sm sm:text-base"
              >
                {searching ? "Searching..." : "Search"}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Product <span className="text-red-500">*</span>
              </label>

              {selectedProduct ? (
                <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 mb-3 sm:mb-0">
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">
                      {selectedProduct.name}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      SKU: {selectedProduct.sku} | Current Stock:{" "}
                      {selectedProduct.quantity}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Category: {selectedProduct.category?.name} | Supplier:{" "}
                      {selectedProduct.supplier?.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(null);
                      setFormData({ ...formData, product_id: "" });
                    }}
                    className="text-red-600 hover:text-red-800 font-medium text-sm sm:text-base self-start sm:self-auto"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Search by name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-2 text-sm sm:text-base"
                  />
                  <div className="max-h-48 sm:max-h-60 overflow-y-auto border border-gray-300 rounded-lg">
                    {filteredProducts.length === 0 ? (
                      <p className="p-3 sm:p-4 text-center text-gray-500 text-sm sm:text-base">
                        No products found
                      </p>
                    ) : (
                      filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleProductSelect(product)}
                          className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-200 last:border-b-0 transition"
                        >
                          <p className="font-medium text-gray-800 text-sm sm:text-base">
                            {product.name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            SKU: {product.sku} | Stock: {product.quantity} |
                            Price: ₹{product.price}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity to Add <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                required
                min="1"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Enter quantity"
              />
              {selectedProduct && formData.quantity && (
                <p className="text-xs sm:text-sm text-green-600 mt-2">
                  New stock will be: {selectedProduct.quantity} +{" "}
                  {parseInt(formData.quantity)} ={" "}
                  {selectedProduct.quantity + parseInt(formData.quantity)} units
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                placeholder="e.g., Purchased from Amul, Invoice #12345"
              />
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                {loading ? (
                  <span>Adding Stock...</span>
                ) : (
                  <>
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Add Stock</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="px-4 sm:px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-4 sm:mt-6 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
          <h3 className="font-semibold text-green-800 mb-2 flex items-center text-sm sm:text-base">
            <Package className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Stock IN Information
          </h3>
          <ul className="text-xs sm:text-sm text-green-700 space-y-1">
            <li>
              Stock IN is used when purchasing new inventory from suppliers
            </li>
            <li>The quantity will be added to the current stock</li>
            <li>All transactions are logged for audit purposes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StockIn;
