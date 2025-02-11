const Event = require("../models/eventModel");

exports.getAllEvent = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json({
      status: "success",
      length: events.length,
      data: events,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "failed",
      error: error.message,
    });
  }
};

exports.createEvent = async (req, res) => {
  console.log(req.body);
  try {
    const newEvent = await Event.create(req.body);

    res.status(201).json({
      status: "success",
      data: newEvent,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "failed",
      error: error.message,
    });
  }
};

exports.getSingleEvent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        status: "failed",
        message: "event id is required",
      });
    }
    const event = await Event.find().populate("attendees");
    res.status(200).json({
      status: "success",
      data: event,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "fail",
      error: "Failed to fetch tour",
    });
  }
};

exports.addAttendees = async (req, res) => {
  try {
    const { userId } = req.body;
    const { id } = req.params;

    const event = await Event.findByIdAndUpdate(
      id,
      { $addToSet: { attendees: userId } },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Attendee added successfully", event });
  } catch (error) {
    res.status(500).json({ message: "Error adding attendee", error });
  }
};
