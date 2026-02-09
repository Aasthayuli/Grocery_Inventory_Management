import { Navigate } from "react-router-dom";
import { isAuthenticated, getCurrentUser } from "../services/authService";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  //check if user is logged in
  const isLoggedIn = isAuthenticated();

  //If not logged in, redirect to login page
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  //If admin access required, check user role
  if (requireAdmin) {
    const user = getCurrentUser();

    if (!user || user.role !== "admin") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              This page requires administrator privileges.
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }
  //user is authenticated (and admin if required), render children
  return children;
};

export default ProtectedRoute;
