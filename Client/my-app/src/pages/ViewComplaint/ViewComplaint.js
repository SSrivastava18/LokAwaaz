import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ComplaintsContext } from "../../ComplaintsContext";
import { ArrowUp } from "lucide-react";

export default function ViewComplaints() {
  const { complaints, setComplaints } = useContext(ComplaintsContext);
  const navigate = useNavigate();

  // Fetch complaints from backend on mount
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await fetch("/api/complaints");
        const data = await res.json();
        if (data.success) {
          setComplaints(data.data);  // Populate context with backend data
        } else {
          console.error("Failed to fetch complaints:", data.message);
        }
      } catch (err) {
        console.error("Error fetching complaints:", err);
      }
    };

    fetchComplaints();
  }, [setComplaints]);

  // Load votes from localStorage or initialize with 0
  const [votes, setVotes] = useState(() => {
    const savedVotes = localStorage.getItem("complaintVotes");
    return savedVotes ? JSON.parse(savedVotes) : [];
  });

  // Save votes to localStorage whenever votes change
  useEffect(() => {
    localStorage.setItem("complaintVotes", JSON.stringify(votes));
  }, [votes]);

  const handleUpvote = (index, e) => {
    e.stopPropagation(); // prevent navigation
    setVotes((prev) => {
      const newVotes = [...prev];
      newVotes[index] = (newVotes[index] || 0) + 1;
      return newVotes;
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Heading */}
      <h2 className="text-3xl font-bold text-gray-800 mb-2">
        📋 Keep Track of Complaints
      </h2>
      <p className="text-gray-600 mb-6">
        View the latest registered complaints, track their progress, and check
        the status of issues in your area. Use the search to quickly find
        complaints by location.
      </p>

      {/* Search Bar */}
      <div className="flex gap-2 mb-8">
        <input
          type="text"
          placeholder="Search complaints by location..."
          className="flex-1 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition">
          Search
        </button>
      </div>

      {/* Complaints Grid */}
      {complaints.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          🚫 No complaints found.
          <p className="text-sm text-gray-400">
            Be the first to register a complaint in your area.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {complaints.map((c, index) => (
            <div
              key={c._id}
              onClick={() => navigate(`/complaint/${c._id}`, { state: c })}
              className="cursor-pointer bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition flex flex-col"
            >
              {/* Image */}
              <img
                src={
                  c.media && c.media.length > 0
                    ? c.media[0].url
                    : "/default-placeholder.png"
                }
                alt="complaint"
                className="w-full h-48 object-cover"
              />

              {/* Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-800 mb-2">
                    {c.title}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    Status:{" "}
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        c.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : c.status === "Resolved"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {c.status}
                    </span>
                  </p>
                </div>

                <button
                  onClick={(e) => handleUpvote(index, e)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition w-fit"
                >
                  <ArrowUp className="w-4 h-4 text-blue-600" />
                  Upvote <span className="text-blue-600">{votes[index] || 0}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
