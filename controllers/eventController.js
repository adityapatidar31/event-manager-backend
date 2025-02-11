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
