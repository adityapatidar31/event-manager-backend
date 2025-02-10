const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ["Tech", "Music", "Sports", "Education"],
    required: true,
  },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  image: { type: String }, // Cloudinary URL
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Registered users
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Event", EventSchema);
