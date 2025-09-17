// src/components/ComplaintCard.js
import React from "react";
import { ArrowUp } from "lucide-react";

const ComplaintCard = ({ complaint, voteInfo, handleUpvote }) => {
  const mediaUrl =
    complaint.media && complaint.media.length > 0
      ? complaint.media[0].type === "image"
        ? complaint.media[0].url
        : complaint.media[0].type === "video"
        ? complaint.media[0].thumbnailUrl || "/video-placeholder.png"
        : "/default-placeholder.png"
      : "/default-placeholder.png";

  return (
    <div className="cursor-pointer bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition flex flex-col">
      <img
        src={mediaUrl}
        alt="complaint media"
        className="w-full h-48 object-cover"
      />

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-lg font-semibold text-gray-800 mb-2">
            {complaint.title}
          </p>
          <p className="text-sm text-gray-600 mb-3">
            Status:{" "}
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
        </div>

        <button
          onClick={(e) => handleUpvote(complaint._id, e)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition w-fit ${
            voteInfo.upvoted
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          <ArrowUp
            className={`w-4 h-4 ${
              voteInfo.upvoted ? "text-blue-700" : "text-blue-600"
            }`}
          />
          {voteInfo.upvoted ? "Upvoted" : "Upvote"}{" "}
          <span className="text-blue-600">{voteInfo.count}</span>
        </button>
      </div>
    </div>
  );
};

export default ComplaintCard;
