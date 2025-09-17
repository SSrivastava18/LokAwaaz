const mongoose = require("mongoose");
const Complaint = require("../models/complaintModel");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.APIKEY,
  api_secret: process.env.APISECRET,
});

// ==================== Get all complaints ====================
module.exports.getComplaintData = async (req, res) => {
  try {
    const complaints = await Complaint.find({})
      .sort({ createdAt: -1 })
      .populate("user", "name")
      .lean();

    const normalizedComplaints = complaints.map((c) => ({
      _id: c._id,
      title: c.title,
      description: c.description,
      category: c.category,
      location: c.location,
      status: c.status,
      urgency: c.urgency,
      user: c.user,
      media: Array.isArray(c.media)
        ? c.media.map((m) => ({
            url: m.url,
            filename: m.filename,
            type: m.type,
            thumbnailUrl: m.thumbnailUrl || null,
          }))
        : [],
      votes: c.upvotes?.length || 0,
      userHasUpvoted: req.user
        ? c.upvotes?.some((u) => u.toString() === req.user.id.toString())
        : false,
    }));

    res.json({ success: true, data: normalizedComplaints });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ success: false, message: "Error fetching complaints" });
  }
};

// ==================== Add a new complaint ====================
module.exports.addComplaint = async (req, res) => {
  try {
    const files = req.files?.media
      ? Array.isArray(req.files.media)
        ? req.files.media
        : [req.files.media]
      : [];

    const uploadedMedia = [];
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        resource_type: "auto",
      });

      const mediaItem = {
        url: result.secure_url,
        filename: result.public_id,
        type: file.mimetype.startsWith("video") ? "video" : "image",
      };

      if (file.mimetype.startsWith("video")) {
        const thumbnailUrl = cloudinary.url(result.public_id + ".jpg", {
          resource_type: "video",
          format: "jpg",
          transformation: [{ width: 300, height: 200, crop: "fill" }],
        });
        mediaItem.thumbnailUrl = thumbnailUrl;
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
      complaint: newComplaint,
    });
  } catch (error) {
    console.error("Error adding complaint:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
        errors: error.errors,
      });
    }
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
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    res.json({
      success: true,
      data: {
        ...complaint.toObject(),
        votes: complaint.upvotes.length,
        userHasUpvoted: req.user
          ? complaint.upvotes.some(
              (u) => u.toString() === req.user.id.toString()
            )
          : false,
      },
    });
  } catch (error) {
    console.error("Error fetching complaint:", error);
    res.status(500).json({ success: false, message: "Error fetching complaint details" });
  }
};

// ==================== Delete complaint ====================
module.exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    if (complaint.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this complaint" });
    }

    for (let m of complaint.media) {
      await cloudinary.uploader.destroy(m.filename, { resource_type: "auto" });
    }

    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Complaint deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== Update complaint ====================
module.exports.updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    if (complaint.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    let retainedMedia = [];
    if (Array.isArray(req.body.existingMedia)) {
      retainedMedia = req.body.existingMedia;
    } else if (typeof req.body.existingMedia === "string") {
      retainedMedia = [req.body.existingMedia];
    }

    const mediaToDelete = complaint.media.filter(
      (m) => !retainedMedia.includes(m.url)
    );
    for (let m of mediaToDelete) {
      await cloudinary.uploader.destroy(m.filename, { resource_type: "auto" });
    }

    let updatedMedia = complaint.media.filter((m) =>
      retainedMedia.includes(m.url)
    );

    const newFiles = req.files?.media
      ? Array.isArray(req.files.media)
        ? req.files.media
        : [req.files.media]
      : [];

    for (let file of newFiles) {
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        resource_type: "auto",
      });

      const mediaItem = {
        url: result.secure_url,
        filename: result.public_id,
        type: file.mimetype.startsWith("video") ? "video" : "image",
      };

      if (file.mimetype.startsWith("video")) {
        const thumbnailUrl = cloudinary.url(result.public_id + ".jpg", {
          resource_type: "video",
          format: "jpg",
          transformation: [{ width: 300, height: 200, crop: "fill" }],
        });
        mediaItem.thumbnailUrl = thumbnailUrl;
      }

      updatedMedia.push(mediaItem);
    }

    const updatedData = {
      title: req.body.title?.trim() || complaint.title,
      description: req.body.description?.trim() || complaint.description,
      category: req.body.category || complaint.category,
      location: req.body.location?.trim() || complaint.location,
      urgency: req.body.urgency || complaint.urgency,
      status: req.body.status || complaint.status,
      media: updatedMedia,
    };

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );
    res.json({ success: true, updatedComplaint });
  } catch (error) {
    console.error("Update error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
        errors: error.errors,
      });
    }
    res.status(500).json({ success: false, message: "Server error occurred" });
  }
};

// ==================== Toggle upvote ====================
module.exports.toggleUpvote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid complaint ID" });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    const alreadyUpvoted = complaint.hasUserUpvoted(userId);

    if (alreadyUpvoted) {
      complaint.upvotes.pull(userId);
    } else {
      complaint.upvotes.push(userId);
    }

    await complaint.save();

    res.json({
      success: true,
      _id: complaint._id,
      votes: complaint.upvotes.length,
      userHasUpvoted: !alreadyUpvoted,
    });
  } catch (error) {
    console.error("Error toggling upvote:", error);
    res.status(500).json({ success: false, message: "Server error while toggling upvote" });
  }
};
