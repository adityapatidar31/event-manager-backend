const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { promisify } = require("util");

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

exports.isLoggedIn = async (req, res) => {
  try {
    if (!req.cookies.eventjwtcookie) {
      console.log("hey");
      return res.status(200).json({
        status: "success",
        user: null,
      });
    }

    const token = req.cookies.eventjwtcookie;
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(200).json({
        status: "success",
        user: null,
      });
    }

    return res.status(200).json({
      status: "success",
      data: { user: currentUser },
    });
  } catch (error) {
    return res.status(200).json({
      status: "success",
      user: null,
    });
  }
};

exports.signUp = async (req, res) => {
  try {
    const { name, email, password, passwordConfirm, photo } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const userData = { name, email, password, passwordConfirm };
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

exports.protect = async (req, res, next) => {
  // 1. Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.eventjwtcookie) {
    token = req.cookies.eventjwtcookie;
  }
  if (!token) {
    res.status(401).json({
      status: "fail",
      message: "You are not logged in! Please log in to get access.",
    });
    return;
  }

  // 2. Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    res.status(401).json({
      status: "fail",
      message: "The user belonging to this token does no longer exist.",
    });
    return;
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
};

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "You are not authorized to do this action",
      });
    }
    next();
  };
