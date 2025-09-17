const Complaint = require("../models/complaintModel");
const OTP = require("../models/otpModel");
const Government = require("../models/governmentModel");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWTSECRET = process.env.JWTSECRET;
const OTP_TTL = 5 * 60 * 1000; // 5 minutes

// ==================== Get All Complaints ====================
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const complaintsWithVotes = complaints.map((c) => ({
      ...c,
      upvoteCount: c.upvotes ? c.upvotes.length : 0,
    }));

    res.json({ success: true, data: complaintsWithVotes });
  } catch (err) {
    console.error("Error fetching complaints:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== Update Complaint Status ====================
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending", "Work in Progress", "Resolved"];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedComplaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    res.json({ success: true, data: updatedComplaint });
  } catch (err) {
    console.error("Error updating complaint:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== Request OTP ====================
exports.requestOtp = async (req, res) => {
  try {
    let { email } = req.body;
    email = email.trim().toLowerCase(); // trim + lowercase

    // Allow any email ending with @gov.in
    if (!email.endsWith("@gov.in")) {
      return res.status(403).json({ success: false, message: "Only government emails allowed" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    // Save OTP in DB
    await OTP.create({
      email,
      otpHash,
      expiresAt: new Date(Date.now() + OTP_TTL),
    });

    // Log OTP in console for dev
    console.log(`OTP for ${email}: ${otp}`);

    res.json({
      success: true,
      message: "OTP generated (check server console)",
    });
  } catch (err) {
    console.error("Error generating OTP:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== Verify OTP ====================
exports.verifyOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;
    email = email.trim().toLowerCase();

    const record = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!record) return res.status(400).json({ success: false, message: "OTP not found" });
    if (record.expiresAt < Date.now()) return res.status(400).json({ success: false, message: "OTP expired" });

    const isMatch = await bcrypt.compare(otp, record.otpHash);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid OTP" });

    // Delete old OTP records
    await OTP.deleteMany({ email });

    // Ensure government official exists
    let official = await Government.findOne({ email });
    if (!official) {
      official = await Government.create({ email });
    }

    // Create JWT
    const token = jwt.sign(
      { id: official._id, email: official.email },
      JWTSECRET,
      { expiresIn: "2h" }
    );

    res.json({ success: true, token, official });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
