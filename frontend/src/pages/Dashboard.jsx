/**
 * Dashboard Page
 * Main Overview with Statistics and recent Activity
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  TrendingDown,
  AlertCircle,
  DollarSign,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  getAllProducts,
  getExpiringProducts,
  getLowStockProducts,
} from "../services/productService";
import { getTransactionStats } from "../services/transactionService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    expiringSoon: 0,
    totalValue: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState({
    stockIn: 0,
    stockOut: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetching all data in parallel
      const [productRes, expiringRes, lowStockRes, transactionRes] =
        await Promise.all([
          getAllProducts({ per_page: 100 }),
          getExpiringProducts(7),
          getLowStockProducts(10),
          getTransactionStats(),
        ]);

      // Calculate total value
      const products = productRes.data.products || [];
      const totalValue = products.reduce((sum, product) => {
        return sum + parseFloat(product.price) * product.quantity;
      }, 0);

      setStats({
        totalProducts: productRes.data.pagination.total || 0,
        lowStock: lowStockRes.data?.length || 0,
        expiringSoon: expiringRes.data?.length || 0,
        totalValue: totalValue,
      });

      setRecentTransactions({
        stockIn: transactionRes.data?.stock_in?.count || 0,
        stockOut: transactionRes.data?.stock_out?.count || 0,
      });

      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
      link: "/products",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStock,
      icon: TrendingDown,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
      link: "/products?low_stock=true",
    },
    {
      title: "Expiring Soon",
      value: stats.expiringSoon,
      icon: AlertCircle,
      color: "bg-red-500",
      textColor: "text-yellow-500",
      bgColor: "bg-red-50",
      link: "/expiring",
    },
    {
      title: "Inventory Value",
      value: `₹${stats.totalValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 p-4 sm:p-6 lg:px-14 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Overview of your Grocery Inventory System
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                onClick={() => card.link && navigate(card.link)}
                className={`bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition cursor-pointer ${
                  card.link ? "hover:scale-105" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={`p-2 sm:p-3 rounded-lg ${card.bgColor}`}>
                    <Icon
                      className={`h-5 w-5 sm:h-6 sm:w-6 ${card.textColor}`}
                    />
                  </div>
                  {card.link && (
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  )}
                </div>
                <h3 className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
                  {card.title}
                </h3>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Stock IN card */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                Recent Stock IN
              </h2>
              <div className="flex items-center space-x-2 text-green-600">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium text-sm sm:text-base">
                  {recentTransactions.stockIn}
                </span>
              </div>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm mb-4">
              Total stock additions in the last 30 days
            </p>
          </div>

          {/* Stock OUT card */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                Recent Stock OUT
              </h2>
              <div className="flex items-center space-x-2 text-red-600">
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium text-sm sm:text-base">
                  {recentTransactions.stockOut}
                </span>
              </div>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm mb-4">
              Total stock sales in the last 30 days
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <button
              onClick={() => navigate("/products/add")}
              className="bg-green-50 text-green-600 py-2 sm:py-3 rounded-lg hover:bg-green-100 transition font-medium cursor-pointer text-sm sm:text-base"
            >
              + Add Product
            </button>
            <button
              onClick={() => navigate("/stock-in")}
              className="bg-green-50 text-green-600 py-2 sm:py-3 rounded-lg hover:bg-green-100 transition font-medium cursor-pointer text-sm sm:text-base"
            >
              📦 Stock IN
            </button>
            <button
              onClick={() => navigate("/stock-out")}
              className="bg-red-50 text-red-600 py-2 sm:py-3 rounded-lg hover:bg-red-100 transition font-medium cursor-pointer text-sm sm:text-base"
            >
              📤 Stock OUT
            </button>
            <button
              onClick={() => navigate("/transactions")}
              className="bg-yellow-50 text-yellow-600 py-2 sm:py-3 rounded-lg hover:bg-yellow-100 transition font-medium cursor-pointer text-sm sm:text-base"
            >
              📊 Reports
            </button>
          </div>
        </div>

        {/* Alerts Section */}
        {(stats.lowStock > 0 || stats.expiringSoon > 0) && (
          <div className="mt-4 sm:mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-yellow-800 mb-3 sm:mb-4 flex items-center">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Attention Required
            </h2>
            <div className="space-y-1 sm:space-y-2">
              {stats.lowStock > 0 && (
                <p className="text-yellow-700 text-sm sm:text-base">
                  ⚠️ <span className="font-medium">{stats.lowStock}</span>{" "}
                  products have low stock
                </p>
              )}
              {stats.expiringSoon > 0 && (
                <p className="text-yellow-700 text-sm sm:text-base">
                  ⚠️ <span className="font-medium">{stats.expiringSoon}</span>{" "}
                  products expiring within 7 days
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
