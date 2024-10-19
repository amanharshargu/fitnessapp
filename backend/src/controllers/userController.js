const { User } = require("../models");
const { calculateCalories } = require("../utils/calorieCalculator");
const { Op } = require("sequelize");

exports.getProfile = async (req, res) => {
  console.log("getProfile called");
  console.log("User ID:", req.user.id);
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    console.log("User found:", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error in getProfile:", error);
    res
      .status(500)
      .json({ message: "Error fetching user profile", error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { height, weight, age, gender, goal, activityLevel } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.update({
      height,
      weight,
      age,
      gender,
      goal,
      activityLevel,
    });

    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res
      .status(500)
      .json({ message: "Error updating user", error: error.message });
  }
};
