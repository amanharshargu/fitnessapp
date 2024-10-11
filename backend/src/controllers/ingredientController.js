const db = require('../models');
const Ingredient = db.Ingredient;

exports.getIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.findAll({ where: { UserId: req.user.id } });
    res.json(ingredients);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).json({ message: 'Error fetching ingredients', error: error.message });
  }
};

exports.addIngredient = async (req, res) => {
  try {
    const { name, quantity, unit, calories, protein, carbs, fat, expirationDate } = req.body;
    const newIngredient = await Ingredient.create({
      name,
      quantity,
      unit,
      calories,
      protein,
      carbs,
      fat,
      expirationDate,
      UserId: req.user.id,
    });
    res.status(201).json(newIngredient);
  } catch (error) {
    console.error('Error adding ingredient:', error);
    res.status(500).json({ message: 'Error adding ingredient', error: error.message });
  }
};

exports.updateIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, unit, calories, protein, carbs, fat, expirationDate } = req.body;
    const ingredient = await Ingredient.findOne({ where: { id, UserId: req.user.id } });

    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }

    await ingredient.update({
      name,
      quantity,
      unit,
      calories,
      protein,
      carbs,
      fat,
      expirationDate,
    });

    res.json(ingredient);
  } catch (error) {
    console.error('Error updating ingredient:', error);
    res.status(500).json({ message: 'Error updating ingredient', error: error.message });
  }
};

exports.deleteIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const ingredient = await Ingredient.findOne({ where: { id, UserId: req.user.id } });

    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }

    await ingredient.destroy();
    res.json({ message: 'Ingredient deleted successfully' });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    res.status(500).json({ message: 'Error deleting ingredient', error: error.message });
  }
};