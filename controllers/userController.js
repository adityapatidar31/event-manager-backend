const User = require("../models/userModel");

exports.getAllUsers = (req, res) => {
  res.status(200).json({ user: "Aditya" });
};
