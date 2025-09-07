const mongoose = require("mongoose");

// ==================== Complaint Schema ====================
const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "Roads",
        "Electricity",
        "Water Supply",
        "Sanitation",
        "Public Transport",
        "Safety",
        "Other",
      ],
      required: [true, "Category is required"],
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },

    // Added "Normal" as a valid urgency value (matches front-end if needed)
    urgency: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical", "Normal"],
      default: "Medium",
    },

    media: [
      {
        url: {
          type: String,
          required: [true, "Media URL is required"],
        },
        filename: {
          type: String,
          required: [true, "Media filename is required"],
        },
        type: {
          type: String,
          enum: ["image", "video"],
          required: [true, "Media type is required"],
        },
      },
    ],

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },

    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  }
);

// ==================== Export Model ====================
const Complaint = mongoose.model("Complaint", complaintSchema);
module.exports = Complaint;
