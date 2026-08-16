import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMinus, FiPlus, FiShoppingBag, FiTrash2 } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import Loader from "../../components/common/Loader";

const Cart = () => {
  const navigate = useNavigate();
  const { items, loading, subtotal, updateCartItem, removeFromCart } =
    useCart();

  const [updatingId, setUpdatingId] = useState(null);

  const handleQuantityChange = async (productId, quantity) => {
    if (quantity < 1) {
      await handleRemove(productId);
      return;
    }

    setUpdatingId(productId);

    try {
      await updateCartItem(productId, quantity);
    } catch (error) {
      console.error("Failed to update cart:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId) => {
    setUpdatingId(productId);

    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error("Failed to remove item:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <Loader label="Loading your cart..." />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-24 text-center">
        <FiShoppingBag size={48} className="text-gray-300" />
        <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-gray-500">
          Looks like you haven't added anything yet.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-3xl font-bold">Shopping Cart</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* Items */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => {
            const product = item.product;

            if (!product) return null;

            const price =
              product.discount > 0
                ? Math.round(product.price * (1 - product.discount / 100))
                : product.price;

            const isUpdating = updatingId === product._id;

            return (
              <div
                key={product._id}
                className="flex gap-4 rounded-xl border border-gray-200 p-4"
              >
                <img
                  src={product.image?.url || product.image}
                  alt={product.name}
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="h-24 w-24 shrink-0 cursor-pointer rounded-lg object-cover"
                />

                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <h3
                      onClick={() => navigate(`/product/${product._id}`)}
                      className="cursor-pointer text-sm font-semibold hover:underline"
                    >
                      {product.name}
                    </h3>

                    <button
                      onClick={() => handleRemove(product._id)}
                      disabled={isUpdating}
                      className="text-gray-400 transition hover:text-red-600"
                      aria-label="Remove item"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-lg border border-gray-300">
                      <button
                        onClick={() =>
                          handleQuantityChange(product._id, item.quantity - 1)
                        }
                        disabled={isUpdating}
                        className="flex h-8 w-8 items-center justify-center hover:bg-gray-50"
                        aria-label="Decrease quantity"
                      >
                        <FiMinus size={12} />
                      </button>

                      <span className="w-8 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          handleQuantityChange(product._id, item.quantity + 1)
                        }
                        disabled={isUpdating || item.quantity >= product.stock}
                        className="flex h-8 w-8 items-center justify-center hover:bg-gray-50"
                        aria-label="Increase quantity"
                      >
                        <FiPlus size={12} />
                      </button>
                    </div>

                    <span className="text-sm font-bold">
                      ₹{price * item.quantity}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="h-fit rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold">Order Summary</h2>

          <div className="mt-4 flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          <div className="mt-2 flex justify-between text-sm text-gray-500">
            <span>Shipping</span>
            <span>Free</span>
          </div>

          <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-base font-bold">
            <span>Total</span>
            <span>₹{subtotal}</span>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="mt-6 w-full rounded-lg bg-black py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
