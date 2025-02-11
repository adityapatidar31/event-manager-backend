const Event = require("../models/eventModel");

const Model = require("../models/eventModel");

exports.getAllEvent = async (req, res) => {
  try {
    let query = Model.find();

    //  Search by name or description (No changes needed)
    if (req.query.search) {
      const searchValue = req.query.search;
      query = query.find({ $text: { $search: searchValue } });
    }

    // 🔹 Date Filters
    if (req.query.date) {
      const now = new Date();
      const startOfToday = new Date(now.setHours(0, 0, 0, 0));
      const endOfToday = new Date(now.setHours(23, 59, 59, 999));

      if (req.query.date === "today") {
        query = query.find({ date: { $gte: startOfToday, $lte: endOfToday } });
      } else if (req.query.date === "nextWeek") {
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);
        query = query.find({ date: { $gte: startOfToday, $lte: nextWeek } });
      } else if (req.query.date === "nextMonth") {
        const nextMonth = new Date();
        nextMonth.setMonth(now.getMonth() + 1);
        query = query.find({ date: { $gte: startOfToday, $lte: nextMonth } });
      } else if (req.query.date === "nextThreeMonths") {
        const nextThreeMonths = new Date();
        nextThreeMonths.setMonth(now.getMonth() + 3);
        query = query.find({
          date: { $gte: startOfToday, $lte: nextThreeMonths },
        });
      } else if (req.query.date === "thisYear") {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        query = query.find({ date: { $gte: startOfYear, $lte: endOfYear } });
      } else if (req.query.date === "nextThreeYears") {
        const nextThreeYears = new Date();
        nextThreeYears.setFullYear(now.getFullYear() + 3);
        query = query.find({
          date: { $gte: startOfToday, $lte: nextThreeYears },
        });
      }
    }

    //  Sorting by Date (asc or desc)
    if (req.query.sort === "+date") {
      query = query.sort({ date: 1 }); // Ascending
    } else if (req.query.sort === "-date") {
      query = query.sort({ date: -1 }); // Descending
    }

    // Fetch filtered and sorted events
    const events = await query;

    res.status(200).json({
      status: "success",
      length: events.length,
      data: events,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
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

exports.getMyEvents = async (req, res) => {
  try {
    const id = req.user.id;

    const events = await Event.find({ createdBy: id });
    res.status(200).json({
      status: "success",
      data: events,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "fail",
      error: "Internal server error",
    });
  }
};
