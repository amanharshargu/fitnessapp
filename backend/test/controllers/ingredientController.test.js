const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('../../src/app');
const { User, Ingredient } = require('../../src/models');
const jwt = require('jsonwebtoken');

describe('Ingredient Controller', () => {
  let token;
  let user;
  let testIngredient;

  beforeEach(async () => {
    user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123'
    });

    token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    testIngredient = await Ingredient.create({
      name: 'Test Ingredient',
      quantity: 100,
      unit: 'g',
      calories: 50,
      protein: 5,
      carbs: 10,
      fat: 2,
      expirationDate: new Date('2024-12-31'),
      UserId: user.id
    });
  });

  afterEach(async () => {
    await Ingredient.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  describe('GET /api/ingredients', () => {
    it('should get all ingredients for a user', async () => {
      const response = await request(app)
        .get('/api/ingredients')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).to.equal(200);
      expect(Array.isArray(response.body)).to.be.true;
      expect(response.body.length).to.equal(1);
      expect(response.body[0].name).to.equal('Test Ingredient');
    });

    it('should return empty array when user has no ingredients', async () => {
      await Ingredient.destroy({ where: {} });

      const response = await request(app)
        .get('/api/ingredients')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).to.equal(200);
      expect(Array.isArray(response.body)).to.be.true;
      expect(response.body.length).to.equal(0);
    });
  });

  describe('POST /api/ingredients', () => {
    it('should add a new ingredient', async () => {
      const newIngredient = {
        name: 'New Ingredient',
        quantity: 200,
        unit: 'ml',
        calories: 150,
        protein: 8,
        carbs: 20,
        fat: 5,
        expirationDate: '2024-12-31'
      };

      const response = await request(app)
        .post('/api/ingredients')
        .set('Authorization', `Bearer ${token}`)
        .send(newIngredient);

      expect(response.status).to.equal(201);
      expect(response.body.name).to.equal(newIngredient.name);
      expect(parseFloat(response.body.quantity)).to.equal(newIngredient.quantity);
    });

    it('should fail when required fields are missing', async () => {
      const invalidIngredient = {
        name: 'Invalid Ingredient'
      };

      const response = await request(app)
        .post('/api/ingredients')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidIngredient);

      expect(response.status).to.equal(500);
    });
  });

  describe('PUT /api/ingredients/:id', () => {
    it('should update an existing ingredient', async () => {
      const updatedData = {
        name: 'Updated Ingredient',
        quantity: 150,
        unit: 'g',
        calories: 75,
        protein: 7,
        carbs: 15,
        fat: 3,
        expirationDate: '2024-12-31'
      };

      const response = await request(app)
        .put(`/api/ingredients/${testIngredient.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData);

      expect(response.status).to.equal(200);
      expect(response.body.name).to.equal(updatedData.name);
      expect(response.body.quantity).to.equal(updatedData.quantity);
    });

    it('should return 404 for non-existent ingredient', async () => {
      const response = await request(app)
        .put('/api/ingredients/123e4567-e89b-12d3-a456-426614174000')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Ingredient',
          quantity: 150
        });

      expect(response.status).to.equal(404);
    });
  });

  describe('DELETE /api/ingredients/:id', () => {
    it('should delete an existing ingredient', async () => {
      const response = await request(app)
        .delete(`/api/ingredients/${testIngredient.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal('Ingredient deleted successfully');

      const deletedIngredient = await Ingredient.findByPk(testIngredient.id);
      expect(deletedIngredient).to.be.null;
    });

    it('should return 404 for non-existent ingredient', async () => {
      const response = await request(app)
        .delete('/api/ingredients/123e4567-e89b-12d3-a456-426614174000')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).to.equal(404);
    });
  });
}); 