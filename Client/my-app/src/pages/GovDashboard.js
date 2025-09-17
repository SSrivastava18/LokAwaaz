import React, { useEffect, useState } from "react";
import axios from "axios";

export default function GovDashboard() {
  const [complaints, setComplaints] = useState([]);
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
      const res = await axios.get("http://localhost:5000/api/government/complaints", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allComplaints = res.data.data;
      setComplaints(allComplaints);

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

  if (loading) return <p style={{ padding: "24px" }}>Loading complaints...</p>;

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", backgroundColor: "#f0f2f5" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "20px", color: "#333" }}>
        Government Dashboard
      </h1>

      {message && <p style={{ color: "red", marginBottom: "16px" }}>{message}</p>}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "30px",
          gap: "20px",
        }}
      >
        <div
          style={{
            flex: 1,
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            background: "#fff",
            textAlign: "center",
          }}
        >
          <h3 style={{ fontSize: "16px", color: "#666", marginBottom: "8px" }}>Total Complaints</h3>
          <p style={{ fontSize: "32px", fontWeight: "bold", color: "#333" }}>
            {counts.total}
          </p>
        </div>
        <div
          style={{
            flex: 1,
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            background: "#fff",
            textAlign: "center",
          }}
        >
          <h3 style={{ fontSize: "16px", color: "#666", marginBottom: "8px" }}>Pending</h3>
          <p style={{ fontSize: "32px", fontWeight: "bold", color: "#ef4444" }}>
            {counts.pending}
          </p>
        </div>
        <div
          style={{
            flex: 1,
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            background: "#fff",
            textAlign: "center",
          }}
        >
          <h3 style={{ fontSize: "16px", color: "#666", marginBottom: "8px" }}>
            Work in Progress
          </h3>
          <p style={{ fontSize: "32px", fontWeight: "bold", color: "#f97316" }}>
            {counts.inProgress}
          </p>
        </div>
        <div
          style={{
            flex: 1,
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            background: "#fff",
            textAlign: "center",
          }}
        >
          <h3 style={{ fontSize: "16px", color: "#666", marginBottom: "8px" }}>Resolved</h3>
          <p style={{ fontSize: "32px", fontWeight: "bold", color: "#22c55e" }}>
            {counts.resolved}
          </p>
        </div>
      </div>

      {complaints.length === 0 ? (
        <p>No complaints available.</p>
      ) : (
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
                padding: "20px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column",
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
                    marginBottom: "16px",
                  }}
                />
              )}
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#333", marginBottom: "4px" }}>
                {c.title}
              </h3>
              <p style={{ fontSize: "14px", color: "#555", marginBottom: "8px" }}>
                {c.description}
              </p>
              <p style={{ fontSize: "14px", marginTop: "6px" }}>
                <b>Category:</b> {c.category} | <b>Urgency:</b> {c.urgency}
              </p>
              <p style={{ fontSize: "14px", marginTop: "4px" }}>
                <b>Location:</b> {c.location}
              </p>
              <p style={{ fontSize: "14px", marginTop: "4px" }}>
                <b>Citizen:</b> {c.user?.name || "Unknown"}
              </p>
              <div style={{ marginTop: "12px", display: "flex", alignItems: "center" }}>
                <b>Status:</b>{" "}
                <span
                  style={{
                    marginLeft: "8px",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontWeight: "600",
                    color: "#fff",
                    backgroundColor:
                      c.status === "Pending"
                        ? "#ef4444"
                        : c.status === "Work in Progress"
                        ? "#f97316"
                        : "#22c55e",
                  }}
                >
                  {c.status}
                </span>
              </div>
              <select
                value={c.status}
                onChange={(e) => updateStatus(c._id, e.target.value)}
                style={{
                  marginTop: "12px",
                  padding: "8px",
                  width: "100%",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                }}
              >
                <option value="Pending">Pending</option>
                <option value="Work in Progress">Work in Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}