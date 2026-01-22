/**
 * Suppliers Page
 * Manage suppliers with CRUD operations
 */

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Save, Users } from "lucide-react";
import api from "../services/api";
import { isAdmin } from "../services/authService";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../services/productService";

export const Suppliers = () => {
  const userIsAdmin = isAdmin();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState("");
  const [msgbox, setMsgbox] = useState(false);
  const [msg, setMsg] = useState({
    message: "",
    color: "white",
  });

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    contact: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await getSuppliers();
      setSuppliers(response.data?.suppliers || []);
      setLoading(false);
    } catch (error) {
      setMsg({
        message: "Something went wrong. Failed to fetch suppliers!",
        color: "red",
      });
      setMsgbox(true);
      setLoading(false);
    }
  };

  const handleOpenModal = (supplier = null) => {
    if (supplier) {
      setEditMode(true);
      setFormData({
        id: supplier.id,
        name: supplier.name,
        contact: supplier.contact,
        email: supplier.email || "",
        address: supplier.address || "",
      });
    } else {
      setEditMode(false);
      setFormData({
        id: null,
        name: "",
        contact: "",
        email: "",
        address: "",
      });
    }
    setShowModal(true);
    setError("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ id: null, name: "", contact: "", email: "", address: "" });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const payload = {
        name: formData.name.trim(),
        contact: formData.contact.trim(),
      };

      if (formData.email) {
        payload.email = formData.email.trim();
      }

      if (formData.address) {
        payload.address = formData.address.trim();
      }

      if (editMode) {
        // Pass the supplier ID along with payload
        await updateSupplier(formData.id, payload);
        setMsg({ message: "Supplier updated successfully!", color: "green" });
        setMsgbox(true);
      } else {
        await createSupplier(payload);
        setMsg({ message: "Supplier created successfully!", color: "green" });
        setMsgbox(true);
      }

      handleCloseModal();
      fetchSuppliers();
    } catch (err) {
      setMsg({ message: "Failed to save supplier", color: "red" });
      setMsgbox(true);
      setError(err.response?.data?.message || "Failed to save supplier");
    }
  };

  const handleDelete = async (supplierId, supplierName) => {
    if (
      !window.confirm(
        `Delete "${supplierName}"? This will also delete all associated products.`,
      )
    ) {
      return;
    }

    try {
      await deleteSupplier(supplierId);
      setMsg({ message: "Supplier deleted successfully!", color: "green" });
      setMsgbox(true);
      fetchSuppliers();
    } catch (error) {
      setMsg({ message: "Failed to delete supplier", color: "red" });
      setMsgbox(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 px-4 py-6 sm:px-6 lg:px-14">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              Suppliers
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage your product suppliers
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="cursor-pointer bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center space-x-2 text-sm sm:text-base"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Add Supplier</span>
          </button>
        </div>

        {/* Success Message */}
        {msgbox && (
          <div
            className={`mb-6 p-3 sm:p-4 bg-${msg.color}-50 border border-${msg.color}-200 rounded-lg flex justify-between items-start`}
          >
            <p className={`text-sm text-${msg.color}-700 font-medium pr-4`}>
              {msg.message}
            </p>
            <button
              onClick={() => setMsgbox(false)}
              className={`cursor-pointer text-${msg.color}-700 font-medium shrink-0`}
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        )}

        {/* Suppliers Grid */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 lg:p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-sm sm:text-base">
              Loading suppliers...
            </p>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 lg:p-12 text-center">
            <Users className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-base sm:text-lg mb-4">
              No suppliers found
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="cursor-pointer bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-700 text-sm sm:text-base"
            >
              Add First Supplier
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {suppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start sm:items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg shrink-0">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-base sm:text-lg">
                        {supplier.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {supplier.product_count} products
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start sm:items-center text-sm text-gray-600">
                    <span className="font-medium w-16 sm:w-20 shrink-0">
                      Contact:
                    </span>
                    <span className="break-all">{supplier.contact}</span>
                  </div>
                  {supplier.email && (
                    <div className="flex items-start sm:items-center text-sm text-gray-600">
                      <span className="font-medium w-16 sm:w-20 shrink-0">
                        Email:
                      </span>
                      <span className="truncate break-all">
                        {supplier.email}
                      </span>
                    </div>
                  )}
                  {supplier.address && (
                    <div className="flex items-start text-sm text-gray-600">
                      <span className="font-medium w-16 sm:w-20 shrink-0">
                        Address:
                      </span>
                      <span className="line-clamp-2">{supplier.address}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleOpenModal(supplier)}
                    className="cursor-pointer bg-green-50 text-green-600 py-2 rounded-lg hover:bg-green-100 transition flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  {userIsAdmin && (
                    <button
                      onClick={() => handleDelete(supplier.id, supplier.name)}
                      className="cursor-pointer bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                  {editMode ? "Edit Supplier" : "Add New Supplier"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="e.g., Amul"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.contact}
                    onChange={(e) =>
                      setFormData({ ...formData, contact: e.target.value })
                    }
                    required
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="contact@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address (Optional)
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter full address"
                  />
                </div>

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <Save className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>{editMode ? "Update" : "Save"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 sm:px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Suppliers;
