import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { deleteProduct, getAllProducts } from "../services/productService";
import { getCategories, getSuppliers } from "../services/productService";
import { isAdmin } from "../services/authService";
import { formatBarcode } from "../services/barcodeService";

export const ManageProducts = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const userIsAdmin = isAdmin();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [msg, setMsg] = useState({
    message: "",
    color: "white",
  });

  // Pagination
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total: 0,
    per_page: 10,
    has_prev: false,
    has_next: false,
  });

  // Filters
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category_id: searchParams.get("category_id") || "",
    supplier_id: searchParams.get("supplier_id") || "",
    low_stock: searchParams.get("low_stock") || "",
    expiring: searchParams.get("expiring") || "",
    page: parseInt(searchParams.get("page")) || 1,
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
  }, [
    filters.page,
    filters.search,
    filters.category_id,
    filters.supplier_id,
    filters.low_stock,
    filters.expiring,
  ]);

  const fetchCategories = async () => {
    try {
      const catResponse = await getCategories();
      setCategories(catResponse.data || []);
    } catch (error) {}
  };

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      const supResponse = await getSuppliers();
      setSuppliers(supResponse.data.suppliers || []);
    } catch (error) {}
  };

  const updateURLParams = (newFilters) => {
    const params = {};
    Object.keys(newFilters).forEach((key) => {
      if (newFilters[key]) params[key] = newFilters[key];
    });
    setSearchParams(params);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: filters.page,
        per_page: 10,
      };

      if (filters.search) params.search = filters.search;
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.supplier_id) params.supplier_id = filters.supplier_id;
      if (filters.low_stock) params.low_stock = "true";
      if (filters.expiring) params.expiring = "true";

      const response = await getAllProducts(params);
      setProducts(response.data.products);
      setPagination({
        current_page: response.data.pagination.current_page,
        total_pages: response.data.pagination.pages,
        total: response.data.pagination.total,
        per_page: response.data.pagination.per_page,
        has_prev: response.data.pagination.has_prev,
        has_next: response.data.pagination.has_next,
      });
    } catch (error) {
      setLoading(false);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    setFilters({ ...filters, page: 1 });
    updateURLParams(filters);
    fetchProducts();
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: "",
      category_id: "",
      supplier_id: "",
      low_stock: "",
      expiring: "",
      page: 1,
    };
    setFilters(clearedFilters);
    updateURLParams(clearedFilters);
  };

  const handleDelete = async (productId, productName) => {
    if (
      !window.confirm(`Delete "${productName}"? This action cannot be undone.`)
    ) {
      return;
    }
    try {
      await deleteProduct(productId);
      setMsg({ message: "Product deleted Successfully!", color: "green" });
      setShowModal(true);
      fetchProducts();
    } catch (error) {
      setMsg({ message: "Failed to delete product!", color: "red" });
      setShowModal(true);
    }
  };

  const getExpiryStatus = (product) => {
    if (!product.expiry_date) return null;
    const daysToExpiry = product.days_left_to_expire;

    if (product.is_expired) {
      return { text: "Expired", color: "bg-red-100 text-red-800" };
    } else if (daysToExpiry <= 3) {
      return {
        text: `${daysToExpiry}d left`,
        color: "bg-red-100 text-red-800",
      };
    } else if (daysToExpiry <= 7) {
      return {
        text: `${daysToExpiry}d left`,
        color: "bg-orange-100 text-orange-800",
      };
    } else if (daysToExpiry <= 30) {
      return {
        text: `${daysToExpiry}d left`,
        color: "bg-yellow-100 text-yellow-800",
      };
    }
    return null;
  };

  const getModalClasses = () => {
    switch (msg.color) {
      case "green":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-700",
        };
      case "red":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-700",
        };
      case "yellow":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-700",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-700",
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 p-4 sm:p-6 lg:px-14 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Products
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage your inventory
            </p>
          </div>
          <button
            onClick={() => navigate("/products/add")}
            className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Success Message */}
        {showModal && (
          <div
            className={`mb-4 sm:mb-6 p-3 sm:p-4 ${getModalClasses().bg} border ${getModalClasses().border} rounded-lg flex justify-between items-center`}
          >
            <p className={`text-sm ${getModalClasses().text} font-medium`}>
              {msg.message}
            </p>
            <button
              onClick={() => setShowModal(false)}
              className={`cursor-pointer text-sm ${getModalClasses().text} font-medium`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or SKU..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="cursor-pointer bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2 text-sm sm:text-base"
              >
                <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Filters</span>
              </button>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="cursor-pointer bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-700 transition text-sm sm:text-base"
              >
                Search
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Categories Filter */}
              <select
                value={filters.category_id}
                onChange={(e) =>
                  setFilters({ ...filters, category_id: e.target.value })
                }
                className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Suppliers Filter */}
              <select
                value={filters.supplier_id}
                onChange={(e) =>
                  setFilters({ ...filters, supplier_id: e.target.value })
                }
                className="px-3 sm:px-4 py-2 text-sm sm:text-base border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Suppliers</option>
                {suppliers.map((supp) => (
                  <option key={supp.id} value={supp.id}>
                    {supp.name}
                  </option>
                ))}
              </select>

              {/* Low Stock Filter */}
              <label className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-sm sm:text-base border bg-white border-gray-300 rounded-lg">
                <input
                  type="checkbox"
                  checked={filters.low_stock === "true"}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      low_stock: e.target.checked ? "true" : "",
                    })
                  }
                  className="rounded text-green-600"
                />
                <span>Low Stock Only</span>
              </label>

              {/* Expiring Soon Filter */}
              <label className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-sm sm:text-base border bg-white border-gray-300 rounded-lg">
                <input
                  type="checkbox"
                  checked={filters.expiring === "true"}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      expiring: e.target.checked ? "true" : "",
                    })
                  }
                  className="rounded text-green-600"
                />
                <span>Expiring Soon</span>
              </label>

              {/* Clear Filters Button */}
              <button
                onClick={handleClearFilters}
                className="cursor-pointer sm:col-span-2 lg:col-span-4 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <X className="h-4 w-4" />
                <span>Clear Filters</span>
              </button>
            </div>
          )}
        </div>

        {/* Products Table/Card */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-8 sm:p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-sm sm:text-base">
              Loading products...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-12 text-center">
            <p className="text-gray-600 text-base sm:text-lg">
              No products found
            </p>
            <button
              onClick={() => navigate("/products/add")}
              className="cursor-pointer mt-4 bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-700 text-sm sm:text-base"
            >
              Add First Product
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Product
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        SKU
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Category
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Price
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Stock
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Expiry
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => {
                      const expiryStatus = getExpiryStatus(product);
                      return (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-4 sm:px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-800 text-sm sm:text-base">
                                {product.name}
                              </p>
                              {product.barcode && (
                                <p className="text-xs text-gray-500 font-mono">
                                  {formatBarcode(product.barcode)}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 font-mono">
                            {product.sku}
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">
                            {product.category?.name || "-"}
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-800">
                            ₹{parseFloat(product.price).toFixed(2)}
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.is_low_stock ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                            >
                              {product.quantity}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            {expiryStatus ? (
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${expiryStatus.color}`}
                              >
                                {expiryStatus.text}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  navigate(`/products/${product.id}`)
                                }
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  navigate(`/products/edit/${product.id}`)
                                }
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              {userIsAdmin && (
                                <button
                                  onClick={() =>
                                    handleDelete(product.id, product.name)
                                  }
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {products.map((product) => {
                const expiryStatus = getExpiryStatus(product);
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl shadow-md p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-800 text-base">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          SKU: {product.sku}
                        </p>
                        {product.barcode && (
                          <p className="text-xs text-gray-500 font-mono mt-1">
                            Barcode: {formatBarcode(product.barcode)}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/products/${product.id}`)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/products/edit/${product.id}`)
                          }
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {userIsAdmin && (
                          <button
                            onClick={() =>
                              handleDelete(product.id, product.name)
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Category</p>
                        <p className="font-medium">
                          {product.category?.name || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Price</p>
                        <p className="font-medium">
                          ₹{parseFloat(product.price).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Stock</p>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.is_low_stock ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                        >
                          {product.quantity}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Expiry</p>
                        {expiryStatus ? (
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${expiryStatus.color}`}
                          >
                            {expiryStatus.text}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-gray-600">
                Showing {products.length} of {pagination.total} products
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page - 1 })
                  }
                  disabled={!pagination.has_prev}
                  className="cursor-pointer px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 text-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
                <span className="px-3 sm:px-4 py-2 bg-gray-100 rounded-lg text-sm">
                  Page {pagination.current_page} of {pagination.total_pages}
                </span>
                <button
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page + 1 })
                  }
                  disabled={!pagination.has_next}
                  className="cursor-pointer px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 text-sm"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageProducts;
