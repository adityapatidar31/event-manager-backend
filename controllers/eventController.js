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
  try {
    const userId = req.user?._id;
    const eventData = { ...req.body, createdBy: userId };
    const newEvent = await Event.create(eventData);
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
    const { _id: userId } = req.user;
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
    res.status(500).json({ status: "Fail", error: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);

    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to modify this event" });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json({
      status: "success",
      data: updatedEvent,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "Fail",
      error: error.message,
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this event" });
    }

    await Event.findByIdAndDelete(id);

    res.status(204).json({
      status: "success",
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.message,
    });
  }
};
