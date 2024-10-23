import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
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

  const getFallbackRecipes = (count) => {
    const fallbackRecipes = [
      {
        uri: "http://www.edamam.com/ontologies/edamam.owl#recipe_1",
        label: "Grilled Chicken Salad",
        image: "https://example.com/grilled-chicken-salad.jpg",
        // ... other recipe properties
      },
      {
        uri: "http://www.edamam.com/ontologies/edamam.owl#recipe_2",
        label: "Vegetarian Pasta",
        image: "https://example.com/vegetarian-pasta.jpg",
        // ... other recipe properties
      },
      {
        uri: "http://www.edamam.com/ontologies/edamam.owl#recipe_3",
        label: "Salmon with Roasted Vegetables",
        image: "https://example.com/salmon-roasted-vegetables.jpg",
        // ... other recipe properties
      },
    ];
    return fallbackRecipes.slice(0, count);
  };

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
    ]
  );

  return (
    <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>
  );
};
