const { Recipe, UserRecipe, User } = require("../models");

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

    if (!userId) {
      return res.status(400).json({ message: "User ID is missing" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userRecipes = await UserRecipe.findAll({
      where: { UserId: userId },
      include: [
        {
          model: Recipe,
          attributes: ['uri'],
        },
      ],
    });

    if (!userRecipes || userRecipes.length === 0) {
      return res.json([]);
    }

    const savedRecipeUris = userRecipes.map((ur) => ur.Recipe?.uri).filter(Boolean);

    res.json(savedRecipeUris);
  } catch (error) {
    console.error('Error in getSavedRecipes:', error);
    res.status(500).json({ message: "Error fetching saved recipes", error: error.message });
  }
};

exports.saveRecipe = async (req, res) => {
  try {
    const { uri } = req.params;
    const userId = req.user.id;

    if (!uri || typeof uri !== "string") {
      return res.status(400).json({ message: "Invalid recipe URI" });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID is missing" });
    }

    const [recipe] = await Recipe.findOrCreate({
      where: { uri },
      defaults: { uri }
    });

    const [userRecipe, created] = await UserRecipe.findOrCreate({
      where: { UserId: userId, RecipeId: recipe.id }
    });

    res.status(201).json({ 
      message: created ? "Recipe saved successfully" : "Recipe was already saved",
      uri: uri
    });
  } catch (error) {
    console.error("Error in saveRecipe:", error);
    res.status(500).json({ 
      message: "Error saving recipe", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.deleteRecipe = async (req, res) => {
  try {
    const { uri } = req.params;
    const userId = req.user.id;

    if (!uri || typeof uri !== "string") {
      return res.status(400).json({ message: "Invalid recipe URI" });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID is missing" });
    }

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
    res.status(500).json({ 
      message: "Error deleting recipe", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
