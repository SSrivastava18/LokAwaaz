const mongoose = require("mongoose");

const governmentSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  department: { type: String },
  role: { type: String, default: "official" }
});

module.exports = mongoose.model("Government", governmentSchema);
