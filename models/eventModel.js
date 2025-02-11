const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ["Tech", "Music", "Sports", "Education"],
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
    min: [1, "capacity must be above 1"],
  },
  duration: {
    type: Number,
    required: true,
    min: [1, "duration must be above than 1 minute"],
  },
  date: {
    type: Date,
    required: true,
    validate: {
      validator: function (date) {
        return date >= Date.now();
      },
      message: "Invalid date you can not create event before now",
    },
  },
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

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
