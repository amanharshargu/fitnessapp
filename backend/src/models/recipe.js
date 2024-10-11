module.exports = (sequelize, DataTypes) => {
  const Recipe = sequelize.define("recipe", {
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
  return Recipe;
};
