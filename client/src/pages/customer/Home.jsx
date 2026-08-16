import { useEffect, useState } from "react";
import api from "../../services/api";
import ProductCard from "../../components/customer/ProductCard";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");

        setProducts(response.data.products || response.data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Today's Deals: discounted products first, capped to a row of 8
  const dealProducts = (
    products.some((product) => product.discount > 0)
      ? products.filter((product) => product.discount > 0)
      : products
  ).slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl px-6">

      {/* Hero Banner */}
      <section className="mt-6 rounded-2xl bg-black px-8 py-16 text-white md:px-16">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-gray-300">
            Limited Time Offer
          </p>

          <h1 className="mt-3 text-4xl font-bold leading-tight md:text-6xl">
            Great Deals.
            <br />
            Better Choices.
          </h1>

          <p className="mt-5 max-w-lg text-gray-300">
            Discover amazing products at special prices.
            Shop your favorites before the offer ends.
          </p>

          <button
            onClick={() =>
              window.scrollTo({ top: 800, behavior: "smooth" })
            }
            className="mt-8 rounded-lg bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
          >
            Shop Now
          </button>
        </div>
      </section>

      {/* Today's Deals */}
      <section className="py-12">

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Today's Deals
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Grab the best deals before they're gone
            </p>
          </div>

          <button
            onClick={() =>
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
              })
            }
            className="text-sm font-medium underline underline-offset-4 hover:text-gray-500"
          >
            View All
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <p className="py-10 text-center text-gray-500">
            Loading products...
          </p>
        )}

        {/* Products */}
        {!loading && dealProducts.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {dealProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}
          </div>
        )}

        {/* No Products */}
        {!loading && dealProducts.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
            No products found.
          </div>
        )}

      </section>

      {/* Products For You */}
      <section className="border-t border-gray-100 py-12">

        <div className="mb-8 text-left">
          <h2 className="text-2xl font-bold">
            Products For You
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Explore our full range of products handpicked across every category
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <p className="py-10 text-center text-gray-500">
            Loading products...
          </p>
        )}

        {/* Products */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}
          </div>
        )}

        {/* No Products */}
        {!loading && products.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
            No products found.
          </div>
        )}

      </section>

    </div>
  );
};

export default Home;
