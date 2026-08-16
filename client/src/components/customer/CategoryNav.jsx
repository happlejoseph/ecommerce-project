

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";

const CategoryNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {

      try {
        const response = await api.get("/categories");
        const list = response.data.categories || [];

        setCategories(list.filter((category) => category.status !== false));
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (category) => {
    if (!category) {
      navigate("/");
      return;
    }

    navigate(`/category/${category.name.toLowerCase()}`);
  };

  const isActive = (category) => {
    if (!category) {
      return location.pathname === "/";
    }

    return (
      location.pathname === `/category/${category.name.toLowerCase()}`
    );
  };

  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 overflow-x-auto px-6">
        <button
          onClick={() => handleCategoryClick(null)}
          className={`relative shrink-0 py-4 text-sm font-medium transition ${
            isActive(null) ? "text-black" : "text-gray-500 hover:text-black"
          }`}
        >
          All
          {isActive(null) && (
            <span className="absolute bottom-0 left-0 h-0.5 w-full bg-black" />
          )}
        </button>

        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => handleCategoryClick(category)}
            className={`relative shrink-0 py-4 text-sm font-medium transition ${
              isActive(category)
                ? "text-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            {category.name}

            {isActive(category) && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-black" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default CategoryNav;
