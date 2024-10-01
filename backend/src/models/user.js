module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true, // Changed from false to true
      },
      weight: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      height: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      gender: {
        type: DataTypes.ENUM("male", "female", "other"),
        allowNull: true,
      },
      goal: {
        type: DataTypes.ENUM("lose_weight", "maintain_weight", "gain_weight"),
        allowNull: true,
      },
      dailyCalorieGoal: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 2000,
      },
      googleId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      isNewUser: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      activityLevel: {
        type: DataTypes.ENUM("sedentary", "lightlyActive", "moderatelyActive", "veryActive", "extraActive"),
        allowNull: true,
      },
    },
    {
      tableName: "Users",
    }
  );

  User.associate = (models) => {
    User.belongsToMany(models.Recipe, {
      through: models.UserRecipe,
      as: "savedRecipes",
      foreignKey: "UserId",
      otherKey: "RecipeId",
    });
    User.hasMany(models.Ingredient, { as: "ingredients" });
    User.hasMany(models.UserRecipe, { foreignKey: "UserId" });
  };

  return User;
};
