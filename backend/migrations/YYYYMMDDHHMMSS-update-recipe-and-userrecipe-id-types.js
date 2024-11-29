"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, update the Recipes table
    await queryInterface.changeColumn("Recipes", "id", {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    });

    // Then, update the UserRecipes table
    await queryInterface.changeColumn("UserRecipes", "RecipeId", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "Recipes",
        key: "id",
      },
    });

    // Also update the UserId column in UserRecipes to ensure consistency
    await queryInterface.changeColumn("UserRecipes", "UserId", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert changes in reverse order
    await queryInterface.changeColumn("UserRecipes", "UserId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    });

    await queryInterface.changeColumn("UserRecipes", "RecipeId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Recipes",
        key: "id",
      },
    });

    await queryInterface.changeColumn("Recipes", "id", {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    });
  },
};
