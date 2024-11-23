const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const passport = require("passport");
const { sequelize } = require("./models");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const ingredientRoutes = require("./routes/ingredient");
const recipeRoutes = require("./routes/recipe");
const dashboardRoutes = require("./routes/dashboard");
const { PORT } = require("./config");
require("./config/passport-setup");
const path = require("path");

const app = express();

// Middleware setup
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
  })
);
app.use(helmet());
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ingredients", ingredientRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Error handling
app.use((err, req, res, _next) => {
  console.error("Error:", err);
  if (process.env.NODE_ENV === "test") {
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
      stack: err.stack,
    });
  } else {
    res.status(500).send("Something broke!");
  }
});

// Start server only in non-test environment
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
