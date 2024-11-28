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

const FALLBACK_RECIPES = [
  {
    uri: 'http://www.foodnetwork.com/recipes/food-network-kitchen/mediterranean-salad-recipe-2103228',
    label: 'Mediterranean Salad',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
    calories: 350,
    healthLabels: ['Vegetarian', 'Mediterranean', 'Low-Carb'],
    totalTime: 20,
    yield: 4
  },
  {
    uri: 'https://www.allrecipes.com/recipe/8932/grilled-chicken-with-herbs/',
    label: 'Grilled Chicken Bowl',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&q=80',
    calories: 450,
    healthLabels: ['High-Protein', 'Low-Carb', 'Gluten-Free'],
    totalTime: 30,
    yield: 4
  },
  {
    uri: 'https://www.epicurious.com/recipes/food/views/vegetable-stir-fry-with-ginger',
    label: 'Vegetable Stir-Fry',
    image: 'https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?w=800&q=80',
    calories: 300,
    healthLabels: ['Vegan', 'Low-Calorie', 'Dairy-Free'],
    totalTime: 25,
    yield: 4
  },
  {
    uri: 'https://cookieandkate.com/buddha-bowl-recipe/',
    label: 'Quinoa Buddha Bowl',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    calories: 400,
    healthLabels: ['Vegan', 'Whole Grain', 'High-Fiber'],
    totalTime: 20,
    yield: 4
  },
  {
    uri: 'https://www.simplyrecipes.com/recipes/easy_grilled_salmon/',
    label: 'Salmon with Vegetables',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
    calories: 500,
    healthLabels: ['High-Protein', 'Omega-3', 'Pescatarian'],
    totalTime: 25,
    yield: 4
  },
  {
    uri: 'https://www.bonappetit.com/recipe/fresh-spring-rolls',
    label: 'Fresh Spring Rolls',
    image: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=800&q=80',
    calories: 250,
    healthLabels: ['Low-Calorie', 'Gluten-Free', 'Fresh'],
    totalTime: 30,
    yield: 4
  }
];

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

  const getCuratedDishes = async (count) => {
    try {
      const recipes = []; // Your current API call result
      
      if (!recipes || recipes.length === 0) {
        console.warn('Using fallback recipes due to empty API response');
        return FALLBACK_RECIPES;
      }
      
      return recipes;
    } catch (error) {
      console.error('Error fetching curated dishes:', error);
      return FALLBACK_RECIPES;
    }
  };

  const value = useMemo(() => ({
    ...state,
    fetchRecipes,
    toggleLikedRecipe,
    setSearchTerm: (term) => dispatch({ type: 'SET_SEARCH_TERM', payload: term }),
    setHasSearched: (value) => dispatch({ type: 'SET_HAS_SEARCHED', payload: value }),
    setShowFilters: (value) => dispatch({ type: 'SET_SHOW_FILTERS', payload: value }),
    fetchLikedRecipes,
    getRandomRecipes,
    getCuratedDishes,
  }), [state, fetchRecipes, toggleLikedRecipe, fetchLikedRecipes, getRandomRecipes, getCuratedDishes]);

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
