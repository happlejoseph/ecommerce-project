import { useState } from "react";
import { FiHeart, FiShoppingCart, FiStar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useToast } from "../../context/ToastContext";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, isInCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [addingToCart, setAddingToCart] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  const inWishlist = isInWishlist(product._id);
  const inCart = isInCart(product._id);
  const outOfStock = product.stock <= 0;

  const handleProductClick = () => {
    navigate(`/product/${product._id}`);
  };

  const handleAddToCart = async (event) => {
    event.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Already in cart -> just take them to the cart page
    if (inCart) {
      navigate("/cart");
      return;
    }

    setAddingToCart(true);

    try {
      await addToCart(product._id, 1);
      showToast(`${product.name} added to cart`, "success");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      showToast(
        error.response?.data?.message || "Failed to add to cart",
        "error"
      );
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async (event) => {
    event.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setTogglingWishlist(true);

    try {
      await toggleWishlist(product._id);
    } catch (error) {
      console.error("Failed to update wishlist:", error);
    } finally {
      setTogglingWishlist(false);
    }
  };

  return (
    <div
      onClick={handleProductClick}
      className="group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
    >

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">

        <img
          src={product.image?.url || product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />

        {/* Discount */}
        {product.discount > 0 && (
          <span className="absolute left-3 top-3 rounded-md bg-black px-2.5 py-1 text-xs font-semibold text-white">
            {product.discount}% OFF
          </span>
        )}

        {/* Out of stock */}
        {outOfStock && (
          <span className="absolute left-3 bottom-3 rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">
            Out of stock
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={handleToggleWishlist}
          disabled={togglingWishlist}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition ${
            inWishlist
              ? "bg-black text-white"
              : "bg-white text-black hover:bg-black hover:text-white"
          }`}
          aria-label="Add to wishlist"
        >
          <FiHeart size={18} className={inWishlist ? "fill-current" : ""} />
        </button>

      </div>

      {/* Product Information */}
      <div className="p-4">

        <h3 className="line-clamp-2 min-h-12 text-sm font-semibold text-gray-900">
          {product.name}
        </h3>

        {/* Rating */}
        {product.numReviews > 0 && (
          <div className="mt-1 flex items-center gap-1">
            <FiStar size={13} className="fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium text-gray-600">
              {product.averageRating?.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">
              ({product.numReviews})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-bold text-black">
            ₹{product.discount > 0
              ? Math.round(product.price * (1 - product.discount / 100))
              : product.price}
          </span>

          {product.discount > 0 && (
            <span className="text-sm text-gray-400 line-through">
              ₹{product.price}
            </span>
          )}
        </div>

        {/* Add to Cart / Go to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={addingToCart || outOfStock}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
            inCart
              ? "border border-black bg-white text-black hover:bg-gray-100"
              : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          <FiShoppingCart size={17} />
          {outOfStock
            ? "Out of Stock"
            : addingToCart
            ? "Adding..."
            : inCart
            ? "Go to Cart"
            : "Add to Cart"}
        </button>

      </div>
    </div>
  );
};

export default ProductCard;
