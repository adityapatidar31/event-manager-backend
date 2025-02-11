const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: "none",
  };

  res.cookie("eventjwtcookie", token, cookieOptions);

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signUp = async (req, res) => {
  const { name, email, password, passwordConfirm, photo } = req.body;
  const userData = { name, email, password, passwordConfirm };
  try {
    const newUser = await User.create(userData);
    createSendToken(newUser, 201, res);
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

  createSendToken(user, 200, res);
};
