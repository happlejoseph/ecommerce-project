import { useEffect, useState } from "react";
import api from "../../services/api";

// filters shape: { category, minPrice, maxPrice, sort }
// hideCategory: pass true on pages that are already scoped to one category
const ProductFilters = ({ filters, onChange, hideCategory = false }) => {
  const [categories, setCategories] = useState([]);
  const [priceInputs, setPriceInputs] = useState({
    minPrice: filters.minPrice || "",
    maxPrice: filters.maxPrice || "",
  });

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

  const handleCategoryClick = (categoryId) => {
    // clicking the already-selected category clears the filter
    onChange({
      ...filters,
      category: filters.category === categoryId ? "" : categoryId,
    });
  };

  const handleSortChange = (event) => {
    onChange({ ...filters, sort: event.target.value });
  };

  const handlePriceApply = () => {
    onChange({
      ...filters,
      minPrice: priceInputs.minPrice,
      maxPrice: priceInputs.maxPrice,
    });
  };

  const handleClearAll = () => {
    setPriceInputs({ minPrice: "", maxPrice: "" });
    onChange({ category: "", minPrice: "", maxPrice: "", sort: "newest" });
  };

  return (
    <div className="space-y-8">

      {/* Sort */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">Sort By</h3>
        <select
          value={filters.sort || "newest"}
          onChange={handleSortChange}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Category */}
      {!hideCategory && categories.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold">Category</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <label
                key={category._id}
                className="flex cursor-pointer items-center gap-2 text-sm text-gray-600"
              >
                <input
                  type="checkbox"
                  checked={filters.category === category._id}
                  onChange={() => handleCategoryClick(category._id)}
                  className="h-4 w-4 rounded border-gray-300 accent-black"
                />
                {category.name}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={priceInputs.minPrice}
            onChange={(event) =>
              setPriceInputs((previous) => ({
                ...previous,
                minPrice: event.target.value,
              }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
          />

          <span className="text-gray-400">-</span>

          <input
            type="number"
            min="0"
            placeholder="Max"
            value={priceInputs.maxPrice}
            onChange={(event) =>
              setPriceInputs((previous) => ({
                ...previous,
                maxPrice: event.target.value,
              }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
          />
        </div>

        <button
          onClick={handlePriceApply}
          className="mt-3 w-full rounded-lg border border-black py-2 text-xs font-semibold transition hover:bg-black hover:text-white"
        >
          Apply
        </button>
      </div>

      {/* Clear all */}
      <button
        onClick={handleClearAll}
        className="text-xs font-medium text-gray-400 underline underline-offset-4 hover:text-black"
      >
        Clear all filters
      </button>

    </div>
  );
};

export default ProductFilters;
