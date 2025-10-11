import React, { useEffect, useState } from "react";
import axios from "axios";

export default function GovDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });

  const token = localStorage.getItem("govtToken") || "";

  useEffect(() => {
    if (!token) {
      alert("Please login first");
      window.location.href = "/gov-login";
      return;
    }
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:5000/api/government/complaints",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const allComplaints = res.data.data;
      setComplaints(allComplaints);
      setFilteredComplaints(allComplaints);

      const pendingCount = allComplaints.filter(c => c.status === "Pending").length;
      const inProgressCount = allComplaints.filter(c => c.status === "Work in Progress").length;
      const resolvedCount = allComplaints.filter(c => c.status === "Resolved").length;

      setCounts({
        total: allComplaints.length,
        pending: pendingCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
      });
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setMessage("Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/government/complaints/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchComplaints();
    } catch (err) {
      console.error("Error updating status:", err);
      setMessage("Failed to update complaint status.");
    }
  };

  const handleFilterChange = (status) => {
    setActiveFilter(status);
    if (status === "All") {
      setFilteredComplaints(complaints);
    } else {
      setFilteredComplaints(complaints.filter(c => c.status === status));
    }
  };

  if (loading) return <p className="p-6 text-lg">Loading complaints...</p>;

  return (
    <div className="min-h-screen bg-[#f4f6f9] p-6 font-sans">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Government Dashboard</h1>

      {message && <p className="text-red-500 mb-4">{message}</p>}

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Complaints" value={counts.total} color="text-gray-800" />
        <StatCard title="Pending" value={counts.pending} color="text-red-500" />
        <StatCard title="Work in Progress" value={counts.inProgress} color="text-orange-500" />
        <StatCard title="Resolved" value={counts.resolved} color="text-green-600" />
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        {["All", "Pending", "Work in Progress", "Resolved"].map(status => (
          <button
            key={status}
            onClick={() => handleFilterChange(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition 
              ${
                activeFilter === status
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
              }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Complaints List */}
      {filteredComplaints.length === 0 ? (
        <p className="text-gray-500 text-lg">No complaints found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredComplaints.map(c => (
            <div
              key={c._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col overflow-hidden"
            >
              {c.media?.[0]?.url && (
                <img
                  src={c.media[0].url}
                  alt={c.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{c.title}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{c.description}</p>

                <p className="text-sm text-gray-700 mb-1">
                  <b>Category:</b> {c.category} | <b>Urgency:</b> {c.urgency}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  <b>Location:</b> {c.location}
                </p>
                <p className="text-sm text-gray-700 mb-3">
                  <b>Citizen:</b> {c.user?.name || "Unknown"}
                </p>

                <div className="flex items-center mb-3">
                  <b className="text-sm mr-2">Status:</b>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      c.status === "Pending"
                        ? "bg-red-500 text-white"
                        : c.status === "Work in Progress"
                        ? "bg-orange-500 text-white"
                        : "bg-green-600 text-white"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <select
                  value={c.status}
                  onChange={e => updateStatus(c._id, e.target.value)}
                  className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Work in Progress">Work in Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-5 text-center hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-sm text-gray-600 mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
