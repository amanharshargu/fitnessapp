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
        unique: false,
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
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      photo: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
          const rawValue = this.getDataValue('photo');
          if (rawValue && rawValue.startsWith('http')) {
            return rawValue; // It's a URL, return as is
          } else if (rawValue) {
            return `data:image/png;base64,${rawValue}`; // It's already base64
          }
          return null;
        },
        set(value) {
          if (value && typeof value === 'object' && value.buffer) {
            // It's a buffer, convert to base64
            this.setDataValue('photo', value.buffer.toString('base64'));
          } else {
            // It's already a string (URL or base64)
            this.setDataValue('photo', value);
          }
        }
      },
    },
    {
      tableName: "User",
    }
  );

  User.associate = (models) => {
    User.hasMany(models.Ingredient);
    User.belongsToMany(models.Recipe, { 
      through: models.UserRecipe,
      foreignKey: 'UserId'
    });
    User.hasMany(models.EatenDish, { foreignKey: 'userId' });
  };

  return User;
};
