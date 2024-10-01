const { User } = require("../models");

exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: [
        "id",
        "username",
        "email",
        "height",
        "weight",
        "age",
        "gender",
        "goal",
        "activityLevel",
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res
      .status(500)
      .json({ message: "Error fetching user details", error: error.message });
  }
};

const { calculateCalories } = require("../utils/calorieCalculator");

exports.getCalorieGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: ["height", "weight", "age", "gender", "goal", "activityLevel"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { height, weight, age, gender, goal, activityLevel } = user;
    const dailyCalories = calculateCalories(weight, height, age, gender, goal, activityLevel);

    res.json({ dailyCalories });
  } catch (error) {
    console.error("Error calculating weekly calorie goal:", error);
    res.status(500).json({
      message: "Error calculating weekly calorie goal",
      error: error.message,
    });
  }
};
