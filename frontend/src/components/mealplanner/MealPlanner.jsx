import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import CalorieSlider from "../dashboard/CalorieSlider";
import ContentWrapper from "../layout/ContentWrapper";
import MealPlanDisplay from "./MealPlanDisplay";
import { useIngredients } from "../../contexts/IngredientContext";
import { useIngredientList, formatQuantity, aggregateIngredients } from "../../hooks/useIngredientForm";
import CardioSpinner from "../common/CardioSpinner";
import api from "../../services/api";
import "../../styles/MealPlanner.css";

const MEALPLAN_APP_ID = process.env.REACT_APP_MEALPLAN_APP_ID;
const MEALPLAN_APP_KEY = process.env.REACT_APP_MEALPLAN_APP_KEY;
const EDAMAM_APP_ID = process.env.REACT_APP_EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.REACT_APP_EDAMAM_APP_KEY;
const EDAMAM_USER_ID = process.env.REACT_APP_EDAMAM_USER_ID;

const dishTypes = [
"biscuits and cookies", "bread", "cereals", "desserts", "drinks",
  "ice cream and custard", "pancake", "pasta", "pizza",  "salad", "sandwiches", "seafood", "soup", "sweets"
];

const healthLabels = [
  "DAIRY_FREE", "EGG_FREE", "GLUTEN_FREE", "PEANUT_FREE",
  "VEGETARIAN", "VEGAN"
];

const dietLabels = [
  "BALANCED", "HIGH_PROTEIN", "LOW_FAT", "LOW_CARB"
];

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

