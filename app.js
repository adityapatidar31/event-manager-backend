const express = require("express");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");
const userRouter = require("./routes/userRoutes");
const eventRouter = require("./routes/eventRoutes");
const cookieParser = require("cookie-parser");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
); // Enable CORS for frontend
app.use(express.json()); // Parse JSON requests
app.use(express.static(path.join(__dirname, "public")));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cookieParser());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/events", eventRouter);

module.exports = app;
