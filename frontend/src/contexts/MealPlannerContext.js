import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import api from '../services/api';

const MealPlannerContext = createContext();

const MEALPLAN_APP_ID = process.env.REACT_APP_MEALPLAN_APP_ID;
const MEALPLAN_APP_KEY = process.env.REACT_APP_MEALPLAN_APP_KEY;
const EDAMAM_APP_ID = process.env.REACT_APP_EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.REACT_APP_EDAMAM_APP_KEY;
const EDAMAM_USER_ID = process.env.REACT_APP_EDAMAM_USER_ID;

const getInitialFilters = (dailyCalorieGoal) => {
  const breakfastPercentage = 0.28;
  const lunchPercentage = 0.38;
  const dinnerPercentage = 0.34;

  const calculateRange = (percentage) => {
    const baseCalories = Math.round(dailyCalorieGoal * percentage);
    const min = Math.round(baseCalories * 0.9);
    const max = Math.round(baseCalories * 1.1);
    return { min, max };
  };

  return {
    health: [],
    diet: [],
    dishType: [],
    ingredients: [],
    calories: { min: Math.max(1000, dailyCalorieGoal - 150), max: Math.min(3000, dailyCalorieGoal + 150) },
    breakfastCalories: calculateRange(breakfastPercentage),
    lunchCalories: calculateRange(lunchPercentage),
    dinnerCalories: calculateRange(dinnerPercentage),
  };
};

