const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  institution: { type: mongoose.Schema.Types.ObjectId, ref: "Institution", required: true, index: true },
});

RoomSchema.pre("save", function (next) {
  if (!this.name.startsWith("Каб.")) {
    this.name = `Каб. ${this.name}`;
  }
  next();
});

module.exports = mongoose.model("Room", RoomSchema);
