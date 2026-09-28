

import { useEffect, useState } from "react";
import api from "../../services/api";
import Loader from "../../components/common/Loader";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/user");
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (user) => {
    const newStatus =
      user.status === "inactive" ? "active" : "inactive";

    const actionText =
      newStatus === "inactive" ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} ${user.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingUserId(user._id);

      const response = await api.put(
        `/user/${user._id}/status`,
        {
          status: newStatus,
        }
      );

      const updatedUser = response.data.user;

      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item._id === updatedUser._id
            ? {
                ...item,
                status: updatedUser.status,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Failed to update user status:", error);

      window.alert(
        error.response?.data?.message ||
          "Failed to update user status."
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (loading) {
    return <Loader label="Loading users..." />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Users</h1>

      <p className="mt-1 text-sm text-gray-500">
        Manage registered customers and admins.
      </p>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white">
        {users.length === 0 ? (
          <p className="p-10 text-center text-sm text-gray-500">
            No users found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="p-4 font-medium">
                    Name
                  </th>

                  <th className="p-4 font-medium">
                    Email
                  </th>

                  <th className="p-4 font-medium">
                    Role
                  </th>

                  <th className="p-4 font-medium">
                    Status
                  </th>

                  <th className="p-4 font-medium">
                    Joined
                  </th>

                  <th className="p-4 font-medium">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => {
                  const isAdmin = user.role === "admin";
                  const isInactive = user.status === "inactive";
                  const isUpdating =
                    updatingUserId === user._id;

                  return (
                    <tr
                      key={user._id}
                      className="border-b border-gray-50"
                    >
                      <td className="p-4 font-medium">
                        {user.name}
                      </td>

                      <td className="p-4 text-gray-600">
                        {user.email}
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                            isAdmin
                              ? "bg-black text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                            isInactive
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {user.status || "active"}
                        </span>
                      </td>

                      <td className="p-4 text-gray-600">
                        {new Date(
                          user.createdAt
                        ).toLocaleDateString("en-IN")}
                      </td>

                      <td className="p-4">
                        {isAdmin ? (
                          <span className="text-xs text-gray-400">
                            Admin
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(user)
                            }
                            disabled={isUpdating}
                            className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              isInactive
                                ? "bg-black text-white hover:bg-gray-800"
                                : "border border-red-200 text-red-600 hover:bg-red-50"
                            }`}
                          >
                            {isUpdating
                              ? "Updating..."
                              : isInactive
                              ? "Activate"
                              : "Deactivate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;