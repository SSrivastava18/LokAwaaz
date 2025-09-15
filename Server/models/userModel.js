const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // ensure unique emails
      lowercase: true,
      trim: true,
    },
    password: {
      type: String, // empty for Google accounts
    },
    googleId: {
      type: String,
      unique: true,   // Google IDs must be unique
      sparse: true,   // ✅ allows multiple null values
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
