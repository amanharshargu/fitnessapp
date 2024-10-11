module.exports = (sequelize, DataTypes) => {
  const Ingredient = sequelize.define('Ingredient', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    calories: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    protein: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    carbs: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    fat: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    expirationDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  Ingredient.associate = (models) => {
    Ingredient.belongsTo(models.User);
  };

  return Ingredient;
};