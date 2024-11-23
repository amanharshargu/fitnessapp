const { createClient } = require("@supabase/supabase-js");
const { Sequelize } = require("sequelize");
require("dotenv").config();

let sequelize;
const app = require("../src/app");

// Global setup - runs once before all tests
before(async function () {
  this.timeout(30000);

  try {
    // Create new Sequelize instance for tests
    sequelize = new Sequelize(process.env.TEST_DB_URL, {
      dialect: "postgres",
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
        connectTimeout: 60000,
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 60000,
        idle: 20000,
      },
      logging: false,
    });

    // Test connection
    await sequelize.authenticate();
    console.log("Database connected for tests");

    // Import models
    const models = require("../src/models");

    // Log model registration
    console.log("Registered models:", Object.keys(models));

    // Sync tables in correct order based on dependencies
    await models.User.sync({ force: true }); // User first
    await models.Recipe.sync({ force: true }); // Recipe before UserRecipe
    await models.Ingredient.sync({ force: true }); // Ingredient independent
    await models.EatenDish.sync({ force: true }); // EatenDish depends on User
    await models.Water.sync({ force: true }); // Water depends on User
    await models.UserRecipe.sync({ force: true }); // UserRecipe depends on both User and Recipe

    console.log("Database synced");
    console.log("Test app initialized");
  } catch (error) {
    console.error("Setup failed:", error);
    console.error("Available models:", Object.keys(sequelize.models));
    throw error;
  }
});

// Runs before each test
beforeEach(async function () {
  this.timeout(10000);

  try {
    // Use models to clean up instead of raw queries
    const models = require("../src/models");

    // Clean up in correct order due to foreign key constraints
    await models.EatenDish.destroy({ where: {}, force: true });
    await models.Water.destroy({ where: {}, force: true });
    await models.UserRecipe.destroy({ where: {}, force: true });
    await models.Recipe.destroy({ where: {}, force: true });
    await models.Ingredient.destroy({ where: {}, force: true });
    await models.User.destroy({ where: {}, force: true });

    console.log("Test database cleaned");
  } catch (error) {
    console.error("Error in test cleanup:", error);
    throw error;
  }
});

// Global teardown - runs once after all tests
after(async function () {
  this.timeout(10000);

  if (sequelize) {
    try {
      await sequelize.close();
      console.log("Database connection closed");
    } catch (error) {
      console.error("Error closing database connection:", error);
    }
  }
});

// Export both app and sequelize
module.exports = { app, sequelize };
