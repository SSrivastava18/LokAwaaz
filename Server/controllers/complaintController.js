const mongoose = require("mongoose");
const Complaint = require("../models/complaintModel");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.APIKEY,
  api_secret: process.env.APISECRET,
});

// ==================== Helper to normalize complaint data ====================
const normalizeComplaint = (complaint, userId) => ({
  _id: complaint._id,
  title: complaint.title,
  description: complaint.description,
  category: complaint.category,
  location: complaint.location,
  status: complaint.status,
  urgency: complaint.urgency,
  user: complaint.user,
  media: Array.isArray(complaint.media)
    ? complaint.media.map((m) => ({
        _id: m._id,
        url: m.url,
        filename: m.filename,
        type: m.type,
        thumbnailUrl: m.thumbnailUrl || null,
      }))
    : [],
  votes: complaint.upvotes?.length || 0,
  userHasUpvoted: userId
    ? complaint.upvotes?.some((u) => u.toString() === userId.toString())
    : false,
});

// ==================== Get all complaints ====================
module.exports.getComplaintData = async (req, res) => {
  try {
    const complaints = await Complaint.find({})
      .sort({ createdAt: -1 })
      .populate("user", "name")
      .lean();

    const normalized = complaints.map((c) => normalizeComplaint(c, req.user?.id));
    res.json({ success: true, data: normalized });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching complaints" });
  }
};

// ==================== Get complaints of logged-in user ====================
module.exports.getUserComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("user", "name")
      .lean();

    const normalized = complaints.map((c) => normalizeComplaint(c, req.user.id));
    res.json({ success: true, data: normalized });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch complaints" });
  }
};

// ==================== Add a new complaint ====================
module.exports.addComplaint = async (req, res) => {
  try {
    if (!req.body.title?.trim() || !req.body.location?.trim()) {
      return res.status(400).json({ success: false, message: "Title and location are required" });
    }

    const files = req.files?.media
      ? Array.isArray(req.files.media)
        ? req.files.media
        : [req.files.media]
      : [];

    const uploadedMedia = [];
    for (let file of files) {
      const result = await cloudinary.uploader.upload(file.tempFilePath, { resource_type: "auto" });

      const mediaItem = {
        url: result.secure_url,
        filename: result.public_id,
        type: file.mimetype.startsWith("video") ? "video" : "image",
      };

      if (file.mimetype.startsWith("video")) {
        mediaItem.thumbnailUrl = cloudinary.url(result.public_id + ".jpg", {
          resource_type: "video",
          transformation: [{ width: 320, height: 240, crop: "fill" }],
        });
      }

      uploadedMedia.push(mediaItem);
    }

    const newComplaint = new Complaint({
      title: req.body.title?.trim(),
      description: req.body.description?.trim(),
      category: req.body.category,
      location: req.body.location?.trim(),
      urgency: req.body.urgency || "Medium",
      status: "Pending",
      media: uploadedMedia,
      user: req.user.id,
    });

    await newComplaint.save();

    res.status(201).json({
      success: true,
      message: "Complaint registered successfully!",
      complaint: normalizeComplaint(newComplaint, req.user.id),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error saving complaint" });
  }
};

// ==================== Show single complaint ====================
module.exports.showComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid complaint ID" });
    }

    const complaint = await Complaint.findById(id).populate("user", "name");
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    res.json({ success: true, data: normalizeComplaint(complaint, req.user?.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching complaint" });
  }
};

// ==================== Delete complaint ====================
module.exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    if (complaint.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Remove media from Cloudinary
    for (let m of complaint.media) {
      await cloudinary.uploader.destroy(m.filename, { resource_type: "auto" });
    }

    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Complaint deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    if (complaint.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Validate required fields
    if (!req.body.title?.trim() || !req.body.location?.trim()) {
      return res.status(400).json({ success: false, message: "Title and location are required" });
    }

    // Handle removed media
    const removedMediaIds = req.body.removedMediaIds ? JSON.parse(req.body.removedMediaIds) : [];
    let mediaToKeep = complaint.media.filter((m) => !removedMediaIds.includes(m._id.toString()));

    for (let m of complaint.media) {
      if (removedMediaIds.includes(m._id.toString())) {
        await cloudinary.uploader.destroy(m.filename, { resource_type: m.type });
      }
    }

    // Handle new media uploads
    const newFiles = req.files?.media ? (Array.isArray(req.files.media) ? req.files.media : [req.files.media]) : [];
    const newUploadedMedia = [];

    for (let file of newFiles) {
      const resourceType = file.mimetype.startsWith("video") ? "video" : "image";

      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        resource_type: resourceType,
      });

      const mediaItem = {
        url: result.secure_url,
        filename: result.public_id,
        type: resourceType,
      };

      if (resourceType === "video") {
        mediaItem.thumbnailUrl = cloudinary.url(result.public_id + ".jpg", {
          resource_type: "video",
          format: "jpg",
          transformation: [{ width: 300, height: 200, crop: "fill" }],
        });
      }

      newUploadedMedia.push(mediaItem);
    }

    // Update complaint fields
    complaint.media = [...mediaToKeep, ...newUploadedMedia];
    complaint.title = req.body.title?.trim();
    complaint.description = req.body.description?.trim() || complaint.description;
    complaint.category = req.body.category || complaint.category;
    complaint.location = req.body.location?.trim();
    complaint.urgency = req.body.urgency || complaint.urgency;
    complaint.status = req.body.status || complaint.status;

    await complaint.save();

    res.json({
      success: true,
      message: "Complaint updated successfully",
      complaint: normalizeComplaint(complaint, req.user.id),
    });
  } catch (error) {
    console.error("Update error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message, errors: error.errors });
    }
    res.status(500).json({ success: false, message: "Server error occurred" });
  }
};


// ==================== Toggle upvote ====================
module.exports.toggleUpvote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid complaint ID" });

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    const alreadyUpvoted = complaint.upvotes?.some((u) => u.toString() === userId);
    if (alreadyUpvoted) complaint.upvotes.pull(userId);
    else complaint.upvotes.push(userId);

    await complaint.save();

    res.json({
      success: true,
      _id: complaint._id,
      votes: complaint.upvotes.length,
      userHasUpvoted: !alreadyUpvoted,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error while toggling upvote" });
  }
};
