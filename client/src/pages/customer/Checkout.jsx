import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useCart } from "../../context/CartContext";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCartLocally } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(true);

  const [selectedAddressId, setSelectedAddressId] = useState("");



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



  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await api.get("/user/addresses");

        const savedAddresses = response.data.addresses || [];

        setAddresses(savedAddresses);


        if (savedAddresses.length > 0) {
          const firstAddress = savedAddresses[0];

          setSelectedAddressId(firstAddress._id);

          setFormData({
            fullName: firstAddress.fullName || "",
            phone: firstAddress.phone || "",
            address: firstAddress.address || "",
            city: firstAddress.city || "",
            state: firstAddress.state || "",
            pincode: firstAddress.pincode || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
      } finally {
        setAddressLoading(false);
      }
    };

    fetchAddresses();
  }, []);


  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));


    setSelectedAddressId("");
  };


  const handleSelectAddress = (address) => {
    setSelectedAddressId(address._id);

    setFormData({
      fullName: address.fullName || "",
      phone: address.phone || "",
      address: address.address || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
    });

    setError("");
  };



  const handleAddNewAddress = () => {
    setSelectedAddressId("");

    setFormData({
      fullName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    });

    setError("");
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
        <h1 className="text-2xl font-bold">
          Your cart is empty
        </h1>

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

      <h1 className="text-3xl font-bold">
        Checkout
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">



        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-gray-200 p-6 lg:col-span-2"
        >
          <h2 className="text-lg font-bold">
            Delivery Address
          </h2>



          {addressLoading ? (
            <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
              Loading saved addresses...
            </div>
          ) : addresses.length > 0 ? (
            <div className="space-y-3">

              <p className="text-sm font-medium text-gray-700">
                Select a saved address
              </p>

              {addresses.map((address) => (
                <button
                  key={address._id}
                  type="button"
                  onClick={() =>
                    handleSelectAddress(address)
                  }
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    selectedAddressId === address._id
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <p className="font-semibold text-gray-900">
                        {address.label}
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        {address.fullName}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        {address.address}
                      </p>

                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state} -{" "}
                        {address.pincode}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        Phone: {address.phone}
                      </p>
                    </div>


                    <div
                      className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border ${
                        selectedAddressId === address._id
                          ? "border-black"
                          : "border-gray-400"
                      }`}
                    >
                      {selectedAddressId === address._id && (
                        <div className="h-3 w-3 rounded-full bg-black" />
                      )}
                    </div>

                  </div>
                </button>
              ))}

  

              <button
                type="button"
                onClick={handleAddNewAddress}
                className={`w-full rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                  selectedAddressId === ""
                    ? "border-black bg-gray-50"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                + Use a New Address
              </button>

            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-600">
                You don't have any saved addresses yet.
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Enter a new delivery address below.
              </p>
            </div>
          )}



          <div className="pt-4">

            <h3 className="mb-4 text-sm font-semibold text-gray-800">
              {selectedAddressId
                ? "Selected Delivery Address"
                : "Enter Delivery Address"}
            </h3>



            <div>
              <label className="mb-2 block text-sm font-medium">
                Full Name
              </label>

              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>



            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium">
                Phone
              </label>

              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>



            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium">
                Address
              </label>

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows="3"
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium">
                  City
                </label>

                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  State
                </label>

                <input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>

            </div>



            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium">
                Pincode
              </label>

              <input
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>

          </div>


          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}



          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Placing Order..."
              : "Place Order (Cash on Delivery)"}
          </button>

        </form>


        <div className="h-fit rounded-xl border border-gray-200 p-6">

          <h2 className="text-lg font-bold">
            Order Summary
          </h2>

          <div className="mt-4 space-y-3">

            {items.map((item) => {
              const product = item.product;

              if (!product) {
                return null;
              }

              const price =
                product.discount > 0
                  ? Math.round(
                      product.price *
                        (1 - product.discount / 100)
                    )
                  : product.price;

              return (
                <div
                  key={product._id}
                  className="flex justify-between text-sm"
                >
                  <span className="text-gray-600">
                    {product.name} × {item.quantity}
                  </span>

                  <span className="font-medium">
                    ₹{price * item.quantity}
                  </span>
                </div>
              );
            })}

          </div>

          <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-base font-bold">
            <span>Total</span>

            <span>
              ₹{subtotal}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Checkout;