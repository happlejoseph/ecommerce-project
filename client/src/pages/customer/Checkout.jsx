import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useCart } from "../../context/CartContext";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCartLocally } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/orders", {
        shippingAddress: {
          ...formData,
          phone: Number(formData.phone),
          pincode: Number(formData.pincode),
        },
      });

      clearCartLocally();

      navigate(`/orders/${response.data.order._id}`, {
        state: { justPlaced: true },
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to place order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
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
      <h1 className="text-3xl font-bold">Checkout</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* Shipping Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-gray-200 p-6 lg:col-span-2"
        >
          <h2 className="text-lg font-bold">Shipping Address</h2>

          <div>
            <label className="mb-2 block text-sm font-medium">Full Name</label>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Phone</label>
            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Address</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">City</label>
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">State</label>
              <input
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Pincode</label>
            <input
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Placing Order..." : "Place Order (Cash on Delivery)"}
          </button>
        </form>

        {/* Summary */}
        <div className="h-fit rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold">Order Summary</h2>

          <div className="mt-4 space-y-3">
            {items.map((item) => {
              const product = item.product;
              if (!product) return null;

              const price =
                product.discount > 0
                  ? Math.round(product.price * (1 - product.discount / 100))
                  : product.price;

              return (
                <div key={product._id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {product.name} × {item.quantity}
                  </span>
                  <span className="font-medium">₹{price * item.quantity}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-base font-bold">
            <span>Total</span>
            <span>₹{subtotal}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
