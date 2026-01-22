import { Outlet, createBrowserRouter, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import img1 from "./assets/img1.png";
import img2 from "./assets/img2.png";
import img3 from "./assets/img3.png";
import img4 from "./assets/img4.png";
import img5 from "./assets/img5.png";
import img6 from "./assets/img6.png";
import img7 from "./assets/img7.png";
import img8 from "./assets/img8.png";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ManageProducts from "./pages/ManageProducts";
import AddProduct from "./pages/AddProduct";
import ExpiringProducts from "./pages/ExpiringProducts";
import StockIn from "./pages/StockIn";
import StockOut from "./pages/StockOut";
import ManageCategories from "./pages/ManageCategories";
import Profile from "./pages/Profile";
import Suppliers from "./pages/Suppliers";
import BarcodePreview from "./components/BarcodePreview";
import TransactionHistory from "./pages/TransactionHistory";

const AppLayout = () => (
  <div className="flex h-screen bg-gray-200">
    <Sidebar />
    <div className="flex-1 flex flex-col lg:ml-64">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  </div>
);

// 404 Not Found Component
const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <button
          onClick={() => window.history.back()}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 cursor-pointer"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

const Home = () => {
  const images = [img1, img2, img3, img4, img5, img6, img7, img8];
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-200 px-14 py-6 w-1/2 md:w-full">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex-col md:flex justify-around items-center">
          <h2 className="text-2xl md:text-4xl font-bold font-serif underline">
            Manage your Inventory
          </h2>
          <img
            src={images[currentIndex]}
            alt="Inventory"
            className="w-1/2 h-1/2 md:w-100 md:h-75 object-contain transition-all duration-500"
          />
        </div>
        <div className="overflow-hidden mt-12">
          <div className="flex gap-10 animate-scroll">
            {images.concat(images).map((img, index) => (
              <img
                key={index}
                src={img}
                alt="banner"
                className="h-32 w-auto object-contain"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "products",
        element: <ManageProducts />,
      },
      {
        path: "products/add",
        element: <AddProduct />,
      },
      {
        path: "products/edit/:id",
        element: <AddProduct />,
      },
      {
        path: "expiring",
        element: <ExpiringProducts />,
      },
      {
        path: "stock-in",
        element: <StockIn />,
      },
      {
        path: "stock-out",
        element: <StockOut />,
      },
      {
        path: "categories",
        element: <ManageCategories />,
      },
      {
        path: "suppliers",
        element: <Suppliers />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "products/:id",
        element: <BarcodePreview />,
      },
      {
        path: "transactions",
        element: <TransactionHistory />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
