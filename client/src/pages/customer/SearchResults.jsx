import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import ProductCard from "../../components/customer/ProductCard";
import ProductFilters from "../../components/customer/ProductFilters";
import Loader from "../../components/common/Loader";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    sort: "newest",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      try {
        const response = await api.get("/products", {
          params: {
            search: query,
            category: filters.category || undefined,
            minPrice: filters.minPrice || undefined,
            maxPrice: filters.maxPrice || undefined,
            sort: filters.sort || undefined,
          },
        });

        setProducts(response.data.products || []);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query, filters]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-2xl font-bold">
        Search results for "{query}"
      </h1>

      <p className="mt-1 text-sm text-gray-500">
        {loading ? "Searching..." : `${products.length} product(s) found`}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">

        {/* Filters */}
        <div className="lg:col-span-1">
          <ProductFilters filters={filters} onChange={setFilters} />
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {loading && <Loader />}

          {!loading && products.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
              No products matched your search.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SearchResults;
