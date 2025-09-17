import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ComplaintsContext } from "../ComplaintsContext";
import Register from "./Register/Register";
import ComplaintCard from "../Components/ComaplaintCard";
import { toast } from "react-toastify";

const Home = () => {
  const { complaints, setComplaints, apiUrl } = useContext(ComplaintsContext);
  const navigate = useNavigate();

  const [upvoteLoading, setUpvoteLoading] = useState({});

  // Handle upvote
  const handleUpvote = async (id, e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");

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

      toast[data.userHasUpvoted ? "success" : "info"](
        data.userHasUpvoted ? "Upvoted!" : "Upvote removed."
      );
    } catch (error) {
      console.error("Upvote error:", error);
      toast.error("Error while toggling upvote.");
    } finally {
      setUpvoteLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Preview only first 3 complaints
  const previewComplaints = complaints.slice(0, 3);

  // ✅ Handle See More navigation
  const handleSeeMore = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.warning("Please login first to view complaints.");
      return; // 🚫 stop navigation
    }
    navigate("/view-complaints");
  };

  // ✅ Handle card click
  const handleCardClick = (complaint) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.warning("Please login first to view complaint details.");
      return; // 🚫 block navigation
    }
    navigate(`/complaint/${complaint._id}`, { state: complaint });
  };

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
            const voteInfo = {
              count: c.votes,
              upvoted: c.userHasUpvoted || false,
              loading: upvoteLoading[c._id] || false,
            };
            return (
              <div key={c._id} onClick={() => handleCardClick(c)}>
                <ComplaintCard
                  complaint={c}
                  voteInfo={voteInfo}
                  handleUpvote={handleUpvote}
                />
              </div>
            );
          })}
        </div>

        {/* See More */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSeeMore}
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
