import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const EDAMAM_APP_ID = process.env.REACT_APP_EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.REACT_APP_EDAMAM_APP_KEY;

export const useLikedRecipes = () => {
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const fetchRecipeDetails = async (uri) => {
    const params = new URLSearchParams({
      type: "public",
      app_id: EDAMAM_APP_ID,
      app_key: EDAMAM_APP_KEY,
      uri: uri,
    });

    const response = await fetch(
      `https://api.edamam.com/api/recipes/v2/by-uri?${params}`
    );
    const data = await response.json();
    return data.hits[0].recipe;
  };

  const fetchLikedRecipes = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get("/recipes/saved");
      const uris = response.data;

      const detailedRecipes = await Promise.all(
        uris.map((uri) => fetchRecipeDetails(uri))
      );

      setLikedRecipes(detailedRecipes);
    } catch (error) {
      console.error("Error fetching liked recipes:", error);
      setError("Failed to fetch liked recipes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLikedRecipes();
  }, [fetchLikedRecipes]);

  const handleLikeToggle = async (recipeUri) => {
    try {
      if (likedRecipes.some((recipe) => recipe.uri === recipeUri)) {
        await api.delete(`/recipes/save/${encodeURIComponent(recipeUri)}`);
        setLikedRecipes((prevLiked) =>
          prevLiked.filter((recipe) => recipe.uri !== recipeUri)
        );
      } else {
        await api.post(`/recipes/save/${encodeURIComponent(recipeUri)}`);
        const newRecipe = await fetchRecipeDetails(recipeUri);
        setLikedRecipes((prevLiked) => [...prevLiked, newRecipe]);
      }
    } catch (error) {
      console.error("Error toggling liked recipe:", error);
      setError("Failed to update liked recipes. Please try again.");
    }
  };

  return {
    likedRecipes,
    isLoading,
    error,
    fetchLikedRecipes,
    handleLikeToggle,
  };
};
