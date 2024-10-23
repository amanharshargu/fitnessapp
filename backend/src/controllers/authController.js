const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { calculateDailyCalorieGoal } = require("../utils/calorieCalculator");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { Op } = require("sequelize");

const register = async (req, res) => {
  try {
    const { username, email, password, weight, height, age, gender, goal } = req.body;

    const existingUserEmail = await User.findOne({ where: { email } });
    if (existingUserEmail) {
      return res.status(400).json({ message: "User already exists" });
    }

    const existingUserUsername = await User.findOne({ where: { username } });
    if (existingUserUsername) {
      return res.status(400).json({ message: "Username taken" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long and contain at least one uppercase and one lowercase letter",
      });
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

    res.status(201).json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    console.log("Login attempt:", req.body);
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
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
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Include all user details, including the photo
    res.json({ 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        photo: user.photo,
        // Include other fields as needed
      }
    });
  } catch (error) {
    console.error("Error in checkAuth:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const googleAuthCallback = async (req, res) => {
  try {
    const { user, isNewUser, token } = req.user;
    res.redirect(
      `${process.env.FRONTEND_URL}/dashboard?token=${token}`
    );
  } catch (error) {
    console.error("Google auth callback error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        ${resetUrl}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    });

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res
      .status(500)
      .json({ message: "Error processing request", error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long and contain at least one uppercase and one lowercase letter"
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  checkAuth,
  googleAuthCallback,
  forgotPassword,
  resetPassword,
};
