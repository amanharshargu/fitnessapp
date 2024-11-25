const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Ingredient extends Model {
    static associate(models) {
      Ingredient.belongsTo(models.User, {
        foreignKey: 'UserId',
        onDelete: 'CASCADE'
      });
    }
  }

  Ingredient.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false
    },
    calories: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    protein: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    carbs: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    fat: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    servingSize: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    servingUnit: {
      type: DataTypes.STRING,
      allowNull: true
    },
    expirationDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    UserId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Ingredient',
    timestamps: true
  });

  return Ingredient;
};