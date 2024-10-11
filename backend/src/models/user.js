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
        allowNull: true, // Changed from false to true for oauth purposes
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
        type: DataTypes.ENUM(
          "sedentary",
          "lightlyActive",
          "moderatelyActive",
          "veryActive",
          "extraActive"
        ),
        allowNull: true,
      },
    },
    {
      tableName: "User",
    }
  );

  User.associate = (models) => {
    User.belongsToMany(models.recipe, {
      through: models.userRecipe,
      as: "savedRecipes",
      foreignKey: "UserId",
      otherKey: "RecipeId",
    });
    User.hasMany(models.ingredient, { as: "ingredient" });
    User.hasMany(models.userRecipe, { foreignKey: "UserId" });
    User.hasMany(models.eatenDish, { as: 'eatenDish', foreignKey: 'userId' });
  };

  return User;
};
