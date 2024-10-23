const { User } = require("../models");
const { calculateCalories } = require("../utils/calorieCalculator");
const { Op } = require("sequelize");

const getUserById = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ["password"] },
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

const formatUserResponse = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  weight: user.weight,
  height: user.height,
  age: user.age,
  gender: user.gender,
  goal: user.goal,
  activityLevel: user.activityLevel,
  photo: user.photo,
});

exports.getProfile = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    res.json(formatUserResponse(user));
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(error.message === "User not found" ? 404 : 500).json({ 
      message: error.message === "User not found" ? "User not found" : "Error fetching user profile", 
      error: error.message 
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    const { height, weight, age, gender, goal, activityLevel } = req.body;

    await user.update({
      height,
      weight,
      age,
      gender,
      goal,
      activityLevel,
    });

    res.json({ message: "User updated successfully", user: formatUserResponse(user) });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(error.message === "User not found" ? 404 : 500).json({ 
      message: error.message === "User not found" ? "User not found" : "Error updating user", 
      error: error.message 
    });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    res.json(formatUserResponse(user));
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(error.message === "User not found" ? 404 : 500).json({ 
      message: error.message === "User not found" ? "User not found" : "Internal server error", 
      error: error.message 
    });
  }
};
