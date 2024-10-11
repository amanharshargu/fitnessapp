module.exports = (sequelize, DataTypes) => {
  const UserRecipe = sequelize.define('userRecipe', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    UserId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    RecipeId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  });

  UserRecipe.associate = (models) => {
    UserRecipe.belongsTo(models.User, { foreignKey: 'UserId' });
    UserRecipe.belongsTo(models.recipe, { foreignKey: 'RecipeId' });
  };

  return UserRecipe;
};