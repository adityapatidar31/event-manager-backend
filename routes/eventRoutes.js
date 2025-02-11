const express = require("express");
const eventController = require("../controllers/eventController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/myEvents")
  .get(authController.protect, eventController.getMyEvents);

router
  .route("/")
  .get(eventController.getAllEvent)
  .post(authController.protect, eventController.createEvent);

router.post(
  "/:id/attendees",
  authController.protect,
  eventController.addAttendees
);

router
  .route("/:id")
  .get(eventController.getSingleEvent)
  .patch(authController.protect, eventController.updateEvent)
  .delete(authController.protect, eventController.deleteEvent);

module.exports = router;
