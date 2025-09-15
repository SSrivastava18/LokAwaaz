const express = require("express");
const router = express.Router();

// ==================== Imports ====================
const govCtrl = require("../controllers/governmentController");
const { isGovernment } = require("../middleware");

// ✅ Get all complaints (gov only)
router.get("/complaints", isGovernment, govCtrl.getAllComplaints);

// ✅ Update complaint status (gov only)
router.put("/complaints/:id/status", isGovernment, govCtrl.updateStatus);

module.exports = router;
