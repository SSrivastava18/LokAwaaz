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

  // Preview only first 3 complaints
  const previewComplaints = complaints.slice(0, 3);

  // Handle See More navigation
  const handleSeeMore = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.warning("Please login first to view complaints.");
      return;
    }
    navigate("/view-complaints");
  };

  // Handle card click
  const handleCardClick = (complaint) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.warning("Please login first to view complaint details.");
      return;
    }
    navigate(`/complaint/${complaint._id}`, { state: complaint });
  };

  // Utility for scrolling
  const scrollToSection = (id) => {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="scroll-smooth">
      {/* 🌟 Hero Section */}
      <div
        id="homeSection"
        className="relative w-full h-screen flex items-center justify-center text-white m-0 p-0"
      >
        {/* Background Illustration */}
        <img
          className="w-full h-full object-cover absolute inset-0 -z-10 opacity-90 blur-sm mt-0"
          src={newHeroBackground}
          alt="Government building and citizens illustration"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gray-900 bg-opacity-20 -z-10"></div>

        {/* Frosted Glass Hero Card */}
        <div
          className="bg-white bg-opacity-20 backdrop-blur-lg p-8 md:p-12 rounded-3xl shadow-2xl max-w-2xl mx-4 text-center 
                     border border-blue-300 border-opacity-50 transition-all duration-300 hover:bg-opacity-30"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight text-white">
            Raise Your Voice, Fix Your City
          </h1>
          <p className="text-lg md:text-xl text-gray-100 mb-10 font-light">
            A platform for residents to register and keep track on day to day complaints
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 transition duration-300 px-6 py-3 text-white text-lg font-bold rounded-lg 
                         shadow-xl shadow-blue-400/50 transform hover:scale-105"
              onClick={() => scrollToSection("registerSection")}
            >
              <ListPlus className="w-5 h-5 mr-2" />
              Report an Issue
            </button>
            <button
              className="flex items-center justify-center bg-white text-blue-800 hover:bg-gray-100 transition duration-300 px-6 py-3 text-lg font-bold rounded-lg 
                         shadow-xl transform hover:scale-105"
              onClick={() => scrollToSection("complaintsSection")}
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Track a Report
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          className="absolute bottom-10 animate-bounce cursor-pointer"
          onClick={() => scrollToSection("complaintsSection")}
        >
          <ChevronDown className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* 📋 Complaints Preview Section */}
      <div
        id="complaintsSection"
        className="w-full min-h-screen bg-gray-100 px-4 sm:px-8 py-16"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 pb-3 border-b-2 border-blue-300 flex items-center">
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
                    className="cursor-pointer transition duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl rounded-xl"
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

          {/* See More Button */}
          {complaints.length > 3 && (
            <div className="mt-12 text-center">
              <button
                onClick={handleSeeMore}
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
              >
                View All Complaints
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 📝 Register Section */}
      <div
        id="registerSection"
        className="w-full min-h-screen bg-white py-16"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-extrabold text-blue-700 text-center mb-10">
            <ListPlus className="inline-block w-8 h-8 mr-2 -mt-1" />
            Make Your Voice Heard
          </h2>

          <div className="bg-gray-50 p-6 sm:p-10 rounded-xl shadow-2xl shadow-blue-100 border border-blue-50">
            <Register />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
