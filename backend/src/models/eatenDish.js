const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class EatenDish extends Model {
    static associate(models) {
      EatenDish.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }

  EatenDish.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
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
    modelName: 'EatenDish',
  });

  return EatenDish;
};
