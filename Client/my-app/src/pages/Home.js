import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ComplaintsContext } from "../ComplaintsContext";
import Register from "./Register/Register";
import ComplaintCard from "../Components/ComaplaintCard";
import { toast } from "react-toastify";
import { ArrowRight, ChevronDown, ListPlus, TrendingUp } from "lucide-react";
import newHeroBackground from "../assets/img.png";

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

  const previewComplaints = complaints.slice(0, 3);

  const handleSeeMore = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.warning("Please login first to view complaints.");
      return;
    }
    navigate("/view-complaints");
  };

  const handleCardClick = (complaint) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.warning("Please login first to view complaint details.");
      return;
    }
    navigate(`/complaint/${complaint._id}`, { state: complaint });
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="scroll-smooth">
      {/* 🌆 Hero Section */}
      <div className="relative w-full h-screen flex items-center justify-center text-white overflow-hidden">
        <img
          src={newHeroBackground}
          alt="City background"
          className="absolute inset-0 w-full h-full object-cover scale-105 animate-slow-zoom -z-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70 -z-10"></div>

        {/* Hero Content */}
        <div className="bg-white/15 backdrop-blur-lg border border-white/30 p-10 rounded-3xl shadow-2xl text-center max-w-2xl mx-4 animate-fade-in">
          <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            Raise Your Voice, Fix Your City
          </h1>
          <p className="text-lg text-gray-200 mb-10">
            A platform for residents to register and track daily civic complaints with ease.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => scrollToSection("registerSection")}
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 px-6 py-3 text-white text-lg font-semibold rounded-full shadow-lg hover:scale-105 transition"
            >
              <ListPlus className="w-5 h-5 mr-2" />
              Report an Issue
            </button>
            <button
              onClick={() => scrollToSection("complaintsSection")}
              className="flex items-center justify-center bg-white/90 text-blue-700 hover:bg-gray-100 px-6 py-3 text-lg font-semibold rounded-full shadow-lg hover:scale-105 transition"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Track a Report
            </button>
          </div>
        </div>

        <div
          className="absolute bottom-10 animate-bounce cursor-pointer"
          onClick={() => scrollToSection("complaintsSection")}
        >
          <ChevronDown className="w-10 h-10 text-white opacity-90 hover:opacity-100 transition" />
        </div>
      </div>

      {/* 🧾 Complaints Section */}
      <div id="complaintsSection" className="bg-gray-50 py-16 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 flex items-center border-b-2 border-blue-300 pb-2">
            <TrendingUp className="w-8 h-8 mr-3 text-blue-600" />
            Latest Community Concerns
          </h2>
          <p className="text-lg text-gray-600 mb-10">
            See what your neighbors are reporting in real-time.
          </p>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {previewComplaints.length > 0 ? (
              previewComplaints.map((c) => {
                const voteInfo = {
                  count: c.votes,
                  upvoted: c.userHasUpvoted || false,
                  loading: upvoteLoading[c._id] || false,
                };
                return (
                  <div
                    key={c._id}
                    onClick={() => handleCardClick(c)}
                    className="cursor-pointer transition duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-2xl rounded-xl bg-white"
                  >
                    <ComplaintCard
                      complaint={c}
                      voteInfo={voteInfo}
                      handleUpvote={handleUpvote}
                    />
                  </div>
                );
              })
            ) : (
              <p className="col-span-full text-center text-gray-500 text-xl py-10">
                No recent complaints to display.
              </p>
            )}
          </div>

          {complaints.length > 3 && (
            <div className="mt-12 text-center">
              <button
                onClick={handleSeeMore}
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-blue-700 transition hover:scale-105"
              >
                View All Complaints
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 📝 Register Section */}
      <div id="registerSection" className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <h2 className="text-4xl font-extrabold text-blue-700 text-center mb-10">
            <ListPlus className="inline-block w-8 h-8 mr-2 -mt-1" />
            Make Your Voice Heard
          </h2>

          <div className="bg-gray-50 p-8 rounded-xl shadow-2xl shadow-blue-100 border border-blue-50">
            <Register />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
