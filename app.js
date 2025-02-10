const express = require("express");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");
const userRouter = require("./routes/userRoutes");

const app = express();

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json()); // Parse JSON requests
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1/users", userRouter);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

module.exports = app;
