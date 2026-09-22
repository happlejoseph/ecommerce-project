

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiUploadCloud } from "react-icons/fi";
import api from "../../services/api";
import Loader from "../../components/common/Loader";

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount: "",
    stock: "",
    category: "",
    movement: "",
    caseMaterial: "",
    strapMaterial: "",
    waterResistance: "",
    warranty: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch product when editing
  useEffect(() => {
    if (!isEdit) return;

    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        const product = response.data.product;

        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price || "",
          discount: product.discount || "",
          stock: product.stock || "",
          category: product.category?._id || "",

          movement: product.movement || "",
          caseMaterial: product.caseMaterial || "",
          strapMaterial: product.strapMaterial || "",
          waterResistance: product.waterResistance || "",
          warranty: product.warranty || "",
        });

        setImagePreview(product.image?.url || "");
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, isEdit]);

  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Handle image selection
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Submit product
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const payload = new FormData();

      payload.append("name", formData.name);
      payload.append("description", formData.description);
      payload.append("price", formData.price);
      payload.append("discount", formData.discount || 0);
      payload.append("stock", formData.stock);
      payload.append("category", formData.category);

      // Watch details
      payload.append("movement", formData.movement);
      payload.append("caseMaterial", formData.caseMaterial);
      payload.append("strapMaterial", formData.strapMaterial);
      payload.append("waterResistance", formData.waterResistance);
      payload.append("warranty", formData.warranty);

      // Image
      if (imageFile) {
        payload.append("image", imageFile);
      }

      // Update product
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
      }

      // Add product
      else {
        if (!imageFile) {
          setError("Please select a product image.");
          setSubmitting(false);
          return;
        }

        await api.post("/products", payload);
      }

      navigate("/admin/products");
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to save product."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader label="Loading product..." />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">
        {isEdit ? "Edit Product" : "Add Product"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-5 rounded-xl border border-gray-200 bg-white p-6"
      >
        {/* Product Image */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Product Image
          </label>

          <label
            htmlFor="image"
            className="flex h-40 w-40 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50 hover:border-black"
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <FiUploadCloud size={24} />

                <span className="mt-2 text-xs">
                  Upload image
                </span>
              </div>
            )}
          </label>

          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Name */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Name
          </label>

          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Description
          </label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
          />
        </div>

        {/* Price / Discount / Stock */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Price (₹)
            </label>

            <input
              name="price"
              type="number"
              min="0"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Discount (%)
            </label>

            <input
              name="discount"
              type="number"
              min="0"
              max="100"
              value={formData.discount}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Stock
            </label>

            <input
              name="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Category
          </label>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
          >
            <option value="">
              Select a category
            </option>

            {categories.map((category) => (
              <option
                key={category._id}
                value={category._id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Watch Details */}
        <div className="border-t border-gray-200 pt-5">
          <h2 className="mb-4 text-lg font-semibold">
            Watch Details
          </h2>

          {/* Movement + Case Material */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Movement
              </label>

              <input
                name="movement"
                value={formData.movement}
                onChange={handleChange}
                // placeholder="e.g. Automatic"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Case Material
              </label>

              <input
                name="caseMaterial"
                value={formData.caseMaterial}
                onChange={handleChange}
                // placeholder="e.g. Stainless Steel"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Strap Material + Water Resistance */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Strap Material
              </label>

              <input
                name="strapMaterial"
                value={formData.strapMaterial}
                onChange={handleChange}
                // placeholder="e.g. Leather"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Water Resistance
              </label>

              <input
                name="waterResistance"
                value={formData.waterResistance}
                onChange={handleChange}
                // placeholder="e.g. 100m"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Warranty */}
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium">
              Warranty
            </label>

            <input
              name="warranty"
              value={formData.warranty}
              onChange={handleChange}
              // placeholder="e.g. 5 Years"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting
              ? "Saving..."
              : isEdit
              ? "Update Product"
              : "Add Product"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold transition hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;