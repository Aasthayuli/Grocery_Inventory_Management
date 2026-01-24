import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProduct } from "../services/productService";
import { getBarcodeImageUrl } from "../services/barcodeService";

const BarcodePreview = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [barcodeUrl, setBarcodeUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  useEffect(() => {
    fetchProductData();
  }, []);

  const fetchProductData = async () => {
    try {
      const productRes = await getProduct(id);
      setProduct(productRes.data);

      const barcodeUrl = await getBarcodeImageUrl(id);
      setBarcodeUrl(barcodeUrl);
    } catch (error) {
      setError("Something went Wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = barcodeUrl;
    link.download = `barcode_${product?.barcode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      <div className="bg-white shadow rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Barcode Section */}
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Product Barcode</h2>

          <img
            src={barcodeUrl}
            alt="Barcode"
            className="mx-auto border p-4 rounded-md"
          />

          <button
            onClick={handleDownload}
            className="cursor-pointer mt-4 bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
          >
            Download Barcode
          </button>
        </div>

        {/* Product Details */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Product Details</h2>

          <div className="space-y-2 text-sm">
            <p>
              <b>Name:</b> {product.name}
            </p>
            <p>
              <b>SKU:</b> {product.sku}
            </p>
            <p>
              <b>Barcode:</b> {product.barcode}
            </p>
            <p>
              <b>Price:</b> ₹{product.price}
            </p>
            <p>
              <b>Quantity:</b> {product.quantity}
            </p>

            <p>
              <b>Status:</b>{" "}
              {product.is_expired ? (
                <span className="text-red-600">Expired</span>
              ) : (
                <span className="text-green-600">Active</span>
              )}
            </p>

            <p>
              <b>Low Stock:</b> {product.is_low_stock ? "Yes" : "No"}
            </p>

            <p>
              <b>Expiry Date:</b> {product.expiry_date || "N/A"}
            </p>

            {product.category && (
              <p>
                <b>Category:</b> {product.category.name}
              </p>
            )}

            {product.supplier && (
              <p>
                <b>Supplier:</b> {product.supplier.name} (
                {product.supplier.contact})
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodePreview;