export const MealPlannerProvider = ({ children }) => {
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(2000);
  const [filters, setFilters] = useState(getInitialFilters(dailyCalorieGoal));
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [processedIngredients, setProcessedIngredients] = useState([]);

  const fetchCalorieGoal = useCallback(async () => {
    try {
      const response = await api.get(`/dashboard/calorie-goal`);
      const data = response.data;
      const fetchedGoal = data.dailyCalories || 2000;
      setDailyCalorieGoal(fetchedGoal);
      setFilters(getInitialFilters(fetchedGoal));
    } catch (error) {
      console.error('Error fetching calorie goal:', error);
    }
  }, []);

  const searchRecipesWithIngredients = useCallback(async (ingredients) => {
    try {
      const combinedSearch = ingredients.map(ing => ing.name).join(" ");
      
      const searchPromises = [
        // Combined search
        axios.get(`https://api.edamam.com/api/recipes/v2`, {
          params: {
            type: "public",
            q: combinedSearch,
            app_id: EDAMAM_APP_ID,
            app_key: EDAMAM_APP_KEY,
            random: true,
          },
        }),
        // Individual searches
        ...ingredients.map(ingredient => 
          axios.get(`https://api.edamam.com/api/recipes/v2`, {
            params: {
              type: "public",
              q: ingredient.name,
              app_id: EDAMAM_APP_ID,
              app_key: EDAMAM_APP_KEY,
              random: true,
            },
          })
        )
      ];

      const searchResults = await Promise.all(searchPromises);
      
      const totalQuantity = ingredients.reduce((sum, ing) => sum + ing.quantity, 0);
      const allRecipes = searchResults.flatMap((response, index) => {
        const recipes = response.data.hits.map(hit => ({
          ...hit.recipe,
          ingredientSource: index === 0 ? 'combined' : ingredients[index - 1].name
        }));

        if (index === 0) {
          return recipes;
        } else {
          const ingredient = ingredients[index - 1];
          const proportion = ingredient.quantity / totalQuantity;
          const recipeCount = Math.max(1, Math.round(proportion * 50));
          return recipes.slice(0, recipeCount);
        }
      });

      // Shuffle the recipes
      for (let i = allRecipes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allRecipes[i], allRecipes[j]] = [allRecipes[j], allRecipes[i]];
      }

      return allRecipes.slice(0, 50);
    } catch (error) {
      console.error("Error searching recipes with ingredients:", error);
      return [];
    }
  }, []);

  const fetchMealPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    setShowFilters(false);
    try {
      const selectedIngredients = filters.ingredients.map(name => {
        const ingredient = processedIngredients.find(ing => ing.name === name);
        return {
          name,
          quantity: ingredient ? ingredient.totalQuantity : 1 // Default to 1 if quantity is not found
        };
      });
      const ingredientRecipes = await searchRecipesWithIngredients(selectedIngredients);

      const response = await axios.post(
        `https://api.edamam.com/api/meal-planner/v1/${MEALPLAN_APP_ID}/select?app_id=${MEALPLAN_APP_ID}&app_key=${MEALPLAN_APP_KEY}`,
        {
          plan: {
            accept: {
              all: [
                { health: filters.health },
                { diet: filters.diet },
              ],
            },
            fit: {
              ENERC_KCAL: filters.calories,
            },
            sections: {
              Breakfast: {
                accept: {
                  all: [
                    { meal: ["breakfast"] },
                    { dish: filters.dishType.filter(type => ["cereals", "egg", "pancake", "pastry", "bread", "sandwiches"].includes(type)) }
                  ],
                },
                fit: {
                  ENERC_KCAL: filters.breakfastCalories,
                },
              },
              Lunch: {
                accept: {
                  all: [
                    { meal: ["lunch/dinner"] },
                    { dish: filters.dishType.filter(type => ["main course", "salad", "sandwiches", "soup", "pasta", "pizza"].includes(type)) }
                  ],
                },
                fit: {
                  ENERC_KCAL: filters.lunchCalories,
                },
              },
              Dinner: {
                accept: {
                  all: [
                    { meal: ["lunch/dinner"] },
                    { dish: filters.dishType.filter(type => ["main course", "seafood", "pasta", "pizza", "soup", "salad"].includes(type)) }
                  ],
                },
                fit: {
                  ENERC_KCAL: filters.dinnerCalories,
                },
              },
            },
          },
          size: 7,
        },
        {
          headers: {
            "Edamam-Account-User": EDAMAM_USER_ID,
          },
        }
      );
      
      if (response.data && response.data.status === "INCOMPLETE") {
        setMealPlan({ status: "INCOMPLETE" });
        setLoading(false);
      } else if (response.data && response.data.selection) {
        const updatedSelection = response.data.selection.map(day => {
          const updatedSections = Object.entries(day.sections).map(([mealType, meal]) => {
            if (ingredientRecipes.length > 0 && Math.random() < 0.5) {
              const randomIndex = Math.floor(Math.random() * ingredientRecipes.length);
              const selectedRecipe = ingredientRecipes[randomIndex];
              ingredientRecipes.splice(randomIndex, 1);
              return [mealType, { ...meal, assigned: selectedRecipe.uri, recipeDetails: selectedRecipe }];
            }
            return [mealType, meal];
          });
          return { ...day, sections: Object.fromEntries(updatedSections) };
        });
        await fetchRecipeDetails({ ...response.data, selection: updatedSelection });
      } else {
        throw new Error("Unexpected API response structure");
      }
    } catch (err) {
      setError("Failed to fetch meal plan. Please try again later.");
      console.error("Error fetching meal plan:", err);
      setShowFilters(true);
      setLoading(false);
    }
  }, [filters, searchRecipesWithIngredients, processedIngredients]);

  const fetchRecipeDetails = useCallback(async (mealPlanData) => {
    try {
      if (!mealPlanData.selection || !Array.isArray(mealPlanData.selection)) {
        throw new Error("Invalid meal plan data structure");
      }

      const recipePromises = mealPlanData.selection.flatMap((day) =>
        Object.values(day.sections).map((meal) => {
          if (meal.recipeDetails) {
            return Promise.resolve({ data: { hits: [{ recipe: meal.recipeDetails }] } });
          }
          return axios.get(`https://api.edamam.com/api/recipes/v2/by-uri`, {
            params: {
              type: "public",
              app_id: EDAMAM_APP_ID,
              app_key: EDAMAM_APP_KEY,
              uri: meal.assigned,
            },
          });
        })
      );
      const recipeResponses = await Promise.all(recipePromises);
      const updatedMealPlan = mealPlanData.selection.map((day, dayIndex) => ({
        ...day,
        sections: Object.fromEntries(
          Object.entries(day.sections).map(([mealType, meal], mealIndex) => {
            const response = recipeResponses[dayIndex * 3 + mealIndex];
            let recipeDetails = null;
            if (
              response &&
              response.data &&
              response.data.hits &&
              response.data.hits.length > 0
            ) {
              recipeDetails = response.data.hits[0].recipe;
            } else {
              console.warn(
                `No recipe details found for ${mealType} on day ${dayIndex + 1}`
              );
            }
            return [
              mealType,
              {
                ...meal,
                recipeDetails,
              },
            ];
          })
        ),
      }));
      setMealPlan({ ...mealPlanData, selection: updatedMealPlan });
    } catch (err) {
      setError("Failed to fetch recipe details. Please try again later.");
      console.error("Error fetching recipe details:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFilterChange = useCallback((name, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(getInitialFilters(dailyCalorieGoal));
  }, [dailyCalorieGoal]);

  const handleViewRecipe = useCallback((recipe) => {
    if (recipe.url) {
      window.open(recipe.url, '_blank');
    }
  }, []);

  const handleBackToFilters = useCallback(() => {
    setShowFilters(true);
    setMealPlan(null);
    setError(null);
  }, []);

  const value = {
    dailyCalorieGoal,
    filters,
    mealPlan,
    loading,
    error,
    showFilters,
    fetchCalorieGoal,
    searchRecipesWithIngredients,
    fetchMealPlan,
    fetchRecipeDetails,
    handleFilterChange,
    handleClearFilters,
    handleViewRecipe,
    handleBackToFilters,
    setShowFilters,
    processedIngredients,
    setProcessedIngredients,
  };

  return (
    <MealPlannerContext.Provider value={value}>
      {children}
    </MealPlannerContext.Provider>
  );
};

export const useMealPlanner = () => {
  const context = useContext(MealPlannerContext);
  if (!context) {
    throw new Error('useMealPlanner must be used within a MealPlannerProvider');
  }
  return context;
};
