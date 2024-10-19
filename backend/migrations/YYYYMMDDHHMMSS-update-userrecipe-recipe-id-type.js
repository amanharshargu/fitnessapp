'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('UserRecipes', 'RecipeId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'Recipes',
        key: 'id'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('UserRecipes', 'RecipeId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Recipes',
        key: 'id'
      }
    });
  }
};