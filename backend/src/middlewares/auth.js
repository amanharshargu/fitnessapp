const jwt = require("jsonwebtoken");
const { User } = require("../models");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user info to request
    const user = await User.findByPk(decoded.id);

    // For certain routes, we want to pass through to the controller
    // to handle the 404 case
    if (
      (req.path.startsWith("/user-details") ||
        req.path === "/profile" ||
        req.path === "/update" ||
        req.path === "/upload-photo") &&
      !user
    ) {
      req.user = { id: decoded.id }; // Pass the decoded id
      return next();
    }

    // For other routes, maintain existing behavior
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    console.log("User authenticated:", req.user.id);
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};
