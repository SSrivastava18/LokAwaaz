// ==================== Imports ====================
const express = require("express");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// ==================== Create Express App ====================
const app = express();

// ==================== Cloudinary Configuration ====================
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// ==================== Routes ====================
const userRoute = require("./routes/userRoute.js");
const complaintRoute = require("./routes/complaintRoute.js");
const commentRoute = require("./routes/commentRoute.js");
const governmentRoute = require("./routes/governmentRoute.js"); // 🔹 NEW

// ==================== Environment Variables ====================
const dbUrl = process.env.ATLASDBURL || "mongodb://localhost:27017/staystory";
const port = process.env.PORT || 5000;

// ==================== Middleware ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
  })
);

app.use(cors());

// Remove COOP/COEP headers in development
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    res.removeHeader("Cross-Origin-Opener-Policy");
    res.removeHeader("Cross-Origin-Embedder-Policy");
    next();
  });
}

// ==================== Database Connection ====================
async function connectDB() {
  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}
connectDB();

// ==================== Media Upload Route (for Complaints) ====================
app.post("/api/upload", async (req, res) => {
  try {
    if (!req.files || !req.files.media) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const file = req.files.media;
    const fileExt = file.name.split(".").pop().toLowerCase();
    const isVideo = ["mp4", "mov", "avi"].includes(fileExt);

    const uploadOptions = {
      resource_type: isVideo ? "video" : "image",
      folder: "complaints_media",
    };

    const uploadToCloudinary = () =>
      new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        streamifier.createReadStream(file.data).pipe(uploadStream);
      });

    const uploadResult = await uploadToCloudinary();

    const mediaUrl = uploadResult.secure_url;
    let thumbnailUrl = null;

    if (isVideo) {
      thumbnailUrl = cloudinary.url(uploadResult.public_id + ".jpg", {
        resource_type: "video",
        transformation: [
          { width: 320, height: 240, crop: "fill", fetch_format: "auto" },
        ],
      });
    }

    res.json({
      success: true,
      data: {
        mediaUrl,
        thumbnailUrl,
        type: isVideo ? "video" : "image",
      },
    });
  } catch (err) {
    console.error("❌ Upload Error:", err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

// ==================== Mount Routes ====================
app.use("/user", userRoute);
app.use("/complaints", complaintRoute);
app.use("/comments", commentRoute);
app.use("/api/government", governmentRoute); // 🔹 NEW (Gov routes)

// ==================== Health Check Endpoint ====================
app.get("/", (req, res) => {
  res.json({ success: true, message: "Backend is running 🚀" });
});

// ==================== Generic Error Handler ====================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack || err);
  res.status(500).json({ success: false, message: "Something went wrong" });
});

// ==================== Start Server ====================
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

// ==================== Global Unhandled Promise Rejection Handler ====================
process.on("unhandledRejection", (error) => {
  console.error("❌ Unhandled Rejection:", error);
  process.exit(1);
});
