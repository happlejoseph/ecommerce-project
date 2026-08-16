import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
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

// the standard order lifecycle, used to render the tracking timeline
const TRACKING_STEPS = ["pending", "confirmed", "shipping", "delivered"];

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.order);
    } catch (error) {
      console.error("Failed to fetch order:", error);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);

    try {
      const response = await api.patch(`/orders/${id}/cancel`);
      setOrder(response.data.order);
      showToast("Order cancelled successfully", "success");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to cancel order",
        "error"
      );
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitReturn = async () => {
    if (!returnReason.trim()) {
      showToast("Please enter a reason for the return", "error");
      return;
    }

    setSubmittingReturn(true);

    try {
      const response = await api.patch(`/orders/${id}/return`, {
        reason: returnReason,
      });
      setOrder(response.data.order);
      setShowReturnForm(false);
      showToast("Return request submitted", "success");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to submit return request",
        "error"
      );
    } finally {
      setSubmittingReturn(false);
    }
  };

  if (loading) {
    return <Loader label="Loading order..." />;
  }

  if (!order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">Order not found.</p>
      </div>
    );
  }

  const total = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const canCancel = !["shipping", "delivered", "cancelled"].includes(
    order.status
  );

  const canRequestReturn =
    order.status === "delivered" && order.returnStatus === "none";

  const currentStepIndex = TRACKING_STEPS.indexOf(order.status);

  const getStepTimestamp = (step) => {
    const entry = order.statusHistory?.find((history) => history.status === step);
    return entry
      ? new Date(entry.updatedAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        })
      : null;
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">

      <div className="flex flex-wrap items-center justify-between gap-4">
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

      {/* Order Tracking */}
      {order.status !== "cancelled" && (
        <div className="mt-8 rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold">Order Tracking</h2>

          <div className="mt-6 flex items-start justify-between">
            {TRACKING_STEPS.map((step, index) => {
              const isComplete = index <= currentStepIndex;
              const isLast = index === TRACKING_STEPS.length - 1;

              return (
                <div key={step} className="flex flex-1 flex-col items-center">
                  <div className="flex w-full items-center">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isComplete
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isComplete ? <FiCheck size={16} /> : index + 1}
                    </div>

                    {!isLast && (
                      <div
                        className={`h-0.5 flex-1 ${
                          index < currentStepIndex ? "bg-black" : "bg-gray-100"
                        }`}
                      />
                    )}
                  </div>

                  <p
                    className={`mt-2 text-center text-xs font-medium capitalize ${
                      isComplete ? "text-black" : "text-gray-400"
                    }`}
                  >
                    {step}
                  </p>

                  {getStepTimestamp(step) && (
                    <p className="text-[11px] text-gray-400">
                      {getStepTimestamp(step)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {(order.trackingNumber || order.courier || order.estimatedDelivery) && (
            <div className="mt-6 grid grid-cols-1 gap-3 border-t border-gray-100 pt-4 text-sm sm:grid-cols-3">
              {order.courier && (
                <div>
                  <p className="text-gray-400">Courier</p>
                  <p className="font-medium">{order.courier}</p>
                </div>
              )}

              {order.trackingNumber && (
                <div>
                  <p className="text-gray-400">Tracking Number</p>
                  <p className="font-medium">{order.trackingNumber}</p>
                </div>
              )}

              {order.estimatedDelivery && (
                <div>
                  <p className="text-gray-400">Estimated Delivery</p>
                  <p className="font-medium">
                    {new Date(order.estimatedDelivery).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Items */}
      <div className="mt-6 rounded-xl border border-gray-200 p-6">
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

      {/* Shipping Address */}
      <div className="mt-6 rounded-xl border border-gray-200 p-6">
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

      {/* Return / Refund */}
      {order.returnStatus !== "none" && (
        <div className="mt-6 rounded-xl border border-gray-200 p-6">
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
        </div>
      )}

      {canRequestReturn && (
        <div className="mt-6 rounded-xl border border-gray-200 p-6">
          {!showReturnForm ? (
            <button
              onClick={() => setShowReturnForm(true)}
              className="rounded-lg border border-black px-6 py-2.5 text-sm font-semibold transition hover:bg-black hover:text-white"
            >
              Return Order
            </button>
          ) : (
            <div>
              <h2 className="text-lg font-bold">Return Order</h2>

              <textarea
                value={returnReason}
                onChange={(event) => setReturnReason(event.target.value)}
                placeholder="Tell us why you're returning this order..."
                rows={3}
                className="mt-3 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
              />

              <div className="mt-3 flex gap-3">
                <button
                  onClick={handleSubmitReturn}
                  disabled={submittingReturn}
                  className="rounded-lg bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
                >
                  {submittingReturn ? "Submitting..." : "Submit Return Request"}
                </button>

                <button
                  onClick={() => setShowReturnForm(false)}
                  className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold transition hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex gap-3">
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="rounded-lg border border-red-200 px-6 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            {cancelling ? "Cancelling..." : "Cancel Order"}
          </button>
        )}

        <button
          onClick={() => navigate("/orders")}
          className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold transition hover:bg-gray-50"
        >
          Back to Orders
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;
