import { FiHeart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import ProductCard from "../../components/customer/ProductCard";
import Loader from "../../components/common/Loader";

const Wishlist = () => {
  const navigate = useNavigate();
  const { products, loading } = useWishlist();

  if (loading) {
    return <Loader label="Loading your wishlist..." />;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-3xl font-bold">My Wishlist</h1>

      {products.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center py-16 text-center">
          <FiHeart size={48} className="text-gray-300" />
          <p className="mt-4 text-gray-500">Your wishlist is empty.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Discover Products
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
