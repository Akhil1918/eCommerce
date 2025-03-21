import React, { useEffect, useState } from "react";
import { FaExclamationCircle, FaCheckCircle, FaTimesCircle, FaFlag } from "react-icons/fa";

const DisputesReports = () => {
  const [disputes, setDisputes] = useState([]);
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/disputes") // Replace with actual API endpoint
      .then((res) => res.json())
      .then((data) => setDisputes(data))
      .catch((err) => console.error(err));

    fetch("/api/reports") // Replace with actual API endpoint
      .then((res) => res.json())
      .then((data) => setReports(data))
      .catch((err) => console.error(err));
  }, []);

  const filteredDisputes = disputes.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const filteredReports = reports.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Disputes & Reports Management</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search disputes or reports..."
        className="w-full p-3 mb-4 border rounded-lg"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Disputes Section */}
      <h2 className="text-2xl font-semibold mb-4">Disputes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredDisputes.length > 0 ? (
          filteredDisputes.map((item) => <DisputeReportCard key={item.id} data={item} type="dispute" />)
        ) : (
          <p className="text-gray-500">No disputes found.</p>
        )}
      </div>

      {/* Reports Section */}
      <h2 className="text-2xl font-semibold mb-4">Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.length > 0 ? (
          filteredReports.map((item) => <DisputeReportCard key={item.id} data={item} type="report" />)
        ) : (
          <p className="text-gray-500">No reports found.</p>
        )}
      </div>
    </div>
  );
};

const DisputeReportCard = ({ data, type }) => {
  const statusColors = {
    pending: "text-yellow-500 border-yellow-500",
    resolved: "text-green-500 border-green-500",
    rejected: "text-red-500 border-red-500",
  };

  const statusIcons = {
    pending: <FaExclamationCircle />,
    resolved: <FaCheckCircle />,
    rejected: <FaTimesCircle />,
  };

  return (
    <div className="p-6 shadow-lg rounded-lg border bg-white hover:scale-105 transition-transform">
      <h3 className="text-lg font-semibold mb-2">{data.title}</h3>
      <p className="text-gray-600 mb-4">{data.description}</p>
      <div className={`flex items-center gap-2 text-lg font-semibold border-l-4 pl-2 ${statusColors[data.status]}`}>
        {statusIcons[data.status]} {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
      </div>
      <div className="mt-4 flex items-center gap-2 text-gray-500">
        {type === "dispute" ? <FaExclamationCircle /> : <FaFlag />}
        <span className="font-medium">{type === "dispute" ? "Dispute" : "Report"}</span>
      </div>
    </div>
  );
};

export default DisputesReports;