const capitalizeWords = (str) => {
  const articles = ['and', 'or', 'the', 'a', 'an'];
  const specialCases = {
    'ice cream and custard': 'Ice Cream',
    'biscuits and cookies': 'Cookies'
  };

  if (specialCases[str.toLowerCase()]) {
    return specialCases[str.toLowerCase()];
  }

  return str.split('_').map(word => 
    articles.includes(word.toLowerCase()) ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

function MealPlanner() {
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(2000); // Default value
  const [filters, setFilters] = useState(getInitialFilters(dailyCalorieGoal));
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const { ingredients } = useIngredients();
  const { processedIngredients } = useIngredientList(ingredients);
  const [calories, setCalories] = useState({ min: 2000, max: 2500 });

  // Remove this useMemo block as we're now using processedIngredients
  // const aggregatedIngredients = useMemo(() => {
  //   return aggregateIngredients(ingredients, {
  //     keyExtractor: (ingredient) => ingredient.name,
  //     quantityConverter: (quantity, unit) => convertToBaseUnit(parseFloat(quantity), unit),
  //     unitNormalizer: (unit) => unit.toLowerCase(),
  //   });
  // }, [ingredients]);

  useEffect(() => {
    const fetchCalorieGoal = async () => {
      try {
        const response = await api.get(`/dashboard/calorie-goal`);
        const data = response.data;
        const fetchedGoal = data.dailyCalories || 2000;
        setDailyCalorieGoal(fetchedGoal);
        setFilters(getInitialFilters(fetchedGoal));
      } catch (error) {
        console.error('Error fetching calorie goal:', error);
      }
    };

    fetchCalorieGoal();
  }, []);

  const fetchMealPlan = async () => {
    setLoading(true);
    setError(null);
    setShowFilters(false);
    try {
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
        await fetchRecipeDetails(response.data);
      } else {
        throw new Error("Unexpected API response structure");
      }
    } catch (err) {
      setError("Failed to fetch meal plan. Please try again later.");
      console.error("Error fetching meal plan:", err);
      setShowFilters(true);
      setLoading(false);
    }
  };

  const fetchRecipeDetails = async (mealPlanData) => {
    try {
      if (!mealPlanData.selection || !Array.isArray(mealPlanData.selection)) {
        throw new Error("Invalid meal plan data structure");
      }

      const recipePromises = mealPlanData.selection.flatMap((day) =>
        Object.values(day.sections).map((meal) =>
          axios.get(`https://api.edamam.com/api/recipes/v2/by-uri`, {
            params: {
              type: "public",
              app_id: EDAMAM_APP_ID,
              app_key: EDAMAM_APP_KEY,
              uri: meal.assigned,
            },
          })
        )
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
  };

  const handleFilterChange = (name, value) => {
    if (name === "diet") {
      // For diet labels, set the value directly (single selection)
      setFilters((prevFilters) => ({
        ...prevFilters,
        [name]: [value], // Wrap in an array to maintain consistency with API expectations
      }));
    } else {
      // For other filters, keep the existing logic
      setFilters((prevFilters) => ({
        ...prevFilters,
        [name]: value,
      }));
    }
  };

  const handleClearFilters = () => {
    setFilters(getInitialFilters(dailyCalorieGoal));
  };

  const handleViewRecipe = (recipe) => {
    if (recipe.url) {
      window.open(recipe.url, '_blank');
    }
  };

  const handleBackToFilters = () => {
    setShowFilters(true);
    setMealPlan(null);
    setError(null);
  };

  const handleCaloriesChange = (values) => {
    const [min, max] = values;
    setCalories({ min: Math.min(min, max), max: Math.max(min, max) });
  };

  const isIngredientExpired = (items) => {
    return items.some(item => {
      if (!item.expirationDate) return false;
      const today = new Date();
      const expirationDate = new Date(item.expirationDate);
      return expirationDate < today;
    });
  };

  const getIngredientDetails = (items) => {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const unit = items[0].unit;
    return formatQuantity(totalQuantity, unit);
  };

  return (
    <ContentWrapper>
      <div className="meal-planner">
        {showFilters ? (
          <div className="filters-container">
            <div className="filters-layout">
              <div className="filters-checkboxes">
                <div className="filters-row">
                  <div className="filter-group">
                    <h5>Health Labels</h5>
                    <div className="filter-options compact">
                      {healthLabels.map((label) => (
                        <label key={label} className="checkbox-label">
                          <input
                            type="checkbox"
                            name="health"
                            value={label}
                            checked={filters.health.includes(label)}
                            onChange={(e) => handleFilterChange("health", e.target.checked ? [...filters.health, label] : filters.health.filter((item) => item !== label))}
                          />
                          <span>{capitalizeWords(label)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="filter-group">
                    <h5>Diet Labels</h5>
                    <div className="filter-options compact">
                      {dietLabels.map((label) => (
                        <label key={label} className="radio-label">
                          <input
                            type="radio"
                            name="diet"
                            value={label}
                            checked={filters.diet[0] === label}
                            onChange={(e) => handleFilterChange("diet", e.target.value)}
                          />
                          <span>{capitalizeWords(label)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="filters-row">
                  <div className="filter-group">
                    <h5>Special Preference</h5>
                    <div className="filter-options compact scrollable-list">
                      {dishTypes.map((label) => (
                        <label key={label} className="checkbox-label">
                          <input
                            type="checkbox"
                            name="dishType"
                            value={label}
                            checked={filters.dishType.includes(label)}
                            onChange={(e) => handleFilterChange("dishType", e.target.checked ? [...filters.dishType, label] : filters.dishType.filter((item) => item !== label))}
                          />
                          <span>{capitalizeWords(label)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="filter-group">
                    <h5>Ingredients from Fridge</h5>
                    <div className="filter-options compact scrollable-list">
                      {processedIngredients.map(({ name, items, totalQuantity }) => {
                        const isExpired = isIngredientExpired(items);
                        return (
                          <label 
                            key={name} 
                            className={`checkbox-label ${isExpired ? 'expired' : ''}`}
                            title={isExpired ? "This ingredient has expired" : totalQuantity}
                          >
                            <input
                              type="checkbox"
                              name="ingredients"
                              value={name}
                              checked={filters.ingredients.includes(name)}
                              onChange={(e) => handleFilterChange("ingredients", e.target.checked ? [...filters.ingredients, name] : filters.ingredients.filter((item) => item !== name))}
                              disabled={isExpired}
                            />
                            <span>{name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="filters-sliders">
                <div className="filter-group">
                  <h5>Calorie Ranges</h5>
                  <CalorieSlider
                    label="Daily Total"
                    min={1000}
                    max={4000}
                    value={filters.calories}
                    onChange={(value) => handleFilterChange("calories", value)}
                  />
                  <CalorieSlider
                    label="Breakfast"
                    min={200}
                    max={1200}
                    value={filters.breakfastCalories}
                    onChange={(value) => handleFilterChange("breakfastCalories", value)}
                  />
                  <CalorieSlider
                    label="Lunch"
                    min={300}
                    max={1500}
                    value={filters.lunchCalories}
                    onChange={(value) => handleFilterChange("lunchCalories", value)}
                  />
                  <CalorieSlider
                    label="Dinner"
                    min={400}
                    max={1500}
                    value={filters.dinnerCalories}
                    onChange={(value) => handleFilterChange("dinnerCalories", value)}
                  />
                </div>
              </div>
            </div>
            <div className="button-group">
              <button type="button" onClick={fetchMealPlan} className="btn btn-primary">
                Generate Meal Plan
              </button>
              <button type="button" onClick={handleClearFilters} className="btn btn-secondary">
                Reset Filters
              </button>
            </div>
            {error && <p className="text-danger">{error}</p>}
          </div>
        ) : (
          <>
            {loading && (
              <div className="loading-container">
                <CardioSpinner size="50" stroke="4" speed="2" color="#ff9800" />
              </div>
            )}
            {!loading && mealPlan && (
              <div className="meal-plan-display-container">
                <MealPlanDisplay 
                  mealPlan={mealPlan} 
                  handleViewRecipe={handleViewRecipe} 
                  onBackToFilters={handleBackToFilters}
                />
              </div>
            )}
          </>
        )}
      </div>
    </ContentWrapper>
  );
}

export default MealPlanner;
