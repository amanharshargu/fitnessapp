const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EatenDish = sequelize.define('EatenDish', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    dishName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    calories: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    eatenAt: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'EatenDishes',
  });

  EatenDish.associate = (models) => {
    EatenDish.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return EatenDish;
};
