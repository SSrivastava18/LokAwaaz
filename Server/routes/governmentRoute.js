const express = require("express");
const router = express.Router();

// ==================== Imports ====================
const govCtrl = require("../controllers/governmentController");
const { isGovernment } = require("../middleware");

// ==================== Government Auth Routes ====================
// Request OTP (no auth needed)
router.post("/request-otp", govCtrl.requestOtp);

// Verify OTP (no auth needed, returns JWT)
router.post("/verify-otp", govCtrl.verifyOtp);

// ==================== Complaint Routes (Gov only) ====================
// Get all complaints
router.get("/complaints", isGovernment, govCtrl.getAllComplaints);

// Update complaint status
router.put("/complaints/:id/status", isGovernment, govCtrl.updateStatus);

module.exports = router;
