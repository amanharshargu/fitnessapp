const { User, EatenDish, Recipe } = require("../models");
const { calculateCalories } = require("../utils/calorieCalculator");

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

exports.getCalorieGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: [
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

    const { height, weight, age, gender, goal, activityLevel } = user;
    const dailyCalories = calculateCalories(
      weight,
      height,
      age,
      gender,
      goal,
      activityLevel
    );

    res.json({ dailyCalories });
  } catch (error) {
    console.error("Error calculating weekly calorie goal:", error);
    res.status(500).json({
      message: "Error calculating weekly calorie goal",
      error: error.message,
    });
  }
};

exports.addEatenDish = async (req, res) => {
  try {
    const userId = req.user.id;
    const { calories, dishName } = req.body;

    const eatenDish = await EatenDish.create({
      userId,
      calories,
      dishName
    });

    res.status(201).json(eatenDish);
  } catch (error) {
    console.error("Error adding eaten dish:", error);
    res.status(500).json({
      message: "Error adding eaten dish",
      error: error.message
    });
  }
};

exports.editEatenDish = async (req, res) => {
  try {
    const { id } = req.params;
    const { calories, dishName } = req.body;

    const eatenDish = await EatenDish.findByPk(id);

    if (!eatenDish) {
      return res.status(404).json({ message: "Eaten dish not found" });
    }

    if (eatenDish.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await eatenDish.update({ calories, dishName });

    res.json(eatenDish);
  } catch (error) {
    console.error("Error editing eaten dish:", error);
    res.status(500).json({
      message: "Error editing eaten dish",
      error: error.message
    });
  }
};

exports.getEatenDishes = async (req, res) => {
  try {
    const userId = req.user.id;
    const eatenDishes = await EatenDish.findAll({
      where: { userId }
    });

    res.json(eatenDishes);
  } catch (error) {
    console.error("Error fetching eaten dishes:", error);
    res.status(500).json({
      message: "Error fetching eaten dishes",
      error: error.message
    });
  }
};

exports.deleteEatenDish = async (req, res) => {
  try {
    const { id } = req.params;
    const eatenDish = await EatenDish.findByPk(id);

    if (!eatenDish) {
      return res.status(404).json({ message: "Eaten dish not found" });
    }

    if (eatenDish.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await eatenDish.destroy();

    res.json({ message: "Eaten dish deleted successfully" });
  } catch (error) {
    console.error("Error deleting eaten dish:", error);
    res.status(500).json({
      message: "Error deleting eaten dish",
      error: error.message
    });
  }
};
