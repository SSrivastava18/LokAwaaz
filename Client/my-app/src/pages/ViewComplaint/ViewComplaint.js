import React, { useContext, useState, useEffect } from "react";
import { ComplaintsContext } from "../../ComplaintsContext";
import ComplaintCard from "./../../Components/ComaplaintCard";

export default function ViewComplaints() {
  const { complaints, setComplaints } = useContext(ComplaintsContext);

  // Fetch complaints from backend
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await fetch("/api/complaints");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (data.success) setComplaints(data.data);
      } catch (err) {
        console.error("Error fetching complaints:", err);
      }
    };
    fetchComplaints();
  }, [setComplaints]);

  // Votes state
  const [votes, setVotes] = useState(() => {
    try {
      const savedVotes = localStorage.getItem("complaintVotes");
      return savedVotes ? JSON.parse(savedVotes) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("complaintVotes", JSON.stringify(votes));
  }, [votes]);

  const handleUpvote = (id, e) => {
    e.stopPropagation();
    setVotes((prev) => {
      const newVotes = { ...prev };
      if (newVotes[id]?.upvoted) {
        newVotes[id] = { count: (newVotes[id].count || 1) - 1, upvoted: false };
      } else {
        newVotes[id] = { count: (newVotes[id]?.count || 0) + 1, upvoted: true };
      }
      return newVotes;
    });
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

      {complaints.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          🚫 No complaints found.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {complaints.map((c) => {
            const voteInfo = votes[c._id] || { count: 0, upvoted: false };
            return (
              <ComplaintCard
                key={c._id}
                complaint={c}
                voteInfo={voteInfo}
                handleUpvote={handleUpvote}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
