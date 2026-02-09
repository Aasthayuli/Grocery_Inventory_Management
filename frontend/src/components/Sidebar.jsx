import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertCircle,
  Layers,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { isAdmin } from "../services/authService";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const userIsAdmin = isAdmin();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsCollapsed(false);
      } else {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "staff"],
    },
    {
      name: "Products",
      path: "/products",
      icon: Package,
      roles: ["admin", "staff"],
    },
    {
      name: "Categories",
      path: "/categories",
      icon: Layers,
      roles: ["admin", "staff"],
    },
    {
      name: "Suppliers",
      path: "/suppliers",
      icon: Users,
      roles: ["admin", "staff"],
    },
    {
      name: "Stock IN",
      path: "/stock-in",
      icon: TrendingUp,
      roles: ["admin", "staff"],
    },
    {
      name: "Stock OUT",
      path: "/stock-out",
      icon: TrendingDown,
      roles: ["admin", "staff"],
    },
    {
      name: "Reports",
      path: "/transactions",
      icon: BarChart3,
      roles: ["admin", "staff"],
    },
    {
      name: "Expiring Items",
      path: "/expiring",
      icon: AlertCircle,
      roles: ["admin", "staff"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (userIsAdmin) return true;
    return item.roles.includes("staff");
  });

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-green-600 text-white rounded-lg shadow-lg"
      >
        {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
      </button>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-gray-800 text-white transition-all duration-300 z-50
          ${
            isCollapsed
              ? "-translate-x-full lg:translate-x-0 lg:w-20"
              : "translate-x-0 w-64"
          }
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            {!isCollapsed ? (
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Package className="h-8 w-8 text-green-400" />
                  <div>
                    <h2 className="text-xl font-bold">Inventory</h2>
                    <p className="text-sm text-gray-400">Management</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="lg:hidden p-2 hover:bg-gray-700 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Package className="h-8 w-8 text-green-400 mx-auto" />
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-2">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          setIsCollapsed(true);
                        }
                      }}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-3 transition-all relative group ${
                          isActive
                            ? "bg-green-700 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white"
                        }`
                      }
                    >
                      <Icon
                        className={`${isCollapsed ? "mx-auto" : "mr-3"} h-5 w-5`}
                      />

                      {/* Text - Always show when expanded, tooltip when collapsed */}
                      {!isCollapsed ? (
                        <span className="font-medium">{item.name}</span>
                      ) : (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                          {item.name}
                        </div>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer - User Role Badge */}
          {!isCollapsed && (
            <div className="p-4 border-t border-gray-700">
              <div className="bg-gray-700 px-3 py-2 ">
                <p className="text-xs text-gray-400">Logged in as</p>
                <p className="text-sm font-medium capitalize">
                  {userIsAdmin ? "👑 Admin" : "👤 Staff"}
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
