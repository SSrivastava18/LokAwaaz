import React, { useContext, useEffect, useState } from "react";
import { ComplaintsContext } from "../../ComplaintsContext";
import ComplaintCard from "./../../Components/ComaplaintCard";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function ViewComplaints() {
  const { complaints, setComplaints, apiUrl, token } = useContext(ComplaintsContext);
  const [loading, setLoading] = useState(true);
  const [upvoteLoading, setUpvoteLoading] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/complaints`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (data.success) {
          setComplaints(data.data);
        } else {
          toast.error("Failed to load complaints.");
        }
      } catch (err) {
        console.error("Error fetching complaints:", err);
        toast.error("Error fetching complaints.");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [apiUrl, token, setComplaints]);

  const handleUpvote = async (id, e) => {
    e.stopPropagation();

    if (!token) {
      toast.warning("Please login first to upvote complaints.");
      return;
    }

    setUpvoteLoading((prev) => ({ ...prev, [id]: true }));

    try {
      const response = await fetch(`${apiUrl}/complaints/${id}/upvote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.message || "Something went wrong");
        return;
      }

      setComplaints((prev) =>
        prev.map((c) =>
          c._id === id
            ? { ...c, votes: data.votes, userHasUpvoted: data.userHasUpvoted }
            : c
        )
      );

      if (data.userHasUpvoted) {
        toast.success("Upvoted!");
      } else {
        toast.info("Upvote removed.");
      }
    } catch (error) {
      console.error("Upvote error:", error);
      toast.error("Error while toggling upvote.");
    } finally {
      setUpvoteLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleCardClick = (complaint) => {
    if (!token) return; // 🚫 do nothing if not logged in
    navigate(`/complaint/${complaint._id}`, { state: complaint });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">
        📋 Keep Track of Complaints
      </h2>
      <p className="text-gray-600 mb-6">
        View the latest registered complaints, track their progress, and check
        the status of issues in your area.
      </p>

      {loading ? (
        <div className="text-center text-gray-500 mt-10">⏳ Loading complaints...</div>
      ) : complaints.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          🚫 No complaints found.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {complaints.map((c) => {
            const voteInfo = {
              count: c.votes || 0,
              upvoted: c.userHasUpvoted || false,
              loading: upvoteLoading[c._id] || false,
            };
            return (
              <div
                key={c._id}
                className={token ? "cursor-pointer" : "cursor-not-allowed opacity-70"}
                onClick={() => handleCardClick(c)}
              >
                <ComplaintCard
                  complaint={c}
                  voteInfo={voteInfo}
                  handleUpvote={handleUpvote}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
