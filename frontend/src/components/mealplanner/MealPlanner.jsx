import React, { useState } from "react";
import axios from "axios";
import CalorieSlider from "../dashboard/CalorieSlider";
import ContentWrapper from "../layout/ContentWrapper";
import MealPlanDisplay from "./MealPlanDisplay";
import "../../styles/MealPlanner.css";

const MEALPLAN_APP_ID = process.env.REACT_APP_MEALPLAN_APP_ID;
const MEALPLAN_APP_KEY = process.env.REACT_APP_MEALPLAN_APP_KEY;
const EDAMAM_APP_ID = process.env.REACT_APP_EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.REACT_APP_EDAMAM_APP_KEY;
const EDAMAM_USER_ID = process.env.REACT_APP_EDAMAM_USER_ID;

const initialFilters = {
  health: [],
  diet: [],
  calories: { min: 1500, max: 2500 },
  breakfastCalories: { min: 300, max: 500 },
  lunchCalories: { min: 400, max: 700 },
  dinnerCalories: { min: 500, max: 800 },
};

function MealPlanner() {
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [showFilters, setShowFilters] = useState(true);

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
                  all: [{ meal: ["breakfast"] }],
                },
                fit: {
                  ENERC_KCAL: filters.breakfastCalories,
                },
              },
              Lunch: {
                accept: {
                  all: [{ meal: ["lunch/dinner"] }],
                },
                fit: {
                  ENERC_KCAL: filters.lunchCalories,
                },
              },
              Dinner: {
                accept: {
                  all: [{ meal: ["lunch/dinner"] }],
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
      await fetchRecipeDetails(response.data);
    } catch (err) {
      setError("Failed to fetch meal plan. Please try again later.");
      console.error("Error fetching meal plan:", err);
      setShowFilters(true);
      setLoading(false);
    }
  };

  const fetchRecipeDetails = async (mealPlanData) => {
    try {
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
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
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

  return (
    <ContentWrapper>
      <div className="meal-planner">
        {showFilters ? (
          <div className="filters-container">
            {/* <h4>Customize Your Meal Plan</h4> */}
            <div className="filters-grid">
              <div className="filter-group">
                <h5>Health Labels</h5>
                <div className="filter-options compact">
                  {[
                    "DAIRY_FREE", "EGG_FREE", "GLUTEN_FREE", "PEANUT_FREE",
                    "VEGETARIAN", "VEGAN", "KETO_FRIENDLY", "LOW_CARB"
                  ].map((label) => (
                    <label key={label} className="checkbox-label">
                      <input
                        type="checkbox"
                        name="health"
                        value={label}
                        checked={filters.health.includes(label)}
                        onChange={(e) => handleFilterChange("health", e.target.checked ? [...filters.health, label] : filters.health.filter((item) => item !== label))}
                      />
                      <span>{label.replace(/_/g, " ")}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="filter-group">
                <h5>Diet Labels</h5>
                <div className="filter-options compact">
                  {[
                    "BALANCED", "HIGH_PROTEIN", "LOW_FAT", "LOW_CARB"
                  ].map((label) => (
                    <label key={label} className="checkbox-label">
                      <input
                        type="checkbox"
                        name="diet"
                        value={label}
                        checked={filters.diet.includes(label)}
                        onChange={(e) => handleFilterChange("diet", e.target.checked ? [...filters.diet, label] : filters.diet.filter((item) => item !== label))}
                      />
                      <span>{label.replace(/_/g, " ")}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="filter-group">
                <h5>Calorie Ranges</h5>
                <CalorieSlider
                  label="Daily Total"
                  min={1000}
                  max={3000}
                  value={filters.calories}
                  onChange={(value) => handleFilterChange("calories", value)}
                />
                <CalorieSlider
                  label="Breakfast"
                  min={200}
                  max={800}
                  value={filters.breakfastCalories}
                  onChange={(value) => handleFilterChange("breakfastCalories", value)}
                />
                <CalorieSlider
                  label="Lunch"
                  min={300}
                  max={1000}
                  value={filters.lunchCalories}
                  onChange={(value) => handleFilterChange("lunchCalories", value)}
                />
                <CalorieSlider
                  label="Dinner"
                  min={300}
                  max={1000}
                  value={filters.dinnerCalories}
                  onChange={(value) => handleFilterChange("dinnerCalories", value)}
                />
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
            {loading && <p className="text-primary">Loading meal plan...</p>}
            {!loading && mealPlan && (
              <>
                <button onClick={handleBackToFilters} className="btn btn-link back-button">
                  <i className="fas fa-arrow-left"></i> Back
                </button>
                <div className="meal-plan-display-container">
                  <MealPlanDisplay mealPlan={mealPlan} handleViewRecipe={handleViewRecipe} />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </ContentWrapper>
  );
}

export default MealPlanner;