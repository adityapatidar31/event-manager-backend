const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config({ path: "./config.env" });

const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

// Connect to MongoDB
mongoose.connect(DB).then(() => console.log("DB connection successful!"));

// Create HTTP server & attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust in production
    methods: ["GET", "POST"],
  },
});

// Store real-time attendees and track user-event mappings
let attendees = {}; // { eventId: attendeeCount }
let userEventMap = {}; // { socketId: eventId }

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // User joins an event
  socket.on("joinEvent", (eventId) => {
    if (userEventMap[socket.id]) {
      // Prevent joining multiple events
      socket.emit(
        "error",
        "You must leave the current event before joining another."
      );
      return;
    }

    userEventMap[socket.id] = eventId;

    if (!attendees[eventId]) {
      attendees[eventId] = 0;
    }
    attendees[eventId]++;

    io.emit("attendeeUpdate", { eventId, count: attendees[eventId] }); // Broadcast update
  });

  // User leaves an event
  socket.on("leaveEvent", () => {
    const eventId = userEventMap[socket.id];
    if (eventId && attendees[eventId] > 0) {
      attendees[eventId]--;
      io.emit("attendeeUpdate", { eventId, count: attendees[eventId] });
    }
    delete userEventMap[socket.id]; // Remove user from event tracking
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    const eventId = userEventMap[socket.id];
    if (eventId && attendees[eventId] > 0) {
      attendees[eventId]--;
      io.emit("attendeeUpdate", { eventId, count: attendees[eventId] });
    }
    delete userEventMap[socket.id]; // Remove from tracking
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
