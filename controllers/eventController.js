const Event = require("../models/eventModel");

exports.getAllEvent = async (req, res) => {
  console.log(req.body);
  try {
    const event = await Event.create(req.body);
    res.status(200).json({
      status: "success",
      data: event,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "failed",
      error: error.message,
    });
  }
};
