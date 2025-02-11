const express = require("express");
const eventController = require("../controllers/eventController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(eventController.getAllEvent)
  .post(eventController.createEvent);

// router
//   .route("/:id")
//   .get(eventController.getSingleEvent)
//   .post(eventController.updateEvent)
//   .delete(eventController.deleteEvent);

module.exports = router;
