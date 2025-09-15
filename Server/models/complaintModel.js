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
        thumbnailUrl: {
          type: String, // Optional but needed for videos
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

    // ==================== NEW FIELD FOR GOVERNMENT ====================
    status: {
      type: String,
      enum: ["Pending", "Work in Progress", "Resolved"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== Virtual field: votes count ====================
complaintSchema.virtual("votes").get(function () {
  return this.upvotes.length;
});

// ==================== Helper method: check if user has upvoted ====================
complaintSchema.methods.hasUserUpvoted = function (userId) {
  return this.upvotes.some((u) => u.toString() === userId.toString());
};

// ==================== Export Model ====================
const Complaint = mongoose.model("Complaint", complaintSchema);
module.exports = Complaint;
