module.exports = (sequelize, DataTypes) => {
  const Recipe = sequelize.define("Recipe", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    uri: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
  });

  Recipe.associate = (models) => {
    Recipe.belongsToMany(models.User, {
      through: models.UserRecipe,
      foreignKey: "RecipeId",
    });
  };

  return Recipe;
};
