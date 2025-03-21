import React, { useState, useEffect } from "react";

const User = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/users") // Replace with actual API endpoint
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error(err));
  }, []);

  const handleAction = (id, actionType) => {
    fetch(`/api/users/${id}/${actionType}`, { method: "PUT" })
      .then((res) => res.json())
      .then((updatedUser) => {
        setUsers(users.map(user => user.id === id ? updatedUser : user));
      })
      .catch((err) => console.error(err));
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <h1 className="text-4xl font-extrabold text-center mb-6">User & Seller Management</h1>

      {/* Search Input */}
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="Search users..."
          className="w-full max-w-lg px-4 py-2 rounded-lg border dark:border-gray-700 shadow-md dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* User List */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredUsers.map((user) => (
          <div key={user.id} className="p-5 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 transform hover:scale-105 transition-all duration-300">
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
            <p className={`mt-2 font-semibold ${getStatusColor(user.status)}`}>{user.status}</p>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              {user.role === "seller" && user.status === "Pending" && (
                <>
                  <button
                    onClick={() => handleAction(user.id, "approve")}
                    className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(user.id, "reject")}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Reject
                  </button>
                </>
              )}
              {user.status !== "Suspended" ? (
                <button
                  onClick={() => handleAction(user.id, "suspend")}
                  className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                >
                  Suspend
                </button>
              ) : (
                <button
                  onClick={() => handleAction(user.id, "restore")}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Restore
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* No Users Found */}
      {filteredUsers.length === 0 && (
        <p className="text-center text-lg text-gray-500 dark:text-gray-400 mt-6">No users found.</p>
      )}
    </div>
  );
};

// Get Status Color
const getStatusColor = (status) => {
  switch (status) {
    case "Active":
      return "text-green-500";
    case "Pending":
      return "text-yellow-500";
    case "Suspended":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
};

export default User;
