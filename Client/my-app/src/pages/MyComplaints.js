import React, { useContext, useEffect, useState } from "react";
import { ComplaintsContext } from "../ComplaintsContext";
import ComplaintCard from "../Components/ComaplaintCard";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function MyComplaints() {
  const { token, apiUrl } = useContext(ComplaintsContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upvoteLoading, setUpvoteLoading] = useState({});
  const navigate = useNavigate();

  // Fetch user complaints
  const fetchMyComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/complaints/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      if (data.success) {
        setComplaints(data.data);
      } else {
        toast.error("❌ Failed to load complaints");
      }
    } catch (err) {
      console.error("❌ Error fetching my complaints:", err);
      toast.error("❌ Error loading complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      toast.warning("⚠ Please login first to view your complaints.");
      navigate("/home");
      return;
    }
    fetchMyComplaints();
  }, [token, navigate, apiUrl]);

  // Upvote handler
  const handleUpvote = async (id, e) => {
    e.stopPropagation(); // Prevent card click
    if (!token) {
      toast.warning("Please login first to upvote complaints.");
      return;
    }

    setUpvoteLoading((prev) => ({ ...prev, [id]: true }));

    try {
      const res = await fetch(`${apiUrl}/complaints/${id}/upvote`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Something went wrong");
        return;
      }

      setComplaints((prev) =>
        prev.map((c) =>
          c._id === id ? { ...c, votes: data.votes, userHasUpvoted: data.userHasUpvoted } : c
        )
      );

      toast[data.userHasUpvoted ? "success" : "info"](data.userHasUpvoted ? "Upvoted!" : "Upvote removed.");
    } catch (err) {
      console.error("Upvote error:", err);
      toast.error("Error while toggling upvote.");
    } finally {
      setUpvoteLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Navigate to complaint detail
  const handleCardClick = (complaint) => {
    navigate(`/complaint/${complaint._id}`, { state: complaint });
  };

  // Handle deleting a complaint
  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevent card click
    if (!window.confirm("Are you sure you want to delete this complaint?")) return;

    try {
      const res = await fetch(`${apiUrl}/complaints/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Complaint deleted successfully!");
        fetchMyComplaints(); // Refresh the list
      } else {
        toast.error(data.message || "Failed to delete complaint");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Error deleting complaint");
    }
  };

  if (loading) {
    return <p className="p-6 text-center text-gray-600">⏳ Loading your complaints...</p>;
  }

  if (complaints.length === 0) {
    return <p className="p-6 text-center text-gray-600">🚫 You have not registered any complaints yet.</p>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">📋 My Complaints</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {complaints.map((c) => {
          const voteInfo = {
            count: c.votes || 0,
            upvoted: c.userHasUpvoted || false,
            loading: upvoteLoading[c._id] || false,
          };

          return (
            <div key={c._id} onClick={() => handleCardClick(c)}>
              <ComplaintCard
                complaint={c}
                voteInfo={voteInfo}
                handleUpvote={handleUpvote}
                handleDelete={(e) => handleDelete(c._id, e)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
