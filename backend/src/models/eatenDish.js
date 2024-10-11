const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class EatenDish extends Model {
    static associate(models) {
      EatenDish.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }

  EatenDish.init({
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id'
      }
    },
    calories: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    dishName: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'eatenDish',
  });

  return EatenDish;
};
