

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import { useCart } from "../../context/CartContext";


const Checkout = () => {

  const navigate = useNavigate();

  const {items, subtotal, clearCartLocally} = useCart();

  const [addresses, setAddresses] = useState([]);

  const [addressLoading, setAddressLoading] = useState(true);

  const [selectedAddressId, setSelectedAddressId] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [razorpayLoaded, setRazorpayLoaded] = useState(false);


  const [formData, setFormData] = useState({
    label: "Home",
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });


  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const isOnlineRequired =
    subtotal > 50000;


  useEffect(() => {

    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }


    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]' );


    if (existingScript) {

      existingScript.addEventListener(
        "load",
        () => {
          setRazorpayLoaded(true);
        }
      );

      return;
    }


    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    script.onload = () => {
      setRazorpayLoaded(true);
    };

    script.onerror = () => {
      setRazorpayLoaded(false);

      setError(
        "Razorpay could not be loaded. Please refresh the page and try again."
      );
    };

    document.body.appendChild(script);

  }, []);


  useEffect(() => {

    if (isOnlineRequired) {
      setPaymentMethod("online");
    }

  }, [isOnlineRequired]);



  useEffect(() => {

    const fetchAddresses = async () => {

      try {

        const response =
          await api.get("/user/addresses");


        const savedAddresses =
          response.data.addresses || [];


        setAddresses(savedAddresses);


        if (savedAddresses.length > 0) {

          const firstAddress =
            savedAddresses[0];


          setSelectedAddressId(
            firstAddress._id
          );


          setFormData({
            label:
              firstAddress.label || "Home",

            fullName:
              firstAddress.fullName || "",

            phone:
              firstAddress.phone || "",

            address:
              firstAddress.address || "",

            city:
              firstAddress.city || "",

            state:
              firstAddress.state || "",

            pincode:
              firstAddress.pincode || "",
          });
        }

      }
      catch (error) {

        console.error(
          "Failed to fetch addresses:",
          error
        );

      }
      finally {

        setAddressLoading(false);

      }

    };


    fetchAddresses();

  }, []);



  const handleChange = (event) => {

    const name =
      event.target.name;

    const value =
      event.target.value;


    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));


    setSelectedAddressId("");

  };



  const handleSelectAddress = (address) => {

    setSelectedAddressId(address._id);


    setFormData({

      label: address.label || "Home",

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

      label: "Home",
      fullName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",

    });


    setError("");

  };



  const saveNewAddress = async () => {

    if (selectedAddressId) {
      return true;
    }


    try {

      const response =
        await api.post("/user/addresses", {

            label: formData.label || "Home",

            fullName: formData.fullName,

            phone: Number(formData.phone),

            address: formData.address,

            city: formData.city,

            state: formData.state,

            pincode: Number(formData.pincode),
          }
        );


      if (response.data.address) {

        setAddresses((previous) => [
          ...previous,
          response.data.address,
        ]);

      }


      return true;

    }
    catch (error) {

      console.error(
        "Failed to save new address:",
        error
      );

      return false;

    }

  };



  const createCodOrder = async () => {

    const response =
      await api.post("/orders", {
          shippingAddress: {

            ...formData,

            phone:
              Number(formData.phone),

            pincode:
              Number(formData.pincode),

          },

          paymentMethod: "cod",
        }
      );


    return response.data.order;

  };


  const startOnlinePayment = async () => {

    if (!razorpayLoaded || !window.Razorpay) {

      throw new Error(
        "Razorpay Checkout is still loading. Please try again."
      );

    }

    const response = await api.post("/payment/create");


    const razorpayOrder = response.data.order;


    const razorpayKey = response.data.key;


    if (!razorpayOrder?.id) {

      throw new Error("Razorpay order could not be created.");

    }

    if (!razorpayKey) {

      throw new Error(
        "Razorpay key is missing."
      );

    }

    const options = {

      key: razorpayKey,

      amount: razorpayOrder.amount,

      currency: razorpayOrder.currency,

      name: "ORA",

      description: "Luxury Watch Purchase",

      order_id: razorpayOrder.id,


      prefill: {

        name: formData.fullName,

        contact: formData.phone,

      },


      notes: {

        address: formData.address,

        city: formData.city,

        state: formData.state,

        pincode: formData.pincode,

      },

      theme: {
        color: "#000000",
      },



      handler: async (paymentResponse) => {

        try {

          setError("");

          setLoading(true);

          const verifyResponse = await api.post("/payment/verify", {

                razorpay_order_id: paymentResponse.razorpay_order_id,

                razorpay_payment_id: paymentResponse.razorpay_payment_id,

                razorpay_signature: paymentResponse.razorpay_signature,


                shippingAddress: {

                  ...formData,

                  phone: Number(formData.phone),

                  pincode: Number(formData.pincode),

                },

              }
            );


          const addressSaved = await saveNewAddress();


          if (
            !addressSaved &&
            !selectedAddressId
          ) {

            console.warn("Order succeeded, but the new address could not be saved.");

          }

          clearCartLocally();

          navigate(`/orders/${verifyResponse.data.order._id}`, {
              state: {
                justPlaced: true,
              },
            }
          );

        }
        catch (error) {

          console.error("Payment verification error:", error);


          setError(
            error.response?.data?.message || "Payment verification failed. Please contact support."
          );

        }
        finally {

          setLoading(false);

        }

      },

      modal: {

        ondismiss: () => {

          setLoading(false);

          setError("Payment was cancelled. Your order has not been placed.");

        },

      },

    };


    const razorpayCheckout = new window.Razorpay(options);



    razorpayCheckout.on(
      "payment.failed",
      (response) => {

        console.error(
          "Razorpay payment failed:",
          response
        );


        setLoading(false);


        setError(
          response.error?.description ||
          "Payment failed. Please try again."
        );

      }
    );


    razorpayCheckout.open();

  };



  const handleSubmit = async (event) => {


    event.preventDefault();


    setError("");

    setLoading(true);


    try {

      if (
        subtotal > 50000 &&
        paymentMethod === "cod"
      ) {

        setPaymentMethod("online");


        throw new Error(
          "Orders above ₹50,000 require online payment."
        );

      }


      if (paymentMethod === "cod") {

        const order = await createCodOrder();



        const addressSaved = await saveNewAddress();


        if (
          !addressSaved &&
          !selectedAddressId
        ) {

          console.warn("Order succeeded, but the new address could not be saved.");

        }

        clearCartLocally();


        navigate(`/orders/${order._id}`, {

            state: {
              justPlaced: true,
            },
          }
        );


        return;

      }


      if (paymentMethod === "online") {

        await startOnlinePayment();

        return;

      }

    }
    catch (error) {

      setError(
        error.response?.data?.message ||
        error.message ||
        "Failed to place order. Please try again."
      );


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
          type="button"
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

                        {address.city},{" "}

                        {address.state} -{" "}

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


            {!selectedAddressId && (

              <div className="mb-4">

                <label className="mb-2 block text-sm font-medium">

                  Address

                </label>


                <select
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
                >

                  <option value="Home">
                    Home
                  </option>

                  <option value="Work">
                    Work
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

            )}


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


          <div className="border-t border-gray-200 pt-6">

            <h2 className="text-lg font-bold">

              Payment Method

            </h2>


            {isOnlineRequired ? (

              <div className="mt-4">


                <div className="rounded-xl border border-black bg-gray-50 p-4">

                  <label className="flex cursor-pointer items-start gap-3">

                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={
                        paymentMethod === "online"
                      }
                      onChange={() =>
                        setPaymentMethod("online")
                      }
                      className="mt-1"
                    />


                    <div>

                      <p className="font-semibold text-gray-900">

                        Online Payment

                      </p>


                      <p className="mt-1 text-sm text-gray-500">

                        Pay securely using Razorpay.

                      </p>

                    </div>

                  </label>

                </div>


                <p className="mt-3 rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-700">

                  Cash on Delivery is not available
                  for orders above ₹50,000.

                </p>


              </div>

            ) : (

              <div className="mt-4 space-y-3">


                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                    paymentMethod === "cod"
                      ? "border-black bg-gray-50"
                      : "border-gray-200"
                  }`}
                >

                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={
                      paymentMethod === "cod"
                    }
                    onChange={() =>
                      setPaymentMethod("cod")
                    }
                    className="mt-1"
                  />


                  <div>

                    <p className="font-semibold text-gray-900">

                      Cash on Delivery

                    </p>


                    <p className="mt-1 text-sm text-gray-500">

                      Pay when your order arrives.

                    </p>

                  </div>

                </label>

                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                    paymentMethod === "online"? "border-black bg-gray-50" : "border-gray-200"
                  }`}
                >

                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={
                      paymentMethod === "online"
                    }
                    onChange={() =>
                      setPaymentMethod("online")
                    }
                    className="mt-1"
                  />


                  <div>

                    <p className="font-semibold text-gray-900">

                      Online Payment

                    </p>


                    <p className="mt-1 text-sm text-gray-500">

                      Pay securely using Razorpay.

                    </p>

                  </div>

                </label>

              </div>

            )}

          </div>

          {error && (

            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">

              {error}

            </div>

          )}


          <button
            type="submit"
            disabled={
              loading ||
              (paymentMethod === "online" &&
                !razorpayLoaded)
            }
            className="w-full rounded-lg bg-black py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {loading ? (

              paymentMethod === "online"? "Opening Payment..." : "Placing Order..."

            ) : paymentMethod === "online" ? (

              !razorpayLoaded? "Loading Payment..." : `Pay ₹${subtotal}`) : ("Place Order (Cash on Delivery)"

            )}

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


              const price = product.discount > 0 ? Math.round(product.price *(1 -product.discount / 100)): product.price;


              return (

                <div
                  key={product._id}
                  className="flex justify-between text-sm"
                >

                  <span className="text-gray-600">

                    {product.name} ×{" "}

                    {item.quantity}

                  </span>


                  <span className="font-medium">

                    ₹
                    {price * item.quantity}

                  </span>

                </div>

              );

            })}

          </div>


          <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-base font-bold">

            <span>
              Total
            </span>


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