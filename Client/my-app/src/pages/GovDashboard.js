import React, { useEffect, useState } from "react";
import axios from "axios";

export default function GovDashboard() {
  const [complaints, setComplaints] = useState([]);

  // ⚡ No need for hardcoded token anymore because isGovernment middleware injects the user directly
  // But keeping the token header for API consistency
  const token = "temporary-dev-token"; // Can be any non-empty string now

  // Fetch all complaints (government API)
  const fetchComplaints = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/government/complaints", {
        headers: { Authorization: `Bearer ${token}` }, // Header required but content irrelevant in this temporary setup
      });

      setComplaints(res.data.data);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Update complaint status
  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/government/complaints/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }  // Same temporary token
      );

      fetchComplaints(); // Refresh after status update
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
        Government Dashboard
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {complaints.map((c) => (
          <div
            key={c._id}
            style={{
              background: "#fff",
              borderRadius: "10px",
              padding: "16px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            {c.media?.[0]?.url && (
              <img
                src={c.media[0].url}
                alt={c.title}
                style={{
                  width: "100%",
                  height: "180px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            )}

            <h3 style={{ marginTop: "12px", fontWeight: "600" }}>{c.title}</h3>
            <p style={{ fontSize: "14px", color: "#555" }}>{c.description}</p>
            <p style={{ fontSize: "14px", marginTop: "6px" }}>
              <b>Category:</b> {c.category} | <b>Urgency:</b> {c.urgency}
            </p>
            <p style={{ fontSize: "14px", marginTop: "4px" }}>
              <b>Location:</b> {c.location}
            </p>
            <p style={{ fontSize: "14px", marginTop: "4px" }}>
              <b>Citizen:</b> {c.user?.name || "Unknown"}
            </p>
            <p style={{ marginTop: "8px" }}>
              <b>Status:</b>{" "}
              <span style={{ color: "#1e40af", fontWeight: "600" }}>{c.status}</span>
            </p>

            {/* Dropdown to update status */}
            <select
              value={c.status}
              onChange={(e) => updateStatus(c._id, e.target.value)}
              style={{
                marginTop: "12px",
                padding: "8px",
                width: "100%",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            >
              <option value="Pending">Pending</option>
              <option value="Work in Progress">Work in Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
