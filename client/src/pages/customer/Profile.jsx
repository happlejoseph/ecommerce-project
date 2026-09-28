

import { useEffect, useState } from "react";
import { FiMail, FiUser, FiEdit2, FiTrash2 } from "react-icons/fi";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const Profile = () => {
  const { user, updateStoredUser } = useAuth();


  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);

  const [showAddressForm, setShowAddressForm] = useState(false);

  const [editingAddressId, setEditingAddressId] = useState(null);

  const [addressForm, setAddressForm] = useState({
    label: "",
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  const handleAddressChange = (event) => {
    const { name, value } = event.target;

    setAddressForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  const resetAddressForm = () => {
    setAddressForm({
      label: "",
      fullName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    });

    setEditingAddressId(null);
    setShowAddressForm(false);
  };

  const handleAddressSubmit = async (event) => {
    event.preventDefault();

    try {
      if (editingAddressId) {
        // UPDATE EXISTING ADDRESS

        const response = await api.put(
          `/user/addresses/${editingAddressId}`,
          addressForm
        );

        setAddresses(response.data.addresses);

        resetAddressForm();
      } else {
        // ADD NEW ADDRESS

        const response = await api.post(
          "/user/addresses",
          addressForm
        );

        setAddresses(response.data.addresses);

        resetAddressForm();
      }
    } catch (error) {
      console.error(
        "Failed to save address:",
        error.response?.data?.message || error.message
      );
    }
  };


  const handleEditAddress = (address) => {
    setEditingAddressId(address._id);

    setAddressForm({
      label: address.label || "",
      fullName: address.fullName || "",
      phone: address.phone || "",
      address: address.address || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
    });

    setShowAddressForm(true);

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };


  const handleDeleteAddress = async (addressId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await api.delete(
        `/user/addresses/${addressId}`
      );

      setAddresses(response.data.addresses);

      if (editingAddressId === addressId) {
        resetAddressForm();
      }
    } catch (error) {
      console.error(
        "Failed to delete address:",
        error.response?.data?.message || error.message
      );
    }
  };


  useEffect(() => {
    const fetchAddresses = async () => {
      setAddressLoading(true);

      try {
        const response = await api.get("/user/addresses");

        setAddresses(response.data.addresses);
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
      } finally {
        setAddressLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.put(
        "/user/profile",
        formData
      );

      updateStoredUser({
        ...user,
        name: response.data.user.name,
        email: response.data.user.email,
      });

      setSuccess("Profile updated successfully!");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update profile."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">


      <h1 className="text-3xl font-bold">
        My Profile
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        Manage your account information.
      </p>


      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
      >
        {/* NAME */}

        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Name
          </label>

          <div className="relative">
            <FiUser
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-black"
              placeholder="Enter your name"
            />
          </div>
        </div>

        {/* EMAIL */}

        <div className="mt-5">
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Email
          </label>

          <div className="relative">
            <FiMail
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-black"
              placeholder="Enter your email"
            />
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* SUCCESS */}

        {success && (
          <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-600">
            {success}
          </p>
        )}

        {/* SAVE PROFILE */}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-black py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <div className="mt-10">

        <h2 className="text-xl font-semibold">
          My Addresses
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Manage your saved delivery addresses.
        </p>


        {!showAddressForm && (
          <button
            type="button"
            onClick={() => {
              setEditingAddressId(null);

              setAddressForm({
                label: "",
                fullName: "",
                phone: "",
                address: "",
                city: "",
                state: "",
                pincode: "",
              });

              setShowAddressForm(true);
            }}
            className="mt-4 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Add New Address
          </button>
        )}

        {showAddressForm && (
          <form
            onSubmit={handleAddressSubmit}
            className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingAddressId
                  ? "Edit Address"
                  : "Add New Address"}
              </h3>

              <button
                type="button"
                onClick={resetAddressForm}
                className="text-sm text-gray-500 hover:text-black"
              >
                Cancel
              </button>
            </div>


            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Address Label
              </label>

              <input
                type="text"
                name="label"
                value={addressForm.label}
                onChange={handleAddressChange}
                placeholder="Home, Work, Office..."
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />
            </div>


            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Full Name
              </label>

              <input
                type="text"
                name="fullName"
                value={addressForm.fullName}
                onChange={handleAddressChange}
                placeholder="Enter full name"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />
            </div>


            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Phone
              </label>

              <input
                type="tel"
                name="phone"
                value={addressForm.phone}
                onChange={handleAddressChange}
                placeholder="Enter phone number"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />
            </div>


            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Address
              </label>

              <textarea
                name="address"
                value={addressForm.address}
                onChange={handleAddressChange}
                placeholder="House name, street, area..."
                rows="3"
                required
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />
            </div>


            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                City
              </label>

              <input
                type="text"
                name="city"
                value={addressForm.city}
                onChange={handleAddressChange}
                placeholder="Enter city"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />
            </div>



            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                State
              </label>

              <input
                type="text"
                name="state"
                value={addressForm.state}
                onChange={handleAddressChange}
                placeholder="Enter state"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />
            </div>



            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Pincode
              </label>

              <input
                type="text"
                name="pincode"
                value={addressForm.pincode}
                onChange={handleAddressChange}
                placeholder="Enter pincode"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />
            </div>



            <button
              type="submit"
              className="mt-5 w-full rounded-lg bg-black py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              {editingAddressId
                ? "Update Address"
                : "Save Address"}
            </button>
          </form>
        )}

        {addressLoading ? (
          <p className="mt-5 text-sm text-gray-500">
            Loading addresses...
          </p>
        ) : addresses.length === 0 ? (
          <p className="mt-5 rounded-lg border border-gray-200 p-5 text-sm text-gray-500">
            No saved addresses yet.
          </p>
        ) : (
          <div className="mt-5 space-y-4">

            {addresses.map((item) => (
              <div
                key={item._id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >


                <div className="flex items-start justify-between gap-4">

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {item.label}
                    </h3>

                    <p className="mt-2 text-sm text-gray-700">
                      {item.fullName}
                    </p>
                  </div>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    Saved
                  </span>

                </div>



                <p className="mt-3 text-sm text-gray-600">
                  {item.address}
                </p>

                <p className="text-sm text-gray-600">
                  {item.city}, {item.state} - {item.pincode}
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  Phone: {item.phone}
                </p>



                <div className="mt-4 flex gap-3">

                  <button
                    type="button"
                    onClick={() => handleEditAddress(item)}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    <FiEdit2 size={15} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteAddress(item._id)
                    }
                    className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <FiTrash2 size={15} />
                    Delete
                  </button>

                </div>
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;