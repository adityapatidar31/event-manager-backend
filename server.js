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
    origin: "*", // Adjust to allow only frontend URL in production
    methods: ["GET", "POST"],
  },
});

// Store real-time attendee counts
let attendees = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // User joins an event
  socket.on("joinEvent", (eventId) => {
    if (!attendees[eventId]) {
      attendees[eventId] = 0;
    }
    attendees[eventId]++;
    io.emit("attendeeUpdate", { eventId, count: attendees[eventId] }); // Broadcast update
  });

  // User leaves an event
  socket.on("leaveEvent", (eventId) => {
    if (attendees[eventId] && attendees[eventId] > 0) {
      attendees[eventId]--;
      io.emit("attendeeUpdate", { eventId, count: attendees[eventId] });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
