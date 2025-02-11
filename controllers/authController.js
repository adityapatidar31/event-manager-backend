const User = require("../models/userModel");

exports.signUp = async (req, res) => {
  const { name, email, password, passwordConfirm, photo } = req.body;
  const userData = { name, email, password, passwordConfirm };
  try {
    const newUser = await User.create(userData);
    res.status(201).json({ status: "Success", data: { user: newUser } });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "failed", error: "User Creation failed" });

    return;
  }
};
