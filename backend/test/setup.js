const app = require("../src/app");
const { sequelize } = require("../src/models");

// Global setup - runs once before all tests
before(async function () {
  // Ensure we're in test environment
  process.env.NODE_ENV = "test";

  // Wait for database connection
  try {
    await sequelize.authenticate();
    console.log("Database connected for tests");
  } catch (error) {
    console.error("Unable to connect to database:", error);
    throw error;
  }
});

// Runs before each test
beforeEach(async function () {
  try {
    // Get all models
    const models = Object.values(sequelize.models);

    // Disable foreign key checks and truncate all tables
    await sequelize.transaction(async (transaction) => {
      await sequelize.query("SET CONSTRAINTS ALL DEFERRED", { transaction });

      for (const model of models) {
        if (model.name !== "SequelizeMeta") {
          await model.destroy({
            truncate: true,
            cascade: true,
            force: true,
            transaction,
          });
        }
      }
    });
  } catch (error) {
    console.error("Error in test cleanup:", error);
    throw error;
  }
});

// Global teardown - runs once after all tests
after(async function () {
  try {
    await sequelize.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error closing database connection:", error);
  }
});
