const express = require("express");
const eventController = require("../controllers/eventController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(eventController.getAllEvent)
  .post(authController.protect, eventController.createEvent);

router
  .route("/:id")
  .get(eventController.getSingleEvent)
  .patch(authController.protect, eventController.updateEvent)
  .delete(authController.protect, eventController.deleteEvent);

router.post(
  "/:id/attendees",
  authController.protect,
  eventController.addAttendees
);

module.exports = router;
