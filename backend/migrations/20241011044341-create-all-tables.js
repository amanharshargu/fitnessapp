"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Users", {
      // Define User table schema
    });

    await queryInterface.createTable("Ingredients", {
      // Define Ingredient table schema
    });

    await queryInterface.createTable("Recipes", {
      // Define Recipe table schema
    });

    // Add more tables as needed
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Recipes");
    await queryInterface.dropTable("Ingredients");
    await queryInterface.dropTable("Users");
    // Drop other tables in reverse order
  },
};
