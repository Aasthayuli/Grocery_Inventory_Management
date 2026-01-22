import { useEffect, useState } from "react";
import { getTransactionStats } from "../services/transactionService";

const TransactionHistory = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    total_transactions: 0,
    stock_in: { count: 0, quantity: 0 },
    stock_out: { count: 0, quantity: 0 },
  });

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getTransactionStats({
        from_date: fromDate,
        to_date: toDate,
      });

      setStats(response.data);
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-200 px-4 py-6 sm:px-6 lg:px-16">
      <h1 className="text-xl sm:text-2xl font-semibold mb-6">
        📊 Transaction Report
      </h1>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
          <input
            type="date"
            className="flex-1 border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <input
            type="date"
            className="flex-1 border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <button
          onClick={fetchStats}
          className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-5 py-2 rounded-lg transition flex items-center justify-center text-sm sm:text-base whitespace-nowrap"
        >
          Generate Report
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
          <p className="ml-3 text-gray-600">Loading report...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <ReportCard
              title="Total Transactions"
              value={stats.total_transactions}
              color="text-blue-600"
            />
            <ReportCard
              title="Stock In"
              value={`${stats.stock_in.count} (Qty: ${stats.stock_in.quantity})`}
              color="text-green-600"
            />
            <ReportCard
              title="Stock Out"
              value={`${stats.stock_out.count} (Qty: ${stats.stock_out.quantity})`}
              color="text-red-600"
            />
          </div>
        </>
      )}
    </div>
  );
};

const ReportCard = ({ title, value, color }) => (
  <div className="bg-white border border-gray-300 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition duration-200">
    <p className="text-gray-500 text-xs sm:text-sm mb-1 font-medium">{title}</p>
    <h2 className={`text-xl sm:text-2xl font-bold ${color}`}>{value}</h2>
  </div>
);

export default TransactionHistory;
