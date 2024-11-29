const request = require("supertest");
const chai = require("chai");
const expect = chai.expect;
const app = require("../../src/app");
const { User } = require("../../src/models");
const jwt = require("jsonwebtoken");

describe("User Controller", () => {
  let token;
  let user;

  beforeEach(async () => {
    user = await User.create({
      username: "testuser",
      email: "test@example.com",
      password: "Password123",
      height: 175,
      weight: 70,
      age: 25,
      gender: "male",
      goal: "maintain_weight",
      activityLevel: "moderatelyActive",
    });

    token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
  });

  afterEach(async () => {
    await User.destroy({ where: {} });
  });

  describe("GET /api/users/profile", () => {
    it("should get user profile", async () => {
      const response = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).to.equal(200);
      expect(response.body).to.include({
        username: "testuser",
        email: "test@example.com",
        height: 175,
        weight: 70,
        age: 25,
        gender: "male",
        goal: "maintain_weight",
        activityLevel: "moderatelyActive",
      });
      expect(response.body).to.not.have.property("password");
    });

    it("should return 404 for non-existent user", async () => {
      await User.destroy({ where: {} });

      const response = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).to.equal(404);
      expect(response.body.message).to.equal("User not found");
    });
  });

  describe("PUT /api/users/update", () => {
    it("should update user details", async () => {
      const updatedData = {
        height: 180,
        weight: 75,
        age: 26,
        gender: "male",
        goal: "gain_weight",
        activityLevel: "veryActive",
      };

      const response = await request(app)
        .put("/api/users/update")
        .set("Authorization", `Bearer ${token}`)
        .send(updatedData);

      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal("User updated successfully");
      expect(response.body.user).to.include(updatedData);

      const updatedUser = await User.findByPk(user.id);
      expect(updatedUser.height).to.equal(updatedData.height);
      expect(updatedUser.weight).to.equal(updatedData.weight);
      expect(updatedUser.goal).to.equal(updatedData.goal);
    });

    it("should return 404 for non-existent user", async () => {
      await User.destroy({ where: {} });

      const response = await request(app)
        .put("/api/users/update")
        .set("Authorization", `Bearer ${token}`)
        .send({
          height: 180,
          weight: 75,
        });

      expect(response.status).to.equal(404);
      expect(response.body.message).to.equal("User not found");
    });
  });

  describe("POST /api/users/upload-photo", () => {
    it("should upload user photo", async () => {
      const photoBuffer = Buffer.from("fake-image-data");

      const response = await request(app)
        .post("/api/users/upload-photo")
        .set("Authorization", `Bearer ${token}`)
        .attach("photo", photoBuffer, {
          filename: "test-photo.jpg",
          contentType: "image/jpeg",
        });

      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal("Photo uploaded successfully");
      expect(response.body.photoUrl).to.be.a("string");
      expect(response.body.photoUrl).to.include("data:image/jpeg;base64,");

      const updatedUser = await User.findByPk(user.id);
      expect(updatedUser.photo).to.be.a("string");
    });

    it("should return 400 when no file is uploaded", async () => {
      const response = await request(app)
        .post("/api/users/upload-photo")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).to.equal(400);
      expect(response.body.message).to.equal("No file uploaded");
    });
  });
});
