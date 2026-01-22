/**
 * Navbar Component
 * Top navigation bar with user info and logout
 */

import { LogOut, Bell, User, ShoppingCart } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import {
  isAuthenticated,
  getCurrentUser,
  logout,
} from "../services/authService";
import { getExpiringProducts } from "../services/productService";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [expiryCount, setExpiryCount] = useState(0);
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const user = getCurrentUser();
    setUser(user);

    fetchExpiringCount();
    // check at every 2 seconds for current user
    const interval = setInterval(() => {
      const updatedUser = getCurrentUser();
      setUser(updatedUser);
    }, 2000);

    return () => clearInterval(interval); // Cleanup
  }, []);

  //get Expiring products
  const fetchExpiringCount = async () => {
    if (!isAuthenticated()) {
      return;
    }
    try {
      const response = await getExpiringProducts(7);
      setExpiryCount(response.data.length || 0);
    } catch (error) {
      setExpiryCount(0);
    }
  };

  // handle logout
  const handleLogout = async () => {
    try {
      //call logout function
      await logout();

      //navigate to login page
      navigate("/login");
    } catch (error) {
      //forcing logout even API fails! - just navigate to '/login'
      navigate("/login");
    }
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40 w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 px-2">
          {/* Logo/Brand - Responsive */}
          <div className="flex items-center space-x-3">
            <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-green-600" />
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">
                Grocery Inventory
              </h1>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-base font-bold text-gray-800">GIMS</h1>
            </div>
          </div>

          {/* Right side - User info and actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Notification Bell */}
            <button
              onClick={() => navigate("/expiring")}
              className="cursor-pointer relative p-1 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
              title="Expiring Products"
            >
              <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
              {expiryCount > 0 && (
                <span className="absolute -top-1 -right-1 sm:top-0 sm:right-0 inline-flex items-center justify-center px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {expiryCount}
                </span>
              )}
            </button>

            {/* User Info */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="cursor-pointer flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-gray-100 transition"
              >
                {/*User icon */}
                <div className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-green-600 text-white">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>

                {/* Desktop only user info */}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-800">
                    {user?.username || "User"}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role || "Staff"}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div
              ref={menuRef}
              className="absolute right-2 sm:right-4 mt-2 w-56 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
            >
              {/* User info - name and email */}
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-800">
                  {user?.username || "User"}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email || "email"}
                </p>
              </div>

              {/* button to navigate to user profile  */}
              <button
                onClick={() => navigate("/profile")}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </button>

              {/* Log out button */}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
