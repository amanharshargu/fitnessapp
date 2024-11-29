const request = require("supertest");
const chai = require("chai");
const expect = chai.expect;
const app = require("../../src/app");
const { User, Recipe, UserRecipe } = require("../../src/models");
const jwt = require("jsonwebtoken");

describe("Recipe Controller", () => {
  let token;
  let user;
  let testRecipe;

  beforeEach(async () => {
    user = await User.create({
      username: "testuser",
      email: "test@example.com",
      password: "Password123",
    });

    token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    testRecipe = await Recipe.create({
      uri: "http://www.edamam.com/ontologies/edamam.owl#recipe_test123",
    });
  });

  afterEach(async () => {
    await UserRecipe.destroy({ where: {} });
    await Recipe.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  describe("GET /api/recipes", () => {
    it("should get all recipes", async () => {
      const response = await request(app)
        .get("/api/recipes")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).to.equal(200);
      expect(Array.isArray(response.body)).to.be.true;
      expect(response.body.length).to.equal(1);
      expect(response.body[0].uri).to.equal(testRecipe.uri);
    });
  });

  describe("GET /api/recipes/:id", () => {
    it("should get a recipe by id", async () => {
      const response = await request(app)
        .get(`/api/recipes/${testRecipe.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).to.equal(200);
      expect(response.body.uri).to.equal(testRecipe.uri);
    });

    it("should return 404 for non-existent recipe", async () => {
      const response = await request(app)
        .get("/api/recipes/123e4567-e89b-12d3-a456-426614174000")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).to.equal(404);
    });

    it("should return 400 for invalid recipe ID format", async () => {
      const response = await request(app)
        .get("/api/recipes/invalid-id")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).to.equal(400);
    });
  });

  describe("GET /api/recipes/suggested", () => {
    it("should get suggested recipes", async () => {
      const response = await request(app)
        .get("/api/recipes/suggested")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).to.equal(200);
      expect(Array.isArray(response.body)).to.be.true;
    });
  });

  describe("GET /api/recipes/saved", () => {
    beforeEach(async () => {
      await UserRecipe.create({
        UserId: user.id,
        RecipeId: testRecipe.id,
      });
    });

    it("should get saved recipes for a user", async () => {
      const response = await request(app)
        .get("/api/recipes/saved")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).to.equal(200);
      expect(Array.isArray(response.body)).to.be.true;
      expect(response.body.length).to.equal(1);
      expect(response.body[0]).to.equal(testRecipe.uri);
    });

    it("should return empty array when user has no saved recipes", async () => {
      await UserRecipe.destroy({ where: {} });

      const response = await request(app)
        .get("/api/recipes/saved")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).to.equal(200);
      expect(Array.isArray(response.body)).to.be.true;
      expect(response.body.length).to.equal(0);
    });
  });

  describe("POST /api/recipes/save/:uri", () => {
    it("should save a new recipe for a user", async () => {
      const recipeUri =
        "http://www.edamam.com/ontologies/edamam.owl#recipe_new123";

      const response = await request(app)
        .post(`/api/recipes/save/${encodeURIComponent(recipeUri)}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).to.equal(201);
      expect(response.body.message).to.equal("Recipe saved successfully");
      expect(response.body.uri).to.equal(recipeUri);

      const recipe = await Recipe.findOne({ where: { uri: recipeUri } });
      expect(recipe).to.not.be.null;

      const savedRecipe = await UserRecipe.findOne({
        where: { UserId: user.id, RecipeId: recipe.id },
      });
      expect(savedRecipe).to.not.be.null;
    });

    it("should save an existing recipe for a user", async () => {
      const response = await request(app)
        .post(`/api/recipes/save/${encodeURIComponent(testRecipe.uri)}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).to.equal(201);
      expect(response.body.message).to.equal("Recipe saved successfully");
      expect(response.body.uri).to.equal(testRecipe.uri);

      const savedRecipe = await UserRecipe.findOne({
        where: { UserId: user.id, RecipeId: testRecipe.id },
      });
      expect(savedRecipe).to.not.be.null;
    });

    it("should return appropriate message when recipe is already saved", async () => {
      await UserRecipe.create({
        UserId: user.id,
        RecipeId: testRecipe.id,
      });

      const response = await request(app)
        .post(`/api/recipes/save/${encodeURIComponent(testRecipe.uri)}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).to.equal(201);
      expect(response.body.message).to.equal("Recipe was already saved");
    });

    it("should return 404 for invalid recipe URI", async () => {
      const response = await request(app)
        .post("/api/recipes/save/")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).to.equal(404);
    });
  });

  describe("DELETE /api/recipes/save/:uri", () => {
    beforeEach(async () => {
      await UserRecipe.create({
        UserId: user.id,
        RecipeId: testRecipe.id,
      });
    });

    it("should delete a saved recipe", async () => {
      const response = await request(app)
        .delete(`/api/recipes/save/${encodeURIComponent(testRecipe.uri)}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal("Recipe deleted successfully");

      const savedRecipe = await UserRecipe.findOne({
        where: { UserId: user.id, RecipeId: testRecipe.id },
      });
      expect(savedRecipe).to.be.null;
    });

    it("should return 404 when recipe is not saved", async () => {
      await UserRecipe.destroy({ where: {} });

      const response = await request(app)
        .delete(`/api/recipes/save/${encodeURIComponent(testRecipe.uri)}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).to.equal(404);
    });

    it("should return 404 for invalid recipe URI", async () => {
      const response = await request(app)
        .delete("/api/recipes/save/")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).to.equal(404);
    });
  });
});
