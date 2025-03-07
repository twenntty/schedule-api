const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
  requestType: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  schoolName: { type: String },
  studentCount: { type: Number },
  contactNumber: { type: String },
  email: { type: String, required: true },
});

module.exports = mongoose.model("Request", RequestSchema);
