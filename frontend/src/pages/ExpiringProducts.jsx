/**
 * Expiring Products Page
 * Shows products expiring soon with color-coded alerts
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Calendar, Package } from "lucide-react";
import {
  getAllProducts,
  getExpiringProducts,
  getExpiredProducts,
} from "../services/productService";
import { formatBarcode } from "../services/barcodeService";

const ExpiringProducts = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("7days");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [activeTab]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      if (activeTab === "expired") {
        const expiredProducts = await getExpiredProducts();
        setProducts(expiredProducts.data);
      } else {
        const days = activeTab === "7days" ? 7 : 30;
        const response = await getExpiringProducts(days);
        setProducts(response.data || []);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const getExpiryColor = (product) => {
    if (product.is_expired) {
      return "bg-red-100 border-red-300 text-red-800";
    }

    const days = product.days_left_to_expire;
    if (days <= 3) {
      return "bg-red-50 border-red-200 text-red-700";
    } else if (days <= 7) {
      return "bg-orange-50 border-orange-200 text-orange-700";
    } else if (days <= 14) {
      return "bg-yellow-50 border-yellow-200 text-yellow-700";
    } else {
      return "bg-green-50 border-green-200 text-green-700";
    }
  };

  const getExpiryText = (product) => {
    if (product.is_expired) {
      return "Expired";
    }
    const days = product.days_left_to_expire;
    return `${days} day${days !== 1 ? "s" : ""} left`;
  };

  const tabs = [
    { id: "7days", label: "7 Days", icon: AlertCircle },
    { id: "30days", label: "30 Days", icon: Calendar },
    { id: "expired", label: "Expired", icon: Package },
  ];

  return (
    <div className="min-h-screen bg-gray-200 p-4 sm:p-6 lg:px-14 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Expiring Products
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Monitor products nearing expiry
          </p>
        </div>

        {/* Tabs - Responsive */}
        <div className="bg-white rounded-xl shadow-md mb-4 sm:mb-6 overflow-x-auto">
          <div className="flex min-w-max sm:min-w-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-30 px-3 sm:px-6 py-3 sm:py-4 font-medium transition flex items-center justify-center space-x-2 text-sm sm:text-base ${
                    activeTab === tab.id
                      ? "border-b-2 border-green-600 text-green-600 bg-green-50"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Products List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-8 sm:p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-sm sm:text-base">
              Loading products...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-12 text-center">
            <div className="text-4xl sm:text-6xl mb-4">🎉</div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              No Products Found
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              {activeTab === "expired"
                ? "No expired products"
                : `No products expiring within ${activeTab === "7days" ? "7" : "30"} days`}
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className={`bg-white rounded-xl shadow-md border-2 overflow-hidden ${getExpiryColor(
                  product,
                )}`}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                          {product.name}
                        </h3>
                        <span
                          className={`px-3 py-1 text-xs sm:text-sm font-semibold rounded-full text-center mt-1 sm:mt-0 w-fit ${
                            product.is_expired
                              ? "bg-red-200 text-red-800"
                              : product.days_left_to_expire <= 3
                                ? "bg-red-200 text-red-800"
                                : product.days_left_to_expire <= 7
                                  ? "bg-orange-200 text-orange-800"
                                  : "bg-yellow-200 text-yellow-800"
                          }`}
                        >
                          {getExpiryText(product)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">SKU</p>
                          <p className="font-mono font-medium text-xs sm:text-sm">
                            {product.sku}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Category</p>
                          <p className="font-medium text-xs sm:text-sm">
                            {product.category?.name || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Stock</p>
                          <p className="font-medium text-xs sm:text-sm">
                            {product.quantity} units
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">
                            Expiry Date
                          </p>
                          <p className="font-medium text-xs sm:text-sm">
                            {new Date(product.expiry_date).toLocaleDateString(
                              "en-IN",
                            )}
                          </p>
                        </div>
                      </div>

                      {product.barcode && (
                        <p className="text-xs text-gray-500 font-mono mt-2">
                          Barcode: {formatBarcode(product.barcode)}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 sm:mt-0 sm:ml-4">
                      <button
                        onClick={() => navigate(`/products/edit/${product.id}`)}
                        className="w-full sm:w-auto bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition text-xs sm:text-sm font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* Warning Message for Expired */}
                  {product.is_expired && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                      <p className="text-xs sm:text-sm text-red-800 font-medium">
                        ⚠️ This product has expired and should be removed from
                        inventory.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {!loading && products.length > 0 && (
          <div className="mt-4 sm:mt-6 bg-white rounded-xl shadow-md p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
              Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  Total Products
                </p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {products.length}
                </p>
              </div>
              <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  Total Stock Value
                </p>
                <p className="text-xl sm:text-2xl font-bold text-orange-600">
                  ₹
                  {products
                    .reduce((sum, p) => sum + p.price * p.quantity, 0)
                    .toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  Action Required
                </p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">
                  {
                    products.filter(
                      (p) => p.is_expired || p.days_left_to_expire <= 3,
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpiringProducts;
