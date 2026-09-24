

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiHeart, FiMinus, FiPlus, FiShoppingCart,} from "react-icons/fi";

import api from "../../services/api";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useToast } from "../../context/ToastContext";
import StarRating from "../../components/customer/StarRating";
import ReviewsSection from "../../components/customer/ReviewsSection";
import VirtualTryOn from "../../components/customer/VirtualTryOn";



const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();
  const { addToCart, isInCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showTryOn, setShowTryOn] = useState(false);


  // GET PRODUCT
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);

      try {
        const response = await api.get(`/products/${id}`);

        setProduct(response.data.product || response.data);
        setQuantity(1);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // LOADING
  if (loading) {
    return <Loader label="Loading product..." />;
  }

  // PRODUCT NOT FOUND
  if (!product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">Product not found.</p>
      </div>
    );
  }

  const inWishlist = isInWishlist(product._id);
  const inCart = isInCart(product._id);
  const outOfStock = product.stock <= 0;

  // CALCULATE FINAL PRICE
  const finalPrice =
    product.discount > 0
      ? Math.round(
          product.price * (1 - product.discount / 100)
        )
      : product.price;

  // ADD TO CART
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Already in cart -> go to cart
    if (inCart) {
      navigate("/cart");
      return;
    }

    setAddingToCart(true);

    try {
      await addToCart(product._id, quantity);

      showToast(
        `${product.name} added to cart`,
        "success"
      );
    } catch (error) {
      showToast(
        error.response?.data?.message ||
          "Failed to add to cart",
        "error"
      );
    } finally {
      setAddingToCart(false);
    }
  };

  // TOGGLE WISHLIST
  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      await toggleWishlist(product._id);
    } catch (error) {
      console.error(
        "Failed to update wishlist:",
        error
      );
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">

        {/* IMAGE */}
        <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
          <img
            src={product.image?.url || product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* PRODUCT INFO */}
        <div>

          {/* CATEGORY / BRAND */}
          {product.category?.name && (
            <span className="text-xs font-medium uppercase tracking-widest text-gray-400">
              {product.category.name}
            </span>
          )}

          {/* PRODUCT NAME */}
          <h1 className="mt-2 text-3xl font-bold">
            {product.name}
          </h1>

          {/* RATING */}
          <div className="mt-2 flex items-center gap-2">
            <StarRating
              rating={product.averageRating || 0}
              readOnly
              size={16}
            />

            <span className="text-xs text-gray-500">
              {product.numReviews > 0
                ? `${product.averageRating?.toFixed(
                    1
                  )} (${product.numReviews} review${
                    product.numReviews === 1
                      ? ""
                      : "s"
                  })`
                : "No reviews yet"}
            </span>
          </div>

          {/* PRICE */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl font-bold">
              ₹{finalPrice}
            </span>

            {product.discount > 0 && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  ₹{product.price}
                </span>

                <span className="rounded-md bg-black px-2.5 py-1 text-xs font-semibold text-white">
                  {product.discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* DESCRIPTION */}
          <p className="mt-6 leading-relaxed text-gray-600">
            {product.description}
          </p>

          {/* WATCH DETAILS */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold">
              Watch Details
            </h2>

            <div className="mt-4 divide-y divide-gray-200 border-y border-gray-200">

              {/* MOVEMENT */}
              {product.movement && (
                <div className="flex justify-between py-3 text-sm">
                  <span className="text-gray-500">
                    Movement
                  </span>

                  <span className="font-medium text-gray-900">
                    {product.movement}
                  </span>
                </div>
              )}

              {/* CASE MATERIAL */}
              {product.caseMaterial && (
                <div className="flex justify-between py-3 text-sm">
                  <span className="text-gray-500">
                    Case Material
                  </span>

                  <span className="font-medium text-gray-900">
                    {product.caseMaterial}
                  </span>
                </div>
              )}

              {/* STRAP MATERIAL */}
              {product.strapMaterial && (
                <div className="flex justify-between py-3 text-sm">
                  <span className="text-gray-500">
                    Strap Material
                  </span>

                  <span className="font-medium text-gray-900">
                    {product.strapMaterial}
                  </span>
                </div>
              )}

              {/* WATER RESISTANCE */}
              {product.waterResistance && (
                <div className="flex justify-between py-3 text-sm">
                  <span className="text-gray-500">
                    Water Resistance
                  </span>

                  <span className="font-medium text-gray-900">
                    {product.waterResistance}
                  </span>
                </div>
              )}

              {/* WARRANTY */}
              {product.warranty && (
                <div className="flex justify-between py-3 text-sm">
                  <span className="text-gray-500">
                    Warranty
                  </span>

                  <span className="font-medium text-gray-900">
                    {product.warranty}
                  </span>
                </div>
              )}

            </div>
          </div>

          {/* STOCK */}
          <div className="mt-4 text-sm">
            {outOfStock ? (
              <span className="font-semibold text-red-600">
                Out of stock
              </span>
            ) : (
              <span className="text-gray-500">
                {product.stock} item
                {product.stock === 1 ? "" : "s"} in stock
              </span>
            )}
          </div>

          {/* QUANTITY */}
          {!outOfStock && (
            <div className="mt-6 flex items-center gap-4">
              <span className="text-sm font-medium">
                Quantity
              </span>

              <div className="flex items-center rounded-lg border border-gray-300">

                <button
                  onClick={() =>
                    setQuantity((q) =>
                      Math.max(1, q - 1)
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center hover:bg-gray-50"
                  aria-label="Decrease quantity"
                >
                  <FiMinus size={14} />
                </button>

                <span className="w-10 text-center text-sm font-semibold">
                  {quantity}
                </span>

                <button
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(product.stock, q + 1)
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center hover:bg-gray-50"
                  aria-label="Increase quantity"
                >
                  <FiPlus size={14} />
                </button>

              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div className="mt-8 flex gap-3">

            {/* ADD TO CART */}
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || outOfStock}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                inCart
                  ? "border border-black bg-white text-black hover:bg-gray-100"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              <FiShoppingCart size={18} />

              {outOfStock
                ? "Out of Stock"
                : addingToCart
                ? "Adding..."
                : inCart
                ? "Go to Cart"
                : "Add to Cart"}
            </button>

            {/* WISHLIST */}
            <button
              onClick={handleToggleWishlist}
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border transition ${
                inWishlist
                  ? "border-black bg-black text-white"
                  : "border-gray-300 hover:border-black"
              }`}
              aria-label="Toggle wishlist"
            >
              <FiHeart size={20} />
            </button>

          </div>

          {/* VIRTUAL TRY */}
          <button
          onClick={()=> setShowTryOn(true)}
          className="mt-4 w-full rounded-lg bg-black py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Virtual Try
          </button>
          
          {showTryOn && (
            <div className="mt-4">
              <VirtualTryOn/>
            </div>
          )}
        </div>
      </div>

      {/* REVIEWS */}
      <ReviewsSection
        productId={product._id}
        averageRating={product.averageRating || 0}
        numReviews={product.numReviews || 0}
      />
    </div>
  );
};

export default ProductDetails;