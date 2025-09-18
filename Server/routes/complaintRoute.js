const express = require("express");
const router = express.Router({ mergeParams: true });
const { isverified } = require("../middleware");
const complaintController = require("../controllers/complaintController");

// ================== Complaint Routes ==================

// Get complaints of the logged-in user
router.get("/my", isverified, complaintController.getUserComplaints);

// Get all complaints
router.get("/", complaintController.getComplaintData);

// Add a new complaint
router.post("/", isverified, complaintController.addComplaint);

// Get a single complaint by ID
router.get("/:id", complaintController.showComplaint);

// Update a complaint
router.put("/:id", isverified, complaintController.updateComplaint);

// Delete a complaint
router.delete("/:id", isverified, complaintController.deleteComplaint);

// Toggle upvote
router.post("/:id/upvote", isverified, complaintController.toggleUpvote);

module.exports = router;
