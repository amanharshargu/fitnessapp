import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import api from "../services/api";
import axios from "axios";
import { useAuth } from "./AuthContext";

const RecipeContext = createContext();

export const useRecipes = () => useContext(RecipeContext);

const EDAMAM_APP_ID = process.env.REACT_APP_EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.REACT_APP_EDAMAM_APP_KEY;
const EDAMAM_API_URL = process.env.REACT_APP_EDAMAM_API_URL;

export const RecipeProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchLikedRecipes();
    }
  }, [token]);

  const fetchLikedRecipes = async () => {
    try {
      const response = await api.get("/recipes/saved");
      setLikedRecipes(response.data);
    } catch (error) {
      console.error("Error fetching liked recipes:", error);
    }
  };

  const fetchRecipes = async (query, filters) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        type: "public",
        q: query,
        app_id: EDAMAM_APP_ID,
        app_key: EDAMAM_APP_KEY,
      });

      Object.entries(filters).forEach(([key, values]) => {
        if (values.length > 0) {
          values.forEach((value) => params.append(key, value));
        }
      });

      const response = await axios.get(
        `${EDAMAM_API_URL}?${params.toString()}`
      );
      setRecipes(response.data.hits.map((hit) => hit.recipe));
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLikedRecipe = async (recipeUri) => {
    try {
      if (likedRecipes.includes(recipeUri)) {
        await api.delete(`/recipes/save/${encodeURIComponent(recipeUri)}`, {
          uri: recipeUri,
        });
        setLikedRecipes((prevLiked) =>
          prevLiked.filter((uri) => uri !== recipeUri)
        );
      } else {
        await api.post(`/recipes/save/${encodeURIComponent(recipeUri)}`, {
          uri: recipeUri,
        });
        setLikedRecipes((prevLiked) => [...prevLiked, recipeUri]);
      }
    } catch (error) {
      console.error("Error toggling liked recipe:", error);
    }
  };

  const getRandomRecipes = useCallback(async (count = 3) => {
    setIsLoading(true);
    try {
      const minIngr = Math.floor(Math.random() * 9) + 4;
      const maxIngr = Math.floor(Math.random() * (13 - minIngr)) + minIngr;

      const params = new URLSearchParams({
        type: "any",
        app_id: EDAMAM_APP_ID,
        app_key: EDAMAM_APP_KEY,
        ingr: `${minIngr}-${maxIngr}`,
        random: true,
      });

      const response = await axios.get(
        `${EDAMAM_API_URL}?${params.toString()}`
      );
      const randomRecipes = response.data.hits
        .map((hit) => hit.recipe)
        .slice(0, count);

      return randomRecipes;
    } catch (error) {
      console.error("Error fetching random recipes:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        likedRecipes,
        isLoading,
        fetchRecipes,
        fetchLikedRecipes,
        toggleLikedRecipe,
        getRandomRecipes,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
};
