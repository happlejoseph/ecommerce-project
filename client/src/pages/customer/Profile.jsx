

import { useEffect, useState } from "react";
import { FiMail, FiUser } from "react-icons/fi";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const Profile = () => {
  const { user, updateStoredUser } = useAuth();

  // Profile form
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Address form
  const [addressForm, setAddressForm] = useState({
    label: "",
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Profile messages/loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle profile form
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Handle address form
  const handleAddressChange = (event) => {
    const { name, value } = event.target;

    setAddressForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Add address
  const handleAddressSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await api.post("/user/addresses", addressForm);

      setAddresses(response.data.addresses);

      setAddressForm({
        label: "",
        fullName: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
      });

      setShowAddressForm(false);
    } catch (error) {
      console.error(
        "Failed to add address:",
        error.response?.data?.message || error.message
      );
    }
  };

  // Delete address
  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await api.delete(`/user/addresses/${addressId}`);

      setAddresses(response.data.addresses);
    } catch (error) {
      console.error(
        "Failed to delete address:",
        error.response?.data?.message || error.message
      );
    }
  };

  // Fetch saved addresses
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

  // Update profile
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.put("/user/profile", formData);

      updateStoredUser({
        ...user,
        name: response.data.user.name,
        email: response.data.user.email,
      });

      setSuccess("Profile updated successfully!");
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      {/* Profile heading */}

      <h1 className="text-3xl font-bold">My Profile</h1>

      <p className="mt-2 text-sm text-gray-500">
        Manage your account information.
      </p>

      {/* Profile form */}

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
      >
        <div className="mb-5">
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium"
          >
            Name
          </label>

          <div className="relative">
            <FiUser
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-black"
            />
          </div>
        </div>

        <div className="mb-6">
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium"
          >
            Email
          </label>

          <div className="relative">
            <FiMail
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-black"
            />
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* Addresses */}

      <div className="mt-8">
        <h2 className="text-xl font-semibold">My Addresses</h2>

        <p className="mt-1 text-sm text-gray-500">
          Manage your saved delivery addresses.
        </p>

        {/* Add address button */}

        <button
          type="button"
          onClick={() => setShowAddressForm(!showAddressForm)}
          className="mt-4 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          {showAddressForm ? "Cancel" : "Add New Address"}
        </button>

        {/* Add address form */}

        {showAddressForm && (
          <form
            onSubmit={handleAddressSubmit}
            className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5"
          >
            <h3 className="text-lg font-semibold">
              Add New Address
            </h3>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium">
                Address Label
              </label>

              <input
                name="label"
                value={addressForm.label}
                onChange={handleAddressChange}
                placeholder="Home, Work, etc."
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium">
                Full Name
              </label>

              <input
                name="fullName"
                value={addressForm.fullName}
                onChange={handleAddressChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium">
                Phone
              </label>

              <input
                name="phone"
                type="tel"
                value={addressForm.phone}
                onChange={handleAddressChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium">
                Address
              </label>

              <textarea
                name="address"
                value={addressForm.address}
                onChange={handleAddressChange}
                required
                rows="3"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium">
                City
              </label>

              <input
                name="city"
                value={addressForm.city}
                onChange={handleAddressChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium">
                State
              </label>

              <input
                name="state"
                value={addressForm.state}
                onChange={handleAddressChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium">
                Pincode
              </label>

              <input
                name="pincode"
                type="text"
                value={addressForm.pincode}
                onChange={handleAddressChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>

            <button
              type="submit"
              className="mt-5 w-full rounded-lg bg-black py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Save Address
            </button>
          </form>
        )}

        {/* Saved addresses */}

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
                <h3 className="font-semibold">
                  {item.label}
                </h3>

                <p className="mt-2 text-sm text-gray-700">
                  {item.fullName}
                </p>

                <p className="text-sm text-gray-600">
                  {item.address}
                </p>

                <p className="text-sm text-gray-600">
                  {item.city}, {item.state} - {item.pincode}
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  Phone: {item.phone}
                </p>

                {/* Delete button */}

                <button
                  type="button"
                  onClick={() => handleDeleteAddress(item._id)}
                  className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;