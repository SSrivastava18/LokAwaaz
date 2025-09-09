const express = require("express");
const router = express.Router();
const {
  getComments,
  addComment,
  deleteComment,
  updateComment,
} = require("../controllers/commentController");

// GET all comments for a complaint
router.get("/:complaintId", getComments);

// POST add a new comment
router.post("/:complaintId", addComment);

// DELETE a comment
router.delete("/:id", deleteComment);

// PUT update a comment
router.put("/:id", updateComment);

module.exports = router;
