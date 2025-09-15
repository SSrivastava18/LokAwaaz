import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ComplaintsContext } from "../ComplaintsContext";
import Register from "./Register/Register";
import ComplaintCard from "../Components/ComaplaintCard";

const Home = () => {
  const { complaints } = useContext(ComplaintsContext);
  const navigate = useNavigate();

  // Votes state (shared with ViewComplaints)
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

  // Only first 3 complaints for preview
  const previewComplaints = complaints.slice(0, 3);

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth">
      {/* 🌟 Hero Section */}
      <div
        id="homeSection"
        className="relative w-full h-screen snap-start scroll-mt-20"
      >
        <img
          className="w-full h-full object-cover absolute inset-0 -z-10"
          src="nayaakBg.png"
          alt="Background"
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col sm:flex-row gap-4 mt-80">
            {/* Scroll to Register Section */}
            <button
              className="bg-blue-950 px-6 py-3 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-blue-900"
              onClick={() =>
                document.getElementById("registerSection").scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              Report an Issue
            </button>

            {/* Scroll to Complaints Section */}
            <button
              className="bg-gray-200 px-6 py-3 text-blue-950 text-lg font-semibold rounded-lg shadow-lg hover:bg-gray-300"
              onClick={() =>
                document.getElementById("complaintsSection").scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              Track a Report
            </button>
          </div>
        </div>
      </div>

      {/* 📋 Complaints Preview Section */}
      <div
        id="complaintsSection"
        className="w-full min-h-screen bg-gray-50 snap-start scroll-mt-20 px-6 py-12"
      >
        <h2 className="text-2xl font-bold mb-6">📋 Latest Complaints</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {previewComplaints.map((c) => {
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

        {/* See More */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/view-complaints")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            See More
          </button>
        </div>
      </div>

      {/* 📝 Register Section */}
      <div
        id="registerSection"
        className="w-full min-h-screen bg-white snap-start scroll-mt-20"
      >
        <Register />
      </div>
    </div>
  );
};

export default Home;
