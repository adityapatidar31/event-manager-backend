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

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      status: "fail",
      error: "Please Provide email and password",
    });
    return;
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    res.status(401).json({
      status: "fail",
      error: "Invalid Credentials",
    });
    return;
  }
  user.password = undefined;

  res.status(200).json({
    status: "success",
    data: user,
  });
};
