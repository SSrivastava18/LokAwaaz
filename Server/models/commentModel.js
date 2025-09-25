const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    // 🔹 Author name (for display)
    author: {
      type: String,
      default: "Anonymous",
    },
    // 🔹 Reference to the user who created the comment
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Anonymous comments allowed
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
