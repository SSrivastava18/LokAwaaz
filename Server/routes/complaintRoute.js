const express = require("express");
const router = express.Router({ mergeParams: true });
const { isverified } = require("../middleware");
const complaintController = require("../controllers/complaintController");

router.get("/", complaintController.getComplaintData);

router.post("/", isverified, complaintController.addComplaint);

router.get("/:id", complaintController.showComplaint);

router.put("/:id", isverified, complaintController.updateComplaint);

router.delete("/:id", isverified, complaintController.deleteComplaint);

module.exports = router;



