import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
import api from "../services/api";

const RecipeContext = createContext();

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error("useRecipes must be used within a RecipeProvider");
  }
  return context;
};

export const RecipeProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchLikedRecipes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/recipes/saved");
      const uris = response.data;
      const detailedRecipes = await Promise.all(
        uris.map((uri) => fetchRecipeDetails(uri))
      );
      setLikedRecipes(detailedRecipes);
    } catch (error) {
      console.error("Error fetching liked recipes:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRecipeDetails = async (uri) => {
    const params = new URLSearchParams({
      type: "public",
      app_id: process.env.REACT_APP_EDAMAM_APP_ID,
      app_key: process.env.REACT_APP_EDAMAM_APP_KEY,
      uri: uri,
    });

    const response = await axios.get(
      `https://api.edamam.com/api/recipes/v2/by-uri?${params}`
    );
    return response.data.hits[0].recipe;
  };

  const toggleLikedRecipe = useCallback(
    async (recipe) => {
      try {
        const isCurrentlyLiked = likedRecipes.some(
          (likedRecipe) => likedRecipe.uri === recipe.uri
        );
        if (isCurrentlyLiked) {
          await api.delete(`/recipes/save/${encodeURIComponent(recipe.uri)}`);
          setLikedRecipes((prevLikedRecipes) =>
            prevLikedRecipes.filter(
              (likedRecipe) => likedRecipe.uri !== recipe.uri
            )
          );
        } else {
          await api.post(
            `/recipes/save/${encodeURIComponent(recipe.uri)}`,
            recipe
          );
          setLikedRecipes((prevLikedRecipes) => [...prevLikedRecipes, recipe]);
        }
      } catch (error) {
        console.error("Error toggling liked recipe:", error);
      }
    },
    [likedRecipes]
  );

  const fetchRecipes = useCallback(async (term, filters = {}) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        type: "public",
        q: term,
        app_id: process.env.REACT_APP_EDAMAM_APP_ID,
        app_key: process.env.REACT_APP_EDAMAM_APP_KEY,
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => params.append(key, item));
        } else {
          params.append(key, value);
        }
      });

      const response = await axios.get(
        `https://api.edamam.com/api/recipes/v2?${params.toString()}`
      );
      setRecipes(response.data.hits.map((hit) => hit.recipe));
      setHasSearched(true);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRandomRecipes = useCallback(async (count, ingredients = []) => {
    setIsLoading(true);
    try {
      if (ingredients.length === 0) {
        const calculateIngredientRange = () => {
          const minIngr = Math.floor(Math.random() * 5) + 3;
          const maxIngr = minIngr + Math.floor(Math.random() * 5) + 3;
          return `${minIngr}-${maxIngr}`;
        };

        const ingredientRange = calculateIngredientRange();

        const response = await axios.get(
          "https://api.edamam.com/api/recipes/v2",
          {
            params: {
              type: "any",
              app_id: process.env.REACT_APP_EDAMAM_APP_ID,
              app_key: process.env.REACT_APP_EDAMAM_APP_KEY,
              random: true,
              q: "",
              ingr: ingredientRange,
            },
          }
        );

        if (response.data && response.data.hits && response.data.hits.length > 0) {
          const randomRecipes = response.data.hits
            .slice(0, count)
            .map((hit) => hit.recipe);
          return randomRecipes;
        }
      } else {
        const numIngredients = Math.floor(Math.random() * 2) + 2; // 2 or 3
        const shuffled = ingredients.sort(() => 0.5 - Math.random());
        const selectedIngredients = shuffled.slice(0, numIngredients);
        const ingredientQuery = selectedIngredients.join(" ");

        const response = await axios.get(
          "https://api.edamam.com/api/recipes/v2",
          {
            params: {
              type: "any",
              app_id: process.env.REACT_APP_EDAMAM_APP_ID,
              app_key: process.env.REACT_APP_EDAMAM_APP_KEY,
              q: ingredientQuery,
              random: true,
            },
          }
        );

        if (response.data && response.data.hits && response.data.hits.length > 0) {
          const randomRecipes = response.data.hits
            .slice(0, count)
            .map((hit) => hit.recipe);
          return randomRecipes;
        }
      }

      return getFallbackRecipes(count);
    } catch (error) {
      console.error("Error fetching random recipes:", error);
      return getFallbackRecipes(count);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCuratedDishes = useCallback(async (count) => {
    const curatedRecipes = [
      {
        uri: "recipe_1",
        label: "Mediterranean Buddha Bowl",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
        calories: 450,
        url: "https://unsplash.com/photos/buddha-bowl",
      },
      {
        uri: "recipe_2",
        label: "Grilled Salmon with Asparagus",
        image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800",
        calories: 380,
        url: "https://unsplash.com/photos/grilled-salmon",
      },
      {
        uri: "recipe_3",
        label: "Colorful Quinoa Salad",
        image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800",
        calories: 320,
        url: "https://unsplash.com/photos/quinoa-salad",
      },
      {
        uri: "recipe_4",
        label: "Avocado Toast with Eggs",
        image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800",
        calories: 280,
        url: "https://unsplash.com/photos/avocado-toast",
      },
      {
        uri: "recipe_5",
        label: "Berry Smoothie Bowl",
        image: "https://images.unsplash.com/photo-1494597564530-871f2b93ac55?w=800",
        calories: 290,
        url: "https://unsplash.com/photos/smoothie-bowl",
      },
      {
        uri: "recipe_6",
        label: "Grilled Chicken & Vegetables",
        image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800",
        calories: 410,
        url: "https://unsplash.com/photos/grilled-chicken",
      },
      {
        uri: "recipe_7",
        label: "Fresh Poke Bowl",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
        calories: 440,
        url: "https://unsplash.com/photos/poke-bowl",
      },
      {
        uri: "recipe_8",
        label: "Mediterranean Mezze Platter",
        image: "https://images.unsplash.com/photo-1544510808-91bcbee1df55?w=800",
        calories: 520,
        url: "https://unsplash.com/photos/mezze-platter",
      },
      {
        uri: "recipe_9",
        label: "Green Power Salad",
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800",
        calories: 280,
        url: "https://unsplash.com/photos/power-salad",
      },
      {
        uri: "recipe_10",
        label: "Roasted Sweet Potato Bowl",
        image: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=800",
        calories: 390,
        url: "https://unsplash.com/photos/sweet-potato-bowl",
      }
    ];

    const shuffled = curatedRecipes.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }, []);

  const value = useMemo(
    () => ({
      recipes,
      setRecipes,
      likedRecipes,
      isLoading,
      fetchRecipes,
      toggleLikedRecipe,
      searchTerm,
      setSearchTerm,
      hasSearched,
      setHasSearched,
      showFilters,
      setShowFilters,
      fetchLikedRecipes,
      getRandomRecipes,
      getCuratedDishes,
    }),
    [
      recipes,
      likedRecipes,
      isLoading,
      fetchRecipes,
      toggleLikedRecipe,
      searchTerm,
      hasSearched,
      showFilters,
      fetchLikedRecipes,
      getRandomRecipes,
      getCuratedDishes,
    ]
  );

  return (
    <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>
  );
};
