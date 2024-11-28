import React, { createContext, useContext, useCallback, useMemo, useReducer } from "react";
import axios from "axios";
import api from "../services/api";

const RecipeContext = createContext();

const initialState = {
  recipes: [],
  likedRecipes: [],
  isLoading: false,
  searchTerm: "",
  hasSearched: false,
  showFilters: false,
};

function recipeReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_RECIPES':
      return { ...state, recipes: action.payload };
    case 'SET_LIKED_RECIPES':
      return { ...state, likedRecipes: action.payload };
    case 'UPDATE_LIKED_RECIPES':
      return { 
        ...state, 
        likedRecipes: state.likedRecipes.some(recipe => recipe.uri === action.payload.uri)
          ? state.likedRecipes.filter(recipe => recipe.uri !== action.payload.uri)
          : [...state.likedRecipes, action.payload]
      };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    case 'SET_HAS_SEARCHED':
      return { ...state, hasSearched: action.payload };
    case 'SET_SHOW_FILTERS':
      return { ...state, showFilters: action.payload };
    default:
      return state;
  }
}

export function RecipeProvider({ children }) {
  const [state, dispatch] = useReducer(recipeReducer, initialState);

  const fetchRecipeDetails = useCallback(async (uri) => {
    const params = new URLSearchParams({
      type: "public",
      app_id: process.env.REACT_APP_EDAMAM_APP_ID,
      app_key: process.env.REACT_APP_EDAMAM_APP_KEY,
      uri: uri,
    });

    const response = await axios.get(`https://api.edamam.com/api/recipes/v2/by-uri?${params}`);
    return response.data.hits[0].recipe;
  }, []);

  const fetchLikedRecipes = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await api.get("/recipes/saved");
      const detailedRecipes = await Promise.all(
        response.data.map(fetchRecipeDetails)
      );
      dispatch({ type: 'SET_LIKED_RECIPES', payload: detailedRecipes });
    } catch (error) {
      console.error("Error fetching liked recipes:", error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [fetchRecipeDetails]);

  const toggleLikedRecipe = useCallback(async (recipe) => {
    try {
      const isCurrentlyLiked = state.likedRecipes.some(
        (likedRecipe) => likedRecipe.uri === recipe.uri
      );
      
      if (isCurrentlyLiked) {
        await api.delete(`/recipes/save/${encodeURIComponent(recipe.uri)}`);
      } else {
        await api.post(`/recipes/save/${encodeURIComponent(recipe.uri)}`, recipe);
      }
      
      dispatch({ type: 'UPDATE_LIKED_RECIPES', payload: recipe });
    } catch (error) {
      console.error("Error toggling liked recipe:", error);
    }
  }, [state.likedRecipes]);

  const fetchRecipes = useCallback(async (term, filters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
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
        `https://api.edamam.com/api/recipes/v2?${params}`
      );
      
      dispatch({ type: 'SET_RECIPES', payload: response.data.hits.map((hit) => hit.recipe) });
      dispatch({ type: 'SET_HAS_SEARCHED', payload: true });
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const getRandomRecipes = useCallback(async (count, ingredients = []) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const params = {
        type: "any",
        app_id: process.env.REACT_APP_EDAMAM_APP_ID,
        app_key: process.env.REACT_APP_EDAMAM_APP_KEY,
        random: true,
      };

      if (ingredients.length > 0) {
        const numIngredients = Math.floor(Math.random() * 2) + 2;
        const selectedIngredients = ingredients
          .sort(() => 0.5 - Math.random())
          .slice(0, numIngredients);
        params.q = selectedIngredients.join(" ");
      } else {
        params.q = "";
        params.ingr = `${Math.floor(Math.random() * 5) + 3}-${Math.floor(Math.random() * 5) + 6}`;
      }

      const response = await axios.get("https://api.edamam.com/api/recipes/v2", { params });
      return response.data?.hits?.slice(0, count).map(hit => hit.recipe) || [];
    } catch (error) {
      console.error("Error fetching random recipes:", error);
      return [];
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const value = useMemo(() => ({
    ...state,
    fetchRecipes,
    toggleLikedRecipe,
    setSearchTerm: (term) => dispatch({ type: 'SET_SEARCH_TERM', payload: term }),
    setHasSearched: (value) => dispatch({ type: 'SET_HAS_SEARCHED', payload: value }),
    setShowFilters: (value) => dispatch({ type: 'SET_SHOW_FILTERS', payload: value }),
    fetchLikedRecipes,
    getRandomRecipes,
    getCuratedDishes: async (count) => {
      const curatedRecipes = [/* ... your existing curated recipes ... */];
      return curatedRecipes.sort(() => 0.5 - Math.random()).slice(0, count);
    },
  }), [state, fetchRecipes, toggleLikedRecipe, fetchLikedRecipes, getRandomRecipes]);

  return (
    <RecipeContext.Provider value={value}>
      {children}
    </RecipeContext.Provider>
  );
}

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error("useRecipes must be used within a RecipeProvider");
  }
  return context;
};
