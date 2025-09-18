const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
    },
    text: { type: String, required: true, trim: true },
    // 🔹 Can be User reference OR Anonymous
    author: {
      type: String,
      default: "Anonymous",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
