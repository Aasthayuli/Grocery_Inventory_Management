import { useEffect, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../services/productService";
import { isAdmin } from "../services/authService";

export const ManageCategories = () => {
  const userIsAdmin = isAdmin();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [msg, setMsg] = useState({
    message: "",
    color: "white",
  });
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    const res = await getCategories();
    setCategories(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
    return () => {};
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      setMsg({
        message: "Category name required!",
        color: "yellow",
      });
      setShowModal(true);
      return;
    }

    try {
      await createCategory({ name, description });
      setName("");
      setDescription("");
      fetchCategories();
      setMsg({
        message: "Category Added!",
        color: "green",
      });
      setShowModal(true);
    } catch (err) {
      setMsg({
        message: err?.message || "Failed to add category",
        color: "red",
      });
      setShowModal(true);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category? This cannot be undone.")) return;
    await deleteCategory(id);
    setMsg({
      message: "Category Deleted! Related products also deleted.",
      color: "red",
    });
    setShowModal(true);
    fetchCategories();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 p-4 sm:p-6 lg:px-14 py-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Available Categories
          </h1>
        </div>

        {/* Success/Error Message */}
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

        {/* Add Category */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow mb-4 sm:mb-6">
          <h2 className="text-lg font-semibold mb-3 sm:mb-4">Add Category</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <input
              type="text"
              placeholder="Category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 sm:p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border p-2 sm:p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>

          <button
            onClick={handleCreate}
            className="mt-4 bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center text-sm sm:text-base"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            Add Category
          </button>
        </div>

        {/* Category List - Responsive Table/Card */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left text-sm font-medium text-gray-700">
                    ID
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-gray-700">
                    Name
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-gray-700">
                    Description
                  </th>
                  {userIsAdmin && (
                    <th className="p-3 text-center text-sm font-medium text-gray-700">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 text-sm text-gray-600">{cat.id}</td>
                    <td className="p-3 text-sm font-medium text-gray-800">
                      {cat.name}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {cat.description || "-"}
                    </td>
                    {userIsAdmin && (
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                          title="Related products will be deleted too"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}

                {categories.length === 0 && (
                  <tr>
                    <td
                      colSpan={userIsAdmin ? 4 : 3}
                      className="p-6 text-center text-gray-500"
                    >
                      No categories found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            {categories.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No categories found
              </div>
            ) : (
              <div className="divide-y">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-800">{cat.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {cat.id}
                        </p>
                      </div>
                      {userIsAdmin && (
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                          title="Delete category"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {cat.description || "No description"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCategories;
