const { User, EatenDish, Water } = require("../models");
const { calculateCalories } = require("../utils/calorieCalculator");
const { Op } = require("sequelize");
const moment = require("moment");
const sequelize = require("../models").sequelize;

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
        "photo",
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
      activityLevel,
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
    const { calories, dishName, eatenAt } = req.body;

    const eatenDish = await EatenDish.create({
      userId,
      calories,
      dishName,
      eatenAt: eatenAt || new Date(),
    });

    res.status(201).json(eatenDish);
  } catch (error) {
    console.error("Error adding eaten dish:", error);
    res.status(500).json({
      message: "Error adding eaten dish",
      error: error.message,
    });
  }
};

exports.editEatenDish = async (req, res) => {
  try {
    const { id } = req.params;
    const { calories, dishName, eatenAt } = req.body;

    const eatenDish = await EatenDish.findByPk(id);

    if (!eatenDish) {
      return res.status(404).json({ message: "Eaten dish not found" });
    }

    if (eatenDish.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await eatenDish.update({ calories, dishName, eatenAt });

    res.json(eatenDish);
  } catch (error) {
    console.error("Error editing eaten dish:", error);
    res.status(500).json({
      message: "Error editing eaten dish",
      error: error.message,
    });
  }
};

exports.getEatenDishes = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eatenDishes = await EatenDish.findAll({
      where: {
        userId,
        eatenAt: {
          [Op.gte]: today,
        },
      },
    });

    res.json(eatenDishes);
  } catch (error) {
    console.error("Error fetching eaten dishes:", error);
    res.status(500).json({
      message: "Error fetching eaten dishes",
      error: error.message,
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
      error: error.message,
    });
  }
};

exports.getWeeklyCalorieData = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = moment().endOf("day");
    const startOfWeek = moment().startOf("week");

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
    const dailyCalorieGoal = calculateCalories(
      weight,
      height,
      age,
      gender,
      goal,
      activityLevel,
    );

    const weeklyData = await EatenDish.findAll({
      where: {
        userId,
        eatenAt: {
          [Op.between]: [startOfWeek.toDate(), today.toDate()],
        },
      },
      attributes: [
        [sequelize.fn("date", sequelize.col("eatenAt")), "date"],
        [sequelize.fn("sum", sequelize.col("calories")), "totalCalories"],
      ],
      group: [sequelize.fn("date", sequelize.col("eatenAt"))],
      order: [[sequelize.fn("date", sequelize.col("eatenAt")), "ASC"]],
    });

    const formattedWeeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = moment(startOfWeek).add(i, "days");
      const dayData = weeklyData.find((d) =>
        moment(d.getDataValue("date")).isSame(date, "day"),
      );
      return {
        day: date.format("ddd"),
        date: date.format("YYYY-MM-DD"),
        calories: dayData ? parseInt(dayData.getDataValue("totalCalories")) : 0,
        goal: dailyCalorieGoal,
      };
    });

    res.json(formattedWeeklyData);
  } catch (error) {
    console.error("Error fetching weekly calorie data:", error);
    res.status(500).json({
      message: "Error fetching weekly calorie data",
      error: error.message,
    });
  }
};

exports.getWaterIntake = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = moment().startOf("day");

    const waterIntakes = await Water.findAll({
      where: {
        userId,
        date: today.format("YYYY-MM-DD"),
      },
    });

    const totalIntake = waterIntakes.reduce(
      (sum, record) => sum + record.amount,
      0,
    );
    res.json({ intake: totalIntake });
  } catch (error) {
    console.error("Error fetching water intake:", error);
    res.status(500).json({
      message: "Error fetching water intake",
      error: error.message,
    });
  }
};

exports.addWaterIntake = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const today = moment().format("YYYY-MM-DD");

    const [waterIntake, created] = await Water.findOrCreate({
      where: {
        userId,
        date: today,
      },
      defaults: {
        amount: 0,
      },
    });

    const updatedAmount = waterIntake.amount + amount;
    await waterIntake.update({ amount: updatedAmount });

    res.status(201).json({ intake: updatedAmount });
  } catch (error) {
    console.error("Error adding water intake:", error);
    res.status(500).json({
      message: "Error adding water intake",
      error: error.message,
    });
  }
};
