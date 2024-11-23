const chai = require("chai");
const chaiHttp = require("chai-http");
const { app, sequelize } = require("../setup");
const { User } = require("../../src/models");
const bcrypt = require("bcryptjs");
const { calculateCalories } = require("../../src/utils/calorieCalculator");

chai.use(chaiHttp);
const expect = chai.expect;

describe("Auth Controller", () => {
  beforeEach(async () => {
    // Clean up using model instead of raw query
    try {
      await User.destroy({
        where: {},
        force: true,
        truncate: { cascade: true }
      });
    } catch (error) {
      console.error('Error cleaning up User table:', error);
      throw error;
    }
  });

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
        // Verify user doesn't exist
        const existingUser = await User.findOne({
          where: { email: testUser.email }
        });
        expect(existingUser).to.be.null;

        const res = await chai
          .request(app)
          .post("/api/auth/register")
          .send(testUser);

        expect(res).to.have.status(201);
        expect(res.body).to.have.property("token");
        expect(res.body).to.have.property("user");
        expect(res.body.user).to.have.property("username", testUser.username);
        expect(res.body.user).to.have.property("email", testUser.email);

        // Verify user was created
        const user = await User.findOne({
          where: { email: testUser.email }
        });
        expect(user).to.not.be.null;
        expect(user.email).to.equal(testUser.email);
        expect(user.username).to.equal(testUser.username);

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
      // First create a user
      await User.create({
        username: "existing",
        email: "existing@example.com",
        password: await bcrypt.hash("Password123!", 10)
      });

      // Try to register with same email
      const res = await chai
        .request(app)
        .post("/api/auth/register")
        .send({
          username: "newuser",
          email: "existing@example.com",
          password: "Password123!"
        });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property(
        "message",
        "An account with this email already exists"
      );
    });

    it("should return 400 if username already exists", async () => {
      // First create a user
      await User.create({
        username: "testuser",
        email: "test1@example.com",
        password: await bcrypt.hash("Password123!", 10)
      });

      // Try to register with same username
      const res = await chai
        .request(app)
        .post("/api/auth/register")
        .send({
          username: "testuser",
          email: "test2@example.com",
          password: "Password123!"
        });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message", "Username taken");
    });

    it("should return 400 if password format is invalid", async () => {
      const res = await chai
        .request(app)
        .post("/api/auth/register")
        .send({
          username: "newuser",
          email: "new@example.com",
          password: "weak"  // Invalid password
        });

      expect(res).to.have.status(400);
      expect(res.body.message).to.equal(
        "Password must be at least 8 characters long and contain at least one uppercase and one lowercase letter"
      );
    });
  });

  // Add more test cases for login, logout, etc.
});
