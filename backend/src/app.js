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

const app = express();

const corsOptions = {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(passport.initialize());

// Pre-flight requests
app.options("*", cors(corsOptions));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ingredients", ingredientRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
    await sequelize.sync({ alter: true });
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});
