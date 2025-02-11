const User = require("../models/userModel");

exports.getAllUsers = async (req, res) => {
  try {
    // console.log(User);
    const users = await User.find();
    res
      .status(200)
      .json({ status: "success", length: users.length, data: users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "fail", message: error.message });
  }
};
