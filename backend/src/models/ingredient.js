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
    servingSize: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null,
    },
    servingUnit: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
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