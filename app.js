const express = require("express");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json()); // Parse JSON requests
app.use(express.static(path.join(__dirname, "public")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

module.exports = app;
