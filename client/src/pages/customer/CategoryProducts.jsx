import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import ProductCard from "../../components/customer/ProductCard";
import ProductFilters from "../../components/customer/ProductFilters";
import Loader from "../../components/common/Loader";

const CategoryProducts = () => {
  const { category } = useParams();

  const [categoryDoc, setCategoryDoc] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    sort: "newest",
  });

  // Step 1: resolve the URL category name (e.g. "shoes") to its actual _id
  useEffect(() => {
    const resolveCategory = async () => {
      try {
        const response = await api.get("/categories");
        const allCategories = response.data.categories || [];

        const matched = allCategories.find(
          (item) => item.name?.toLowerCase() === category?.toLowerCase()
        );

        setCategoryDoc(matched || null);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategoryDoc(null);
      }
    };

    resolveCategory();
  }, [category]);

  // Step 2: fetch products filtered by that category id + any active filters
  useEffect(() => {
    if (!categoryDoc) return;

    const fetchProducts = async () => {
      setLoading(true);

      try {
        const response = await api.get("/products", {
          params: {
            category: categoryDoc._id,
            minPrice: filters.minPrice || undefined,
            maxPrice: filters.maxPrice || undefined,
            sort: filters.sort || undefined,
          },
        });

        setProducts(response.data.products || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryDoc, filters]);

  const categoryTitle = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : "";

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">

      {/* Category Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {categoryTitle}
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Browse products in {categoryTitle}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">

        {/* Filters (category hidden - this page is already scoped to one) */}
        <div className="lg:col-span-1">
          <ProductFilters filters={filters} onChange={setFilters} hideCategory />
        </div>

        {/* Products */}
        <div className="lg:col-span-3">

          {loading && <Loader />}

          {!loading && products.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
              No products found in this category.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CategoryProducts;
