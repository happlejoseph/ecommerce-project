import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import api from "../../services/api";
import Loader from "../../components/common/Loader";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);

    try {
      const response = await api.get("/products");
      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    setDeletingId(id);

    try {
      await api.delete(`/products/${id}`);
      setProducts((previous) => previous.filter((product) => product._id !== id));
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert(error.response?.data?.message || "Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <Loader label="Loading products..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your store's products.
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          <FiPlus size={18} />
          Add Product
        </Link>
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white">
        {products.length === 0 ? (
          <p className="p-10 text-center text-sm text-gray-500">
            No products yet. Add your first product.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Stock</th>
                  <th className="p-4 font-medium">Discount</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b border-gray-50">
                    <td className="flex items-center gap-3 p-4">
                      <img
                        src={product.image?.url}
                        alt={product.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <span className="font-medium">{product.name}</span>
                    </td>
                    <td className="p-4 text-gray-600">
                      {product.category?.name || "—"}
                    </td>
                    <td className="p-4 text-gray-600">₹{product.price}</td>
                    <td className="p-4 text-gray-600">
                      {product.stock <= 0 ? (
                        <span className="font-semibold text-red-600">Out</span>
                      ) : (
                        product.stock
                      )}
                    </td>
                    <td className="p-4 text-gray-600">
                      {product.discount > 0 ? `${product.discount}%` : "—"}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/products/${product._id}/edit`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:bg-gray-50"
                          aria-label="Edit product"
                        >
                          <FiEdit2 size={15} />
                        </Link>

                        <button
                          onClick={() => handleDelete(product._id)}
                          disabled={deletingId === product._id}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-red-600 transition hover:bg-red-50"
                          aria-label="Delete product"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
