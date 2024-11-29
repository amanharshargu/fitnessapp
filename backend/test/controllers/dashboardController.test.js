const chai = require("chai");
const chaiHttp = require("chai-http");
const { app, sequelize } = require("../setup");
const { User, EatenDish, Water } = require("../../src/models");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

chai.use(chaiHttp);
const expect = chai.expect;

describe("Dashboard Controller", () => {
  let testUser;
  let authToken;

  // Helper function to create unique email
  const generateUniqueEmail = () => `dashboard_${uuidv4()}@test.com`;
  const generateUniqueUsername = () => `user_${uuidv4().slice(0, 8)}`;

  beforeEach(async () => {
    try {
      // Create test user with unique email and username
      testUser = await User.create({
        username: generateUniqueUsername(),
        email: generateUniqueEmail(),
        password: await bcrypt.hash("Password123!", 10),
        height: 170,
        weight: 70,
        age: 25,
        gender: "male",
        goal: "maintain_weight",
        activityLevel: "moderatelyActive",
        dailyCalorieGoal: 2000,
        isNewUser: false,
      });

      // Generate auth token
      authToken = jwt.sign({ id: testUser.id }, process.env.JWT_SECRET);
    } catch (error) {
      console.error("Error in test setup:", error);
      throw error;
    }
  });

  describe("GET /api/dashboard/user-details", () => {
    it("should get user details", async () => {
      const res = await chai
        .request(app)
        .get("/api/dashboard/user-details")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("username", testUser.username);
      expect(res.body).to.have.property("email", testUser.email);
      expect(res.body).to.have.property("height", testUser.height);
      expect(res.body).to.have.property("weight", testUser.weight);
    });

    it("should return 404 for non-existent user", async () => {
      // Create a new user specifically for this test
      const tempUser = await User.create({
        username: generateUniqueUsername(),
        email: generateUniqueEmail(),
        password: await bcrypt.hash("Password123!", 10),
        height: 170,
        weight: 70,
        age: 25,
        gender: "male",
        goal: "maintain_weight",
        activityLevel: "moderatelyActive",
        dailyCalorieGoal: 2000,
        isNewUser: false,
      });

      // Generate token for the temp user
      const tempToken = jwt.sign({ id: tempUser.id }, process.env.JWT_SECRET);

      // Delete the temp user to create a non-existent user scenario
      await tempUser.destroy({ force: true });

      // Verify user is actually deleted
      const deletedUser = await User.findByPk(tempUser.id);
      expect(deletedUser).to.be.null;

      // Try to access with the token of the deleted user
      const res = await chai
        .request(app)
        .get("/api/dashboard/user-details")
        .set("Authorization", `Bearer ${tempToken}`);

      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message", "User not found");
    });
  });

  describe("GET /api/dashboard/calorie-goal", () => {
    it("should get calorie goal", async () => {
      const res = await chai
        .request(app)
        .get("/api/dashboard/calorie-goal")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("dailyCalories");
      expect(res.body.dailyCalories).to.be.a("number");
    });
  });

  describe("POST /api/dashboard/eaten-dishes", () => {
    it("should add eaten dish", async () => {
      const dishData = {
        calories: 500,
        dishName: "Test Meal",
        eatenAt: moment().format("YYYY-MM-DD"),
      };

      try {
        const res = await chai
          .request(app)
          .post("/api/dashboard/eaten-dishes")
          .set("Authorization", `Bearer ${authToken}`)
          .send(dishData);

        expect(res).to.have.status(201);
        expect(res.body).to.have.property("calories", dishData.calories);
        expect(res.body).to.have.property("dishName", dishData.dishName);
        expect(res.body).to.have.property("userId", testUser.id);

        // Verify the dish was actually created
        const createdDish = await EatenDish.findOne({
          where: {
            userId: testUser.id,
            dishName: dishData.dishName,
            eatenAt: dishData.eatenAt,
          },
        });
        expect(createdDish).to.not.be.null;
        expect(createdDish.calories).to.equal(dishData.calories);
      } catch (error) {
        console.error("Test Error Details:", error);
        throw error;
      }
    });
  });

  describe("GET /api/dashboard/eaten-dishes", () => {
    beforeEach(async () => {
      await EatenDish.bulkCreate([
        {
          userId: testUser.id,
          calories: 500,
          dishName: "Breakfast",
          eatenAt: moment().format("YYYY-MM-DD"),
        },
        {
          userId: testUser.id,
          calories: 700,
          dishName: "Lunch",
          eatenAt: moment().format("YYYY-MM-DD"),
        },
      ]);
    });

    it("should get today's eaten dishes", async () => {
      const res = await chai
        .request(app)
        .get("/api/dashboard/eaten-dishes")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array");
      expect(res.body).to.have.lengthOf(2);
      expect(res.body[0]).to.have.property("dishName");
      expect(res.body[0]).to.have.property("calories");
    });
  });

  describe("GET /api/dashboard/weekly-calorie-data", () => {
    beforeEach(async () => {
      // Add test data for the week
      const today = moment();
      await EatenDish.bulkCreate([
        {
          userId: testUser.id,
          calories: 2000,
          dishName: "Today's meals",
          eatenAt: today.toDate(),
        },
        {
          userId: testUser.id,
          calories: 1800,
          dishName: "Yesterday's meals",
          eatenAt: today.subtract(1, "days").toDate(),
        },
      ]);
    });

    it("should get weekly calorie data", async () => {
      const res = await chai
        .request(app)
        .get("/api/dashboard/weekly-calorie-data")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array");
      expect(res.body).to.have.lengthOf(7);
      expect(res.body[0]).to.have.all.keys("day", "date", "calories", "goal");
    });
  });

  describe("Water Intake Endpoints", () => {
    describe("POST /api/dashboard/water-intake", () => {
      it("should add water intake", async () => {
        const waterData = { amount: 250 };

        const res = await chai
          .request(app)
          .post("/api/dashboard/water-intake")
          .set("Authorization", `Bearer ${authToken}`)
          .send(waterData);

        expect(res).to.have.status(201);
        expect(res.body).to.have.property("intake");
        expect(parseInt(res.body.intake)).to.equal(250);
      });

      it("should reject invalid water amount", async () => {
        const res = await chai
          .request(app)
          .post("/api/dashboard/water-intake")
          .set("Authorization", `Bearer ${authToken}`)
          .send({ amount: -100 });

        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message", "Invalid amount");
      });
    });

    describe("GET /api/dashboard/water-intake", () => {
      beforeEach(async () => {
        await Water.bulkCreate([
          {
            userId: testUser.id,
            amount: 250,
            date: moment().format("YYYY-MM-DD"),
          },
          {
            userId: testUser.id,
            amount: 300,
            date: moment().format("YYYY-MM-DD"),
          },
        ]);
      });

      it("should get today's water intake", async () => {
        const res = await chai
          .request(app)
          .get("/api/dashboard/water-intake")
          .set("Authorization", `Bearer ${authToken}`);

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("intake");
        expect(parseInt(res.body.intake)).to.equal(550);
      });
    });
  });

  // Clean up after each test
  afterEach(async () => {
    try {
      if (testUser?.id) {
        // Delete related records first
        await Water.destroy({
          where: { userId: testUser.id },
          force: true,
        });

        await EatenDish.destroy({
          where: { userId: testUser.id },
          force: true,
        });

        // Then delete the user
        await testUser.destroy({ force: true });
      }
    } catch (error) {
      console.error("Error in test cleanup:", error);
    }
  });
});
