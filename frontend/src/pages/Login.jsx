/**
 * Login Page
 * User authentication with login and register forms
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus, ShoppingCart, Eye, EyeOff } from "lucide-react";
import { login, register } from "../services/authService";
import { getErrorMessage } from "../services/api";

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "staff",
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login({
        username: formData.username,
        password: formData.password,
      });
      navigate("/dashboard");
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Form validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      // Auto login after registration
      await login({
        username: formData.username,
        password: formData.password,
      });
      navigate("/dashboard");
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-500 to-yellow-500 p-4 sm:p-6">
      <div className="flex flex-col md:flex-row justify-center md:justify-around items-center min-h-screen">
        {/* Header - Mobile top, Desktop left */}
        <div className="text-center mb-6 md:mb-0 md:text-left md:max-w-md">
          <div className="flex justify-center md:justify-start mb-4">
            <div className="bg-white p-3 sm:p-4 rounded-full shadow-lg">
              <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Grocery Inventory
          </h1>
          <p className="text-green-100 text-sm sm:text-base">
            Management System
          </p>
          <p className="text-green-50 text-xs sm:text-sm mt-4 hidden md:block">
            Streamline your grocery inventory management with real-time
            tracking, automated alerts, and comprehensive reporting.
          </p>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
            {/* Toggle Tabs */}
            <div className="flex mb-4 sm:mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError("");
                }}
                className={`flex-1 py-2 px-3 sm:px-4 rounded-lg font-medium transition text-sm sm:text-base ${
                  isLogin
                    ? "bg-white text-green-600 shadow"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <LogIn className="h-4 w-4 inline mr-1 sm:mr-2" />
                Login
              </button>

              <button
                onClick={() => {
                  setIsLogin(false);
                  setError("");
                }}
                className={`flex-1 py-2 px-3 sm:px-4 rounded-lg font-medium transition text-sm sm:text-base ${
                  !isLogin
                    ? "bg-white text-green-600 shadow"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <UserPlus className="h-4 w-4 inline mr-1 sm:mr-2" />
                Register
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Login Form */}
            {isLogin && (
              <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter your username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 sm:py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition flex items-center justify-center text-sm sm:text-base"
                >
                  {loading ? (
                    <span>Logging in...</span>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Login
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Register Form */}
            {!isLogin && (
              <form
                onSubmit={handleRegister}
                className="space-y-3 sm:space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Choose a username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="At least 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                  >
                    <option value="staff">Staff</option>
                    {/* <option value="admin">Admin</option> */}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 sm:py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition flex items-center justify-center text-sm sm:text-base"
                >
                  {loading ? (
                    <span>Creating account...</span>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Register
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Demo Credentials */}
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 text-center">
                Demo: username:{" "}
                <span className="font-mono font-bold">admin</span> | password:{" "}
                <span className="font-mono font-bold">admin123</span>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-white text-xs sm:text-sm mt-4 sm:mt-6">
            © 2026 Grocery Inventory System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
