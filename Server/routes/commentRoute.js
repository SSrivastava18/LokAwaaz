const express = require("express");
const router = express.Router();
const {
  getComments,
  addComment,
  deleteComment,
  updateComment,
} = require("../controllers/commentController");

const { isverified } = require("../middleware"); // ✅ auth middleware

// ==================== Get comments for a complaint ====================
// Public (no login needed to view comments)
router.get("/:complaintId", getComments);

// ==================== Add a new comment ====================
// Requires login
router.post("/:complaintId", isverified, addComment);

// ==================== Update a comment ====================
// Requires login + ownership check (handled in controller)
router.put("/:commentId", isverified, updateComment);

// ==================== Delete a comment ====================
// Requires login + ownership check (handled in controller)
router.delete("/:commentId", isverified, deleteComment);

module.exports = router;
