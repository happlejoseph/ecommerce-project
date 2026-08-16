import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import Loader from "../../components/common/Loader";
import { useToast } from "../../context/ToastContext";

const statusStyles = {
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-blue-50 text-blue-700",
  shipping: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

const returnStatusStyles = {
  requested: "bg-yellow-50 text-yellow-700",
  approved: "bg-blue-50 text-blue-700",
  rejected: "bg-red-50 text-red-700",
  refunded: "bg-green-50 text-green-700",
};

const statusOptions = ["pending", "confirmed", "shipping", "delivered", "cancelled"];

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [processingReturn, setProcessingReturn] = useState(false);

  const [status, setStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courier, setCourier] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");

  const fetchOrder = async () => {
    try {
      // Admin list endpoint already returns full order docs (with
      // populated user + snapshotted items), so we reuse it here.
      const response = await api.get("/orders/admin");
      const found = (response.data.orders || []).find((o) => o._id === id);

      setOrder(found || null);
      setStatus(found?.status || "");
      setTrackingNumber(found?.trackingNumber || "");
      setCourier(found?.courier || "");
      setEstimatedDelivery(
        found?.estimatedDelivery
          ? found.estimatedDelivery.slice(0, 10)
          : ""
      );
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpdateStatus = async () => {
    setUpdating(true);

    try {
      const response = await api.patch(`/orders/admin/${id}/status`, {
        status,
        trackingNumber,
        courier,
        estimatedDelivery: estimatedDelivery || null,
      });

      setOrder(response.data.order);
      showToast("Order updated successfully", "success");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to update order",
        "error"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleReturnAction = async (returnStatus) => {
    setProcessingReturn(true);

    try {
      const response = await api.patch(`/orders/admin/${id}/return`, {
        returnStatus,
      });

      setOrder(response.data.order);
      showToast(`Return ${returnStatus} successfully`, "success");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to update return",
        "error"
      );
    } finally {
      setProcessingReturn(false);
    }
  };

  if (loading) {
    return <Loader label="Loading order..." />;
  }

  if (!order) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-gray-500">Order not found.</p>
      </div>
    );
  }

  const total = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const hasUnsavedChanges =
    status !== order.status ||
    trackingNumber !== (order.trackingNumber || "") ||
    courier !== (order.courier || "") ||
    estimatedDelivery !== (order.estimatedDelivery ? order.estimatedDelivery.slice(0, 10) : "");

  return (
    <div className="mx-auto max-w-4xl">
      <button
        onClick={() => navigate("/admin/orders")}
        className="text-sm font-medium text-gray-500 underline underline-offset-4"
      >
        ← Back to Orders
      </button>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
            statusStyles[order.status] || "bg-gray-100 text-gray-600"
          }`}
        >
          {order.status}
        </span>
      </div>

      {/* Customer */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold">Customer</h2>
        <p className="mt-2 text-sm text-gray-600">
          {order.user?.name} ({order.user?.email})
        </p>
      </div>

      {/* Items */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold">Items</h2>

        <div className="mt-4 space-y-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <img
                src={item.image}
                alt={item.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-gray-500">
                  Qty: {item.quantity} × ₹{item.price}
                </p>
              </div>
              <span className="text-sm font-bold">
                ₹{item.price * item.quantity}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-base font-bold">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>

      {/* Shipping */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold">Shipping Address</h2>

        <div className="mt-3 text-sm text-gray-600">
          <p className="font-medium text-black">
            {order.shippingAddress.fullName}
          </p>
          <p>{order.shippingAddress.address}</p>
          <p>
            {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
            {order.shippingAddress.pincode}
          </p>
          <p>Phone: {order.shippingAddress.phone}</p>
        </div>
      </div>

      {/* Return Request Management */}
      {order.returnStatus !== "none" && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Return Request</h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                returnStatusStyles[order.returnStatus] || "bg-gray-100 text-gray-600"
              }`}
            >
              {order.returnStatus}
            </span>
          </div>

          <p className="mt-3 text-sm text-gray-600">
            <span className="font-medium text-black">Reason: </span>
            {order.returnReason}
          </p>

          {order.returnStatus === "requested" && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => handleReturnAction("approved")}
                disabled={processingReturn}
                className="rounded-lg bg-black px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
              >
                Approve Return
              </button>

              <button
                onClick={() => handleReturnAction("rejected")}
                disabled={processingReturn}
                className="rounded-lg border border-red-200 px-5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                Reject Return
              </button>
            </div>
          )}

          {order.returnStatus === "approved" && (
            <div className="mt-4">
              <button
                onClick={() => handleReturnAction("refunded")}
                disabled={processingReturn}
                className="rounded-lg bg-black px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
              >
                Mark as Refunded
              </button>
            </div>
          )}
        </div>
      )}

      {/* Update Status + Tracking */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold">Update Status & Tracking</h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              Status
            </label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm capitalize outline-none focus:border-black"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option} className="capitalize">
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              Courier
            </label>
            <input
              type="text"
              value={courier}
              onChange={(event) => setCourier(event.target.value)}
              placeholder="e.g. BlueDart, Delhivery"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              Tracking Number
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(event) => setTrackingNumber(event.target.value)}
              placeholder="e.g. TRK123456789"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              Estimated Delivery
            </label>
            <input
              type="date"
              value={estimatedDelivery}
              onChange={(event) => setEstimatedDelivery(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
            />
          </div>
        </div>

        <button
          onClick={handleUpdateStatus}
          disabled={updating || !hasUnsavedChanges}
          className="mt-4 rounded-lg bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
        >
          {updating ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;
