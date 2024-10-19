const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);

router.get('/', ingredientController.getIngredients);
router.post('/', ingredientController.addIngredient);
router.put('/:id', ingredientController.updateIngredient);
router.delete('/:id', ingredientController.deleteIngredient);

module.exports = router;