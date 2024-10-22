import React, { useEffect } from "react";
import CalorieSlider from "../dashboard/CalorieSlider";
import ContentWrapper from "../layout/ContentWrapper";
import MealPlanDisplay from "./MealPlanDisplay";
import { useIngredients } from "../../contexts/IngredientContext";
import { useIngredientList, formatQuantity, convertToBaseUnit } from "../../hooks/useIngredientForm";
import CardioSpinner from "../common/CardioSpinner";
import { useMealPlanner } from "../../contexts/MealPlannerContext";
import "../../styles/MealPlanner.css";

const healthLabels = [
  "DAIRY_FREE", "EGG_FREE", "GLUTEN_FREE", "PEANUT_FREE",
  "VEGETARIAN", "VEGAN"
];

const dietLabels = [
  "BALANCED", "HIGH_PROTEIN", "LOW_FAT", "LOW_CARB"
];

const dishTypes = [
  "biscuits and cookies", "bread", "cereals", "desserts", "drinks",
  "ice cream and custard", "pancake", "pasta", "pizza", "salad", "sandwiches", "seafood", "soup", "sweets"
];

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
  const { ingredients } = useIngredients();
  const { processedIngredients } = useIngredientList(ingredients);
  const {
    filters,
    mealPlan,
    loading,
    error,
    showFilters,
    fetchCalorieGoal,
    fetchMealPlan,
    handleFilterChange,
    handleClearFilters,
    handleViewRecipe,
    handleBackToFilters,
    setProcessedIngredients,
  } = useMealPlanner();

  useEffect(() => {
    fetchCalorieGoal();
  }, [fetchCalorieGoal]);

  useEffect(() => {
    setProcessedIngredients(processedIngredients);
  }, [processedIngredients, setProcessedIngredients]);

  const getIngredientStatus = (name) => {
    const today = new Date();
    const processedIngredient = processedIngredients.find(ing => ing.name === name);

    if (!processedIngredient) return 'unknown';

    const expiringSoonItems = processedIngredient.items.filter(item => {
      const expirationDate = new Date(item.expirationDate);
      return expirationDate > today && expirationDate <= new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    });

    const expiredItems = processedIngredient.items.filter(item => new Date(item.expirationDate) < today);

    if (expiredItems.length > 0) {
      return 'expired';
    } else if (expiringSoonItems.length > 0) {
      return 'expiring-soon';
    } else {
      return 'fresh';
    }
  };

  const getIngredientQuantity = (name, filterExpiringSoon = false) => {
    const ingredient = processedIngredients.find(ing => ing.name === name);
    if (!ingredient) return 'N/A';

    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

    let totalQuantity = 0;
    let baseUnit = '';

    ingredient.items.forEach(item => {
      const expirationDate = new Date(item.expirationDate);
      if (!filterExpiringSoon || (expirationDate > today && expirationDate <= threeDaysFromNow)) {
        const convertedQuantity = convertToBaseUnit(item.quantity, item.unit);
        totalQuantity += convertedQuantity;
        if (!baseUnit) baseUnit = item.unit.toLowerCase() === 'kg' ? 'g' : (item.unit.toLowerCase() === 'l' ? 'ml' : item.unit);
      }
    });

    return formatQuantity(totalQuantity, baseUnit);
  };

  const getIngredientHoverText = (name, status) => {
    if (status === 'expired') {
      return 'Expired';
    } else if (status === 'expiring-soon') {
      const expiringSoonQuantity = getIngredientQuantity(name, true);
      const totalQuantity = getIngredientQuantity(name);
      return `${expiringSoonQuantity} out of ${totalQuantity} Expiring Soon`;
    } else {
      return `Quantity: ${getIngredientQuantity(name)}`;
    }
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
                            onChange={(e) => handleFilterChange("diet", [e.target.value])}
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
                      {processedIngredients.map(({ name }) => {
                        const status = getIngredientStatus(name);
                        const hoverText = getIngredientHoverText(name, status);
                        return (
                          <label 
                            key={name} 
                            className={`checkbox-label ${status}`}
                            data-hover={hoverText}
                          >
                            <input
                              type="checkbox"
                              name="ingredients"
                              value={name}
                              checked={filters.ingredients.includes(name)}
                              onChange={(e) => handleFilterChange("ingredients", e.target.checked ? [...filters.ingredients, name] : filters.ingredients.filter((item) => item !== name))}
                              disabled={status === 'expired'}
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
            {!loading && mealPlan && mealPlan.status !== "INCOMPLETE" && (
              <div className="meal-plan-display-container">
                <MealPlanDisplay />
              </div>
            )}
            {!loading && (!mealPlan || mealPlan.status === "INCOMPLETE") && (
              <div className="no-meal-plan-fallback">
                <h2>No Meal Plan Available</h2>
                <p>We couldn't generate a meal plan based on your current preferences. Please try adjusting your filters and try again.</p>
                <button className="back-to-filters-btn" onClick={handleBackToFilters}>
                  Back to Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </ContentWrapper>
  );
}

export default MealPlanner;
