const Complaint = require("../models/complaintModel");

// ✅ Get All Complaints
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("user", "name email")  // Populate user name & email
      .sort({ createdAt: -1 });

    res.json({ success: true, data: complaints });
  } catch (err) {
    console.error("Error fetching complaints:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Update Complaint Status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending", "Work in Progress", "Resolved"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedComplaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    res.json({ success: true, data: updatedComplaint });
  } catch (err) {
    console.error("Error updating complaint:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
