const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../../src/app");
const { User } = require("../../src/models");
const bcrypt = require("bcryptjs");
const { calculateCalories } = require("../../src/utils/calorieCalculator");

chai.use(chaiHttp);
const expect = chai.expect;

describe("Auth Controller", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const testUser = {
        username: "testuser",
        email: "test@example.com",
        password: "Password123!",
        height: 170,
        weight: 70,
        age: 25,
        gender: "male",
        goal: "maintain_weight",
        activityLevel: "moderatelyActive"
      };

      try {
        const expectedCalorieGoal = calculateCalories(
          testUser.weight,
          testUser.height,
          testUser.age,
          testUser.gender,
          testUser.goal,
          testUser.activityLevel
        );

        const res = await chai
          .request(app)
          .post("/api/auth/register")
          .send(testUser);

        console.log("Test User Data:", testUser);
        console.log("Registration Response:", {
          status: res.status,
          body: res.body
        });

        expect(res).to.have.status(201);
        expect(res.body).to.have.property("token");
        expect(res.body).to.have.property("user");
        expect(res.body.user).to.have.property("username", testUser.username);
        expect(res.body.user).to.have.property("email", testUser.email);

        // Verify user was created in database
        const user = await User.findOne({
          where: {
            username: testUser.username,
            email: testUser.email
          }
        });
        expect(user).to.not.be.null;
        expect(user.email).to.equal(testUser.email);
        expect(user.username).to.equal(testUser.username);
        expect(user.dailyCalorieGoal).to.equal(expectedCalorieGoal);

        // Verify password was hashed
        const validPassword = await bcrypt.compare(testUser.password, user.password);
        expect(validPassword).to.be.true;
      } catch (error) {
        console.error("Test Error Details:", {
          message: error.message,
          stack: error.stack,
          response: error.response
            ? {
                status: error.response.status,
                body: error.response.body
              }
            : null
        });
        throw error;
      }
    });

    it("should return 400 if email already exists", async () => {
      const existingUser = {
        username: "existing",
        email: "existing@example.com",
        password: "Password123!",
      };

      // First create a user
      await User.create({
        ...existingUser,
        password: await bcrypt.hash(existingUser.password, 10),
      });

      // Try to register with same email
      const res = await chai
        .request(app)
        .post("/api/auth/register")
        .send(existingUser);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property(
        "message",
        "An account with this email already exists"
      );
    });

    it("should return 400 if username already exists", async () => {
      const existingUser = {
        username: "testuser",
        email: "different@example.com",
        password: "Password123!",
      };

      // First create a user
      await User.create({
        ...existingUser,
        password: await bcrypt.hash(existingUser.password, 10),
      });

      // Try to register with same username
      const res = await chai
        .request(app)
        .post("/api/auth/register")
        .send({
          ...existingUser,
          email: "another@example.com",
        });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message", "Username taken");
    });

    it("should return 400 if password format is invalid", async () => {
      const res = await chai.request(app).post("/api/auth/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "weak",
      });

      expect(res).to.have.status(400);
      expect(res.body)
        .to.have.property("message")
        .that.includes("Password must be at least 8 characters long");
    });
  });
});
