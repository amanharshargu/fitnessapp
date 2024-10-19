const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipeController");
const authMiddleware = require("../middlewares/auth");

router.use(authMiddleware);

router.get("/", recipeController.getRecipes);
router.get("/suggested", recipeController.getSuggestedRecipes);
router.get("/saved", recipeController.getSavedRecipes);
router.get("/:id", recipeController.getRecipeById);
router.post("/save/:uri", recipeController.saveRecipe);
router.delete("/save/:uri", recipeController.deleteRecipe);

module.exports = router;
