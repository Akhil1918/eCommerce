import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import {
  FaUsers,
  FaChartBar,
  FaExclamationTriangle,
  FaSignOutAlt,
  FaEye,
  FaShoppingCart,
  FaComments,
  FaDollarSign,
  FaMoon,
  FaSun,
} from "react-icons/fa";

const AdminDashboard = () => {
  const [isSidebarOpen] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Clear authentication
    localStorage.removeItem("user");
    navigate("/login"); // Redirect to login page
  };

  return (
    <div
      className={`flex min-h-screen transition-all duration-500 ${
        theme === "dark"
          ? "bg-black text-gray-300"
          : "bg-[rgba(66,99,235,0.4)] text-gray-900"
      }`}
    >
      {/* Sidebar */}
      <div
        className={`p-5 w-64 ${
          theme === "dark"
            ? "bg-black text-gray-300"
            : "bg-[rgba(92, 92, 93, 0.4)] text-black"
        } min-h-screen transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-64"
        } md:translate-x-0`}
      >
        <h2 className="text-3xl font-extrabold mb-8 text-center">Admin Panel</h2>
        <ul className="space-y-4">
          <li className="p-4 flex items-center hover:bg-blue-600 rounded-lg cursor-pointer transition-all duration-300">
            <Link to="/User" className="flex items-center w-full">
              <FaUsers className="mr-3 text-xl" /> User & Seller Management
            </Link>
          </li>
          <li className="p-4 flex items-center hover:bg-green-600 rounded-lg cursor-pointer transition-all duration-300">
            <Link to="/analytics" className="flex items-center w-full">
              <FaChartBar className="mr-3 text-xl" /> Platform Analytics
            </Link>
          </li>
          <li className="p-4 flex items-center hover:bg-yellow-600 rounded-lg cursor-pointer transition-all duration-300">
            <Link to="/disputes" className="flex items-center w-full">
              <FaExclamationTriangle className="mr-3 text-xl" /> Dispute & Reports
            </Link>
          </li>
          {/* Logout Button */}
          <li
            className="p-4 flex items-center hover:bg-red-600 rounded-lg cursor-pointer transition-all duration-300 text-white bg-red-500"
            onClick={handleLogout} // Call handleLogout on click
          >
            <FaSignOutAlt className="mr-3 text-xl" /> Logout
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div
              className={`p-6 shadow-lg rounded-lg flex items-center justify-between border-l-4 border-blue-500 ${
                theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-white"
              }`}
            >
              <div>
                <h3 className="text-lg font-semibold">Daily Views</h3>
                <p className="text-3xl font-bold">1,504</p>
              </div>
              <FaEye className="text-blue-500 text-3xl" />
            </div>
            <div
              className={`p-6 shadow-lg rounded-lg flex items-center justify-between border-l-4 border-green-500 ${
                theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-white"
              }`}
            >
              <div>
                <h3 className="text-lg font-semibold">Sales</h3>
                <p className="text-3xl font-bold">80</p>
              </div>
              <FaShoppingCart className="text-green-500 text-3xl" />
            </div>
            <div
              className={`p-6 shadow-lg rounded-lg flex items-center justify-between border-l-4 border-yellow-500 ${
                theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-white"
              }`}
            >
              <div>
                <h3 className="text-lg font-semibold">Comments</h3>
                <p className="text-3xl font-bold">284</p>
              </div>
              <FaComments className="text-yellow-500 text-3xl" />
            </div>
            <div
              className={`p-6 shadow-lg rounded-lg flex items-center justify-between border-l-4 border-purple-500 ${
                theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-white"
              }`}
            >
              <div>
                <h3 className="text-lg font-semibold">Earnings</h3>
                <p className="text-3xl font-bold">$7,842</p>
              </div>
              <FaDollarSign className="text-purple-500 text-3xl" />
            </div>
          </div>

          {/* Recent Orders Table */}
          <div
            className={`p-6 shadow-lg rounded-lg ${
              theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-white"
            }`}
          >
            <h3 className="text-xl font-bold mb-4">Recent Orders</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr
                  className={`${
                    theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-200"
                  }`}
                >
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Price</th>
                  <th className="p-3 text-left">Payment</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-3">Star Refrigerator</td>
                  <td className="p-3">$1200</td>
                  <td className="p-3">Paid</td>
                  <td className="p-3 text-green-500">Delivered</td>
                </tr>
                <tr className="border-t">
                  <td className="p-3">Dell Laptop</td>
                  <td className="p-3">$110</td>
                  <td className="p-3">Due</td>
                  <td className="p-3 text-yellow-500">Pending</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
