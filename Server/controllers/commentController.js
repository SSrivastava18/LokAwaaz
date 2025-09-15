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
    const { text, author } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const comment = await Comment.create({
      complaintId,
      text: text.trim(),
      author: author && author.trim() !== "" ? author.trim() : "Anonymous",
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
    const { id } = req.params;

    const deleted = await Comment.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

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
    const { id } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const updated = await Comment.findByIdAndUpdate(
      id,
      { text: text.trim() },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment: updated,
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
