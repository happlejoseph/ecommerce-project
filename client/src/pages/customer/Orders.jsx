import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPackage } from "react-icons/fi";
import api from "../../services/api";
import Loader from "../../components/common/Loader";

const statusStyles = {
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-blue-50 text-blue-700",
  shipping: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

const Orders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders");
        setOrders(response.data.orders || []);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <Loader label="Loading your orders..." />;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-bold">My Orders</h1>

      {orders.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center py-16 text-center">
          <FiPackage size={48} className="text-gray-300" />
          <p className="mt-4 text-gray-500">You haven't placed any orders yet.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => {
            const total = order.items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            );

            return (
              <div
                key={order._id}
                onClick={() => navigate(`/orders/${order._id}`)}
                className="cursor-pointer rounded-xl border border-gray-200 p-5 transition hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-400">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </p>
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

                <div className="mt-4 flex items-center gap-3 overflow-x-auto">
                  {order.items.map((item, index) => (
                    <img
                      key={index}
                      src={item.image}
                      alt={item.name}
                      className="h-14 w-14 shrink-0 rounded-lg object-cover"
                    />
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-sm text-gray-500">
                    {order.items.length} item{order.items.length === 1 ? "" : "s"}
                  </span>
                  <span className="text-base font-bold">₹{total}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
