const Comment = require("../models/commentModel");

// ==================== Get comments for a complaint ====================
exports.getComments = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const comments = await Comment.find({ complaintId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (err) {
    console.error("❌ [getComments] Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
      error: err.message,
    });
  }
};

// ==================== Add a new comment ====================
exports.addComment = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    // 🔹 If logged in, use req.user.name/email, else fallback to "Anonymous"
    const author = req.user?.name || req.user?.email || "Anonymous";

    const comment = await Comment.create({
      complaintId,
      text: text.trim(),
      author,
      userId: req.user?._id ? req.user._id.toString() : null, // ✅ store user ID
    });

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment,
    });
  } catch (err) {
    console.error("❌ [addComment] Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to add comment",
      error: err.message,
    });
  }
};

// ==================== Delete a comment ====================
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // ✅ Ensure only the author can delete
    if (!req.user || comment.userId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment",
      });
    }

    await comment.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (err) {
    console.error("❌ [deleteComment] Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete comment",
      error: err.message,
    });
  }
};

// ==================== Update a comment ====================
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // ✅ Ensure only the author can update
    if (!req.user || comment.userId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this comment",
      });
    }

    comment.text = text.trim();
    await comment.save();

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment,
    });
  } catch (err) {
    console.error("❌ [updateComment] Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update comment",
      error: err.message,
    });
  }
};
