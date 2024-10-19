module.exports = (sequelize, DataTypes) => {
  const UserRecipe = sequelize.define('UserRecipe', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    UserId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id'
      }
    },
    RecipeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Recipe',
        key: 'id'
      }
    },
  });

  UserRecipe.associate = (models) => {
    UserRecipe.belongsTo(models.User, { foreignKey: 'UserId' });
    UserRecipe.belongsTo(models.Recipe, { foreignKey: 'RecipeId' });
  };

  return UserRecipe;
};