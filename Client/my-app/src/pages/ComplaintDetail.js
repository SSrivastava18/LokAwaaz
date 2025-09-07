import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ComplaintDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const complaint = location.state;

  if (!complaint) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 text-lg">
        No complaint details available.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition shadow-sm"
      >
        ⬅ Back
      </button>

      {/* Title */}
      <h2 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-wide">
        {complaint.title}
      </h2>

      {/* Flex Container */}
      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        {/* Media Section */}
        <div className="flex-1">
          {complaint.files && complaint.files.length > 0 ? (
            complaint.files.map((file, index) =>
              file.type === "video" ? (
                <video
                  key={index}
                  src={file.url}
                  controls
                  className="w-full rounded-2xl shadow-xl hover:scale-[1.02] transition-transform duration-300"
                />
              ) : (
                <img
                  key={index}
                  src={file.url}
                  alt="complaint"
                  className="w-full rounded-2xl shadow-xl hover:scale-[1.02] transition-transform duration-300"
                />
              )
            )
          ) : (
            <img
              src="/default-placeholder.png"
              alt="no media"
              className="w-full rounded-2xl shadow-xl"
            />
          )}
        </div>

        {/* Info Section */}
        <div className="flex-1 bg-white shadow-lg rounded-2xl p-8 space-y-6 border border-gray-100">
          <p className="text-lg">
            <span className="font-semibold text-gray-700">Status:</span>{" "}
            <span
              className={`px-4 py-1 rounded-full text-sm font-semibold shadow-sm ${
                complaint.status === "Pending"
                  ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                  : complaint.status === "Resolved"
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-blue-100 text-blue-700 border border-blue-200"
              }`}
            >
              {complaint.status}
            </span>
          </p>

          <p className="text-lg">
            <span className="font-semibold text-gray-700">Category:</span>{" "}
            <span className="text-gray-800">{complaint.category}</span>
          </p>

          <p className="text-lg">
            <span className="font-semibold text-gray-700">Location:</span>{" "}
            <span className="text-gray-800">{complaint.location}</span>
          </p>

          <p className="text-lg">
            <span className="font-semibold text-gray-700">Contact Info:</span>{" "}
            <span className="text-gray-800">{complaint.contact}</span>
          </p>
        </div>
      </div>

      {/* Description Below */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-gray-200 rounded-2xl p-6 shadow-inner">
        <p className="text-lg text-gray-800 leading-relaxed">
          <span className="font-semibold text-gray-700">Description:</span>{" "}
          {complaint.description}
        </p>
      </div>
    </div>
  );
}
