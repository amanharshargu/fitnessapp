const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const db = {};

// Choose database URL based on environment
const dbUrl = env === "test" ? process.env.TEST_DB_URL : process.env.DB_URL;

// Add error handling for missing database URL
if (!dbUrl) {
  throw new Error(
    `Database URL not found for environment: ${env}\n` +
      `Make sure ${
        env === "test" ? "TEST_DB_URL" : "DB_URL"
      } is set in your .env file`
  );
}

console.log(`Connecting to ${env} database...`);

const sequelize = new Sequelize(dbUrl, {
  dialect: "postgres",
  dialectOptions: env === "test" ? {} : {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: env === "test" ? false : console.log,
  define: {
    timestamps: true,
    underscored: false, // Don't use snake_case
    freezeTableName: true, // Prevent Sequelize from pluralizing table names
  },
});

// Load models
const modelsDir = path.join(__dirname);
fs.readdirSync(modelsDir)
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    const model = require(path.join(modelsDir, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
    console.log(`Loaded model: ${model.name}`);
  });

// Associate models
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
    console.log(`Associated model: ${modelName}`);
  }
});

// Add connection error handler
sequelize
  .authenticate()
  .then(() => {
    console.log(
      `Connection to ${env} database has been established successfully.`
    );
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

// After loading and associating models
if (env !== 'production') {
  sequelize.sync({ alter: true }).then(() => {
    console.log('Database synced');
  }).catch(err => {
    console.error('Error syncing database:', err);
  });
}
