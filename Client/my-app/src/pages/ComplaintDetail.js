import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ComplaintsContext } from "../ComplaintsContext";
import { toast } from "react-toastify";

export default function ComplaintDetail() {
  const { token, user } = useContext(ComplaintsContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [complaint, setComplaint] = useState(location.state || null);

  // 🔹 States for editing comments
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");

  const media = complaint?.media || [];
  const API_BASE = "http://localhost:5000";
  const isOwner = user && complaint?.user?._id === user._id;

  useEffect(() => {
    if (!token) {
      toast.warning("Please login first to view complaint details.");
      navigate("/view-complaints");
    }
  }, [token, navigate]);

  // Fetch comments
  useEffect(() => {
    if (!complaint?._id) return;
    const fetchComments = async () => {
      try {
        const res = await fetch(`${API_BASE}/comments/${complaint._id}`);
        const data = await res.json();
        if (data.success) setComments(data.comments);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };
    fetchComments();
  }, [complaint?._id]);

  // Update complaint if coming back from edit
  useEffect(() => {
    if (location.state?.updatedComplaint) {
      setComplaint(location.state.updatedComplaint);
    }
  }, [location.state]);

  const handlePrev = () =>
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  const handleNext = () =>
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));

  const handleEdit = () => {
    navigate(`/edit-complaint/${complaint._id}`, {
      state: { complaint, isEdit: true },
    });
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this complaint?"))
      return;
    try {
      const res = await fetch(`${API_BASE}/complaints/${complaint._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Complaint deleted successfully.");
        navigate("/my-complaints");
      } else {
        toast.error(data.message || "Failed to delete complaint.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting complaint.");
    }
  };

  // ================= Submit comment =================
  const handleAddComment = async () => {
    if (!commentText.trim()) return toast.warning("Comment cannot be empty.");
    try {
      const res = await fetch(`${API_BASE}/comments/${complaint._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: commentText }),
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => [data.comment, ...prev]);
        setCommentText("");
        toast.success("Comment added!");
      } else {
        toast.error(data.message || "Failed to add comment.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error adding comment.");
    }
  };

  // ================= Delete comment =================
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;
    try {
      const res = await fetch(`${API_BASE}/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        toast.success("Comment deleted.");
      } else {
        toast.error(data.message || "Failed to delete comment.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting comment.");
    }
  };

  // ================= Update comment =================
  const handleUpdateComment = async (commentId, newText, onDone) => {
    if (!newText.trim()) return toast.warning("Comment cannot be empty.");
    try {
      const res = await fetch(`${API_BASE}/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newText }),
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) =>
          prev.map((c) => (c._id === commentId ? { ...c, text: newText } : c))
        );
        onDone();
        toast.success("Comment updated!");
      } else {
        toast.error(data.message || "Failed to update comment.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating comment.");
    }
  };

  if (!complaint)
    return <p className="text-center mt-6">Complaint not found.</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 mb-6 bg-blue-100 hover:bg-blue-200 rounded-full"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-6">{complaint.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {media.length > 0 ? (
          <div className="relative w-full h-96 flex items-center justify-center bg-white rounded-lg overflow-hidden">
            {media[currentIndex].type === "image" ? (
              <img
                src={media[currentIndex].url}
                alt="media"
                className="w-full h-full object-contain"
              />
            ) : (
              <video
                src={media[currentIndex].url}
                controls
                className="w-full h-full object-contain"
              />
            )}

            <button
              onClick={handlePrev}
              className="absolute left-2 bg-white/70 p-2 rounded-full shadow"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 bg-white/70 p-2 rounded-full shadow"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="absolute bottom-3 flex gap-2">
              {media.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-3 h-3 rounded-full ${
                    i === currentIndex ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 italic">No media uploaded</p>
        )}

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
          <p className="mb-2">
            <span className="font-semibold">Contact Info:</span>{" "}
            {complaint.contactInfo || "Not provided"}
          </p>
          <p>
            <span className="font-semibold">Posted by:</span>{" "}
            {complaint.user?.name || "Anonymous"}
          </p>

          {isOwner && (
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-xl shadow mb-6">
        <p>
          <span className="font-semibold">Description:</span>{" "}
          {complaint.description}
        </p>
      </div>

      {/* ================= Comment Section ================= */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-bold mb-4">💬 Comments</h2>

        {token && (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              className="flex-1 px-3 py-2 border rounded-lg"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
            />
            <button
              onClick={handleAddComment}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Post
            </button>
          </div>
        )}

        {comments.length === 0 ? (
          <p className="text-gray-500 italic">No comments yet.</p>
        ) : (
          <ul className="space-y-3">
            {comments.map((c) => {
              const isAuthor =
                user && c.userId?.toString() === user._id?.toString();
              const isEditing = editingCommentId === c._id;

              return (
                <li
                  key={c._id}
                  className="p-3 border rounded-lg bg-gray-50 shadow-sm"
                >
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 px-2 py-1 border rounded"
                      />
                      <button
                        onClick={() =>
                          handleUpdateComment(c._id, editText, () =>
                            setEditingCommentId(null)
                          )
                        }
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCommentId(null)}
                        className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-800">{c.text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Posted by: {c.author || "Anonymous"} •{" "}
                        {new Date(c.createdAt).toLocaleString()}
                      </p>

                      {isAuthor && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => {
                              setEditingCommentId(c._id);
                              setEditText(c.text);
                            }}
                            className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteComment(c._id)}
                            className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
