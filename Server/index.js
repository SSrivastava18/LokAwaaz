// ==================== Imports ====================
const express = require("express");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// ==================== Create Express App ====================
const app = express();

// ==================== Routes ====================
const userRoute = require("./routes/userRoute.js");
const complaintRoute = require("./routes/complaintRoute.js");

// ==================== Environment Variables ====================
const dbUrl = process.env.ATLASDBURL || "mongodb://localhost:27017/staystory";
const port = process.env.PORT || 5000;

// ==================== Middleware ====================
// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload middleware
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

// Enable CORS
app.use(cors());

// Disable COOP/COEP headers during development
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

// ==================== Mount Routes ====================
app.use("/user", userRoute);
app.use("/complaints", complaintRoute);

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
