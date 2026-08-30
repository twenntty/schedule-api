const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialty: { type: mongoose.Schema.Types.ObjectId, ref: "Specialty", required: true },
    institution: { type: mongoose.Schema.Types.ObjectId, ref: "Institution", required: true, index: true }
});

module.exports = mongoose.model("Course", courseSchema);
