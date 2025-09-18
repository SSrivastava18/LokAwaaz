const express = require("express");
const router = express.Router();
const {
  getComments,
  addComment,
  deleteComment,
  updateComment,
} = require("../controllers/commentController");

const { isverified } = require("../middleware"); // ✅ import auth middleware

// ==================== Get comments for a complaint ====================
// You can decide if comments should be public (no auth) or private (auth required).
// Here I made GET public, but POST/PUT/DELETE require login.
router.get("/:complaintId", getComments);

// ==================== Add a new comment ====================
router.post("/:complaintId", isverified, addComment);

// ==================== Delete a comment ====================
router.delete("/:id", isverified, deleteComment);

// ==================== Update a comment ====================
router.put("/:id", isverified, updateComment);

module.exports = router;
