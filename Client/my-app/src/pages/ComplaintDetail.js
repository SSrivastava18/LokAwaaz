import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ComplaintDetail() {
  const { state: complaint } = useLocation();
  const navigate = useNavigate();
  const media = complaint.media || [];
  const [currentIndex, setCurrentIndex] = useState(0);

  // 🔹 Comment state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const API_BASE = "http://localhost:5000"; // 👈 Change here if backend URL differs

  // Fetch comments from backend
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`${API_BASE}/comments/${complaint._id}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (data.success) {
          setComments(data.comments);
        }
      } catch (err) {
        console.error("❌ Error fetching comments:", err);
      }
    };
    fetchComments();
  }, [complaint._id]);

  // Handle adding comment
  const handleAddComment = async () => {
    if (newComment.trim() === "") return;
    try {
      const res = await fetch(`${API_BASE}/comments/${complaint._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newComment, author: "User" }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      if (data.success) {
        setComments((prev) => [data.comment, ...prev]);
        setNewComment("");
      } else {
        console.error("❌ Failed to add comment:", data.message);
      }
    } catch (err) {
      console.error("❌ Error posting comment:", err);
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 mb-6 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full shadow flex items-center gap-2 transition"
      >
        ← Back
      </button>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {complaint.title}
      </h1>

      {/* Media + Info in Two Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Media Slider */}
        {media.length > 0 ? (
          <div className="relative w-full h-96 flex items-center justify-center bg-white rounded-lg overflow-hidden">
            {media[currentIndex].type === "image" ? (
              <img
                src={media[currentIndex].url}
                alt={`complaint-media-${currentIndex}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <video
                src={media[currentIndex].url}
                controls
                className="w-full h-full object-contain"
              />
            )}

            {/* Left Button */}
            <button
              onClick={handlePrev}
              className="absolute left-2 bg-white/70 hover:bg-white text-gray-800 p-2 rounded-full shadow"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Right Button */}
            <button
              onClick={handleNext}
              className="absolute right-2 bg-white/70 hover:bg-white text-gray-800 p-2 rounded-full shadow"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-3 flex gap-2">
              {media.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-3 h-3 rounded-full ${
                    i === currentIndex ? "bg-blue-600" : "bg-gray-300"
                  }`}
                ></button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 italic">No media uploaded</p>
        )}

        {/* Info Card */}
        <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col justify-center">
          <p className="mb-3">
            <span className="font-semibold">Status:</span>{" "}
            <span
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                complaint.status === "Pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : complaint.status === "Resolved"
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {complaint.status}
            </span>
          </p>
          <p className="mb-2">
            <span className="font-semibold">Category:</span>{" "}
            {complaint.category}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Location:</span>{" "}
            {complaint.location}
          </p>
          <p>
            <span className="font-semibold">Contact Info:</span>{" "}
            {complaint.contactInfo || "Not provided"}
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="bg-blue-50 p-4 rounded-xl shadow mb-8">
        <p>
          <span className="font-semibold">Description:</span>{" "}
          {complaint.description}
        </p>
      </div>

      {/* 💬 Comments Section */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">💬 Comments</h2>

        {/* Comment List */}
        {comments.length === 0 ? (
          <p className="text-gray-500 italic">No comments yet. Be the first!</p>
        ) : (
          <ul className="space-y-3 mb-4">
            {comments.map((c) => (
              <li
                key={c._id}
                className="p-3 border rounded-lg bg-gray-50 shadow-sm"
              >
                <p className="text-gray-800">{c.text}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(c.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}

        {/* Add Comment */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleAddComment}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
