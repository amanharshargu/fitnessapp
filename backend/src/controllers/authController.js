const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { calculateDailyCalorieGoal } = require("../utils/calorieCalculator");

const register = async (req, res) => {
  try {
    const { username, email, password, weight, height, age, gender, goal } =
      req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userFields = {
      username,
      email,
      password: hashedPassword,
    };

    if (weight) userFields.weight = weight;
    if (height) userFields.height = height;
    if (age) userFields.age = age;
    if (gender) userFields.gender = gender;
    if (goal) userFields.goal = goal;

    if (weight && height && age && gender && goal) {
      userFields.dailyCalorieGoal = calculateDailyCalorieGoal(
        weight,
        height,
        age,
        gender,
        goal
      );
    }

    const user = await User.create(userFields);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res
      .status(201)
      .json({
        token,
        user: { id: user.id, username: user.username, email: user.email },
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    console.log("Login attempt:", req.body);
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    req.user = null;
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging out", error: error.message });
  }
};

const checkAuth = async (req, res) => {
  try {
    res.status(200).json({
      isAuthenticated: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
      },
    });
  } catch (error) {
    console.error("Error in checkAuth:", error);
    res
      .status(500)
      .json({ message: "Error checking authentication", error: error.message });
  }
};

const googleAuthCallback = async (req, res) => {
  try {
    const { user, isNewUser, token } = req.user;
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}&isNewUser=${isNewUser}`);
  } catch (error) {
    console.error("Google auth callback error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
};

module.exports = {
  register,
  login,
  logout,
  checkAuth,
  googleAuthCallback,
};
