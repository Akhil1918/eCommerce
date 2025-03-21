import React, { useEffect, useState } from "react";
import { FaUsers, FaChartLine, FaShoppingCart, FaDollarSign, FaEye, FaComments, FaExclamationTriangle } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const PlatformAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSales: 0,
    totalEarnings: 0,
    dailyViews: 0,
    comments: 0,
    reports: 0,
    userGrowth: [],
  });

  useEffect(() => {
    const fetchAnalytics = () => {
      fetch("/api/analytics") // Replace with actual API endpoint
        .then((res) => res.json())
        .then((data) => setAnalytics(data))
        .catch((err) => console.error(err));
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // Auto-refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const userGrowthData = {
    labels: analytics.userGrowth.map((entry) => entry.date),
    datasets: [
      {
        label: "User Growth",
        data: analytics.userGrowth.map((entry) => entry.count),
        borderColor: "#4F46E5",
        backgroundColor: "rgba(79, 70, 229, 0.2)",
        fill: true,
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">📊 Platform Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard title="Total Users" value={analytics.totalUsers} icon={<FaUsers />} color="blue" growth="5%" />
        <StatCard title="Active Users" value={analytics.activeUsers} icon={<FaChartLine />} color="green" growth="3%" />
        <StatCard title="Total Sales" value={analytics.totalSales} icon={<FaShoppingCart />} color="yellow" growth="7%" />
        <StatCard title="Total Earnings" value={`$${analytics.totalEarnings}`} icon={<FaDollarSign />} color="purple" growth="10%" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard title="Daily Views" value={analytics.dailyViews} icon={<FaEye />} color="blue" growth="8%" />
        <StatCard title="Comments" value={analytics.comments} icon={<FaComments />} color="yellow" growth="12%" />
        <StatCard title="Reports" value={analytics.reports} icon={<FaExclamationTriangle />} color="red" growth="-2%" />
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">📈 User Growth Over Time</h3>
        <Line data={userGrowthData} />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, growth }) => {
  const colors = {
    blue: "border-blue-500 text-blue-500",
    green: "border-green-500 text-green-500",
    yellow: "border-yellow-500 text-yellow-500",
    purple: "border-purple-500 text-purple-500",
    red: "border-red-500 text-red-500",
  };

  return (
    <div className={`p-6 shadow-lg rounded-lg flex items-center justify-between border-l-4 ${colors[color]} bg-white hover:shadow-xl transition-transform`}>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-3xl font-bold">{value}</p>
        <p className={`text-sm font-semibold ${growth.startsWith("-") ? "text-red-500" : "text-green-500"}`}>
          {growth.startsWith("-") ? "📉" : "📈"} {growth}
        </p>
      </div>
      <div className={`text-3xl ${colors[color]}`}>{icon}</div>
    </div>
  );
};

export default PlatformAnalytics;
