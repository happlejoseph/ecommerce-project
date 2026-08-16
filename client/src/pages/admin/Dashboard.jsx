import { useEffect, useState } from "react";
import { FiBox, FiShoppingBag, FiTag, FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Loader from "../../components/common/Loader";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, categoriesRes, ordersRes, usersRes] =
          await Promise.all([
            api.get("/products"),
            api.get("/categories"),
            api.get("/orders/admin"),
            api.get("/user"),
          ]);

        const orders = ordersRes.data.orders || [];

        const revenue = orders
          .filter((order) => order.status !== "cancelled")
          .reduce(
            (sum, order) =>
              sum +
              order.items.reduce(
                (itemSum, item) => itemSum + item.price * item.quantity,
                0
              ),
            0
          );

        setStats({
          products: (productsRes.data.products || []).length,
          categories: (categoriesRes.data.categories || []).length,
          orders: orders.length,
          users: (usersRes.data.users || []).length,
          revenue,
        });

        setRecentOrders(orders.slice(0, 5));
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <Loader label="Loading dashboard..." />;
  }

  const cards = [
    {
      label: "Total Products",
      value: stats?.products ?? 0,
      icon: FiBox,
      link: "/admin/products",
    },
    {
      label: "Categories",
      value: stats?.categories ?? 0,
      icon: FiTag,
      link: "/admin/categories",
    },
    {
      label: "Total Orders",
      value: stats?.orders ?? 0,
      icon: FiShoppingBag,
      link: "/admin/orders",
    },
    {
      label: "Registered Users",
      value: stats?.users ?? 0,
      icon: FiUsers,
      link: "/admin/users",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        Overview of your store's performance.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, link }) => (
          <Link
            key={label}
            to={link}
            className="rounded-xl border border-gray-200 bg-white p-6 transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="mt-2 text-3xl font-bold">{value}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                <Icon size={20} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Revenue (non-cancelled orders)</h2>
          <span className="text-2xl font-bold">₹{stats?.revenue ?? 0}</span>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="text-sm font-medium underline underline-offset-4"
          >
            View All
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-gray-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-50">
                    <td className="py-3 font-medium">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3 text-gray-600">
                      {order.user?.name || "N/A"}
                    </td>
                    <td className="py-3 capitalize text-gray-600">
                      {order.status}
                    </td>
                    <td className="py-3 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
