const { Recipe, User, UserRecipe } = require("../models");

exports.getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.findAll();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recipes" });
  }
};

exports.getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ message: "Invalid recipe ID format" });
    }

    const recipe = await Recipe.findByPk(id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recipe" });
  }
};

function isValidUUID(uuid) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

exports.getSuggestedRecipes = async (req, res) => {
  try {
    const suggestedRecipes = await Recipe.findAll({
      limit: 10,
      order: [["createdAt", "DESC"]],
    });
    res.json(suggestedRecipes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching suggested recipes" });
  }
};

exports.getSavedRecipes = async (req, res) => {
  try {
    const userId = req.user.id;

    const userRecipes = await UserRecipe.findAll({
      where: { UserId: userId },
      include: [
        {
          model: Recipe,
          attributes: ["uri"],
        },
      ],
    });

    const savedRecipeUris = userRecipes.map((ur) => ur.Recipe.uri);

    res.json(savedRecipeUris);
  } catch (error) {
    res.status(500).json({ message: "Error fetching saved recipes" });
  }
};

exports.saveRecipe = async (req, res) => {
  try {
    const { uri } = req.params;
    const userId = req.user.id;

    if (!uri || typeof uri !== "string") {
      return res.status(400).json({ message: "Invalid recipe URI" });
    }

    const [recipe, created] = await Recipe.findOrCreate({
      where: { uri },
      defaults: { uri },
    });

    if (!recipe) {
      return res
        .status(404)
        .json({ message: "Recipe not found or could not be created" });
    }

    const [userRecipe, userRecipeCreated] = await UserRecipe.findOrCreate({
      where: { UserId: userId, RecipeId: recipe.id }
    });

    if (!userRecipe) {
      return res
        .status(500)
        .json({ message: "Failed to save recipe for user" });
    }

    res.status(201).json({ message: "Recipe saved successfully", uri: uri });
  } catch (error) {
    res.status(500).json({ message: "Error saving recipe" });
  }
};

exports.deleteRecipe = async (req, res) => {
  try {
    const { uri } = req.params;
    const userId = req.user.id;

    const recipe = await Recipe.findOne({ where: { uri } });
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const deletedCount = await UserRecipe.destroy({
      where: { UserId: userId, RecipeId: recipe.id },
    });

    if (deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Recipe not found in user's saved recipes" });
    }

    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    res.status(500).json({ message: "Error deleting recipe" });
  }
};
