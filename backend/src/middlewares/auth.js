const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { JWT_SECRET } = require("../config");

module.exports = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      throw new Error("User not found");
    }

    console.log("User authenticated:", user.id);
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res
      .status(401)
      .json({ message: "Please authenticate", error: error.message });
  }
};
