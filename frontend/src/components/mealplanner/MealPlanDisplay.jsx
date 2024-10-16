import React, { useState, useEffect } from 'react';
import '../../styles/MealPlanDisplay.css';

function MealPlanDisplay({ mealPlan, handleViewRecipe }) {
  if (!mealPlan) return null;
  
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const [selectedDay, setSelectedDay] = useState(0);
  const [loadingImages, setLoadingImages] = useState({});

  const formatNutrient = (nutrient, yield_) => {
    return Math.round(nutrient.quantity / yield_) + nutrient.unit;
  };

  const getTop5HealthLabels = (healthLabels) => {
    return healthLabels?.slice(0, 5).join(', ') || 'N/A';
  };

  const toggleDay = (index) => {
    setSelectedDay(index);
    // Reset loading state for all images when changing day
    setLoadingImages({});
  };

  const handleImageLoad = (mealType) => {
    setLoadingImages(prev => ({ ...prev, [mealType]: false }));
  };

  useEffect(() => {
    // Set loading state to true for all images when selected day changes
    if (mealPlan.selection[selectedDay]) {
      const newLoadingState = {};
      ["Breakfast", "Lunch", "Dinner"].forEach(mealType => {
        if (mealPlan.selection[selectedDay].sections[mealType]?.recipeDetails) {
          newLoadingState[mealType] = true;
        }
      });
      setLoadingImages(newLoadingState);
    }
  }, [selectedDay, mealPlan]);

  return (
    <div className="meal-plan">
      {mealPlan.status === "INCOMPLETE" && (
        <div className="warning">
          Note: The meal plan is incomplete. Some days may not have assigned meals. Consider adjusting your dietary preferences or regenerating the plan.
        </div>
      )}
      <div className="meal-plan-layout">
        <div className="day-buttons">
          {daysOfWeek.map((day, index) => (
            <button 
              key={index} 
              className={`day-button ${selectedDay === index ? 'selected' : ''}`}
              onClick={() => toggleDay(index)}
            >
              {day}
            </button>
          ))}
        </div>
        <div className="meal-display">
          {["Breakfast", "Lunch", "Dinner"].map((mealType) => (
            <div key={mealType} className="meal-type">
              <h3 className="meal-type-header">{mealType}</h3>
              {mealPlan.selection[selectedDay] &&
              mealPlan.selection[selectedDay].sections[mealType] &&
              mealPlan.selection[selectedDay].sections[mealType].recipeDetails ? (
                <div className="recipe-card">
                  <div className="recipe-image-container">
                    {loadingImages[mealType] && <div className="loading-spinner"></div>}
                    <img 
                      className={`recipe-image ${loadingImages[mealType] ? 'loading' : ''}`}
                      src={mealPlan.selection[selectedDay].sections[mealType].recipeDetails.image} 
                      alt={mealPlan.selection[selectedDay].sections[mealType].recipeDetails.label}
                      onLoad={() => handleImageLoad(mealType)}
                    />
                  </div>
                  <div className="recipe-info">
                    <div>
                      <h4 className="recipe-title">{mealPlan.selection[selectedDay].sections[mealType].recipeDetails.label}</h4>
                      <p className="recipe-details">
                        {Math.round(mealPlan.selection[selectedDay].sections[mealType].recipeDetails.calories / mealPlan.selection[selectedDay].sections[mealType].recipeDetails.yield)} calories | 
                        Protein: {formatNutrient(mealPlan.selection[selectedDay].sections[mealType].recipeDetails.totalNutrients.PROCNT, mealPlan.selection[selectedDay].sections[mealType].recipeDetails.yield)} | 
                        Carbs: {formatNutrient(mealPlan.selection[selectedDay].sections[mealType].recipeDetails.totalNutrients.CHOCDF, mealPlan.selection[selectedDay].sections[mealType].recipeDetails.yield)} | 
                        Fat: {formatNutrient(mealPlan.selection[selectedDay].sections[mealType].recipeDetails.totalNutrients.FAT, mealPlan.selection[selectedDay].sections[mealType].recipeDetails.yield)}
                      </p>
                      <p className="recipe-details">
                        Servings: {mealPlan.selection[selectedDay].sections[mealType].recipeDetails.yield} | 
                        Total Time: {mealPlan.selection[selectedDay].sections[mealType].recipeDetails.totalTime || 'N/A'} minutes
                      </p>
                      <p className="recipe-details">
                        Cuisine: {mealPlan.selection[selectedDay].sections[mealType].recipeDetails.cuisineType?.join(', ') || 'N/A'} | 
                        Dish Type: {mealPlan.selection[selectedDay].sections[mealType].recipeDetails.dishType?.join(', ') || 'N/A'}
                      </p>
                      <p className="recipe-details">
                        Health Labels: {getTop5HealthLabels(mealPlan.selection[selectedDay].sections[mealType].recipeDetails.healthLabels)}
                      </p>
                    </div>
                  </div>
                  <button className="view-recipe-btn" onClick={() => handleViewRecipe(mealPlan.selection[selectedDay].sections[mealType].recipeDetails)}>
                    View Recipe
                  </button>
                </div>
              ) : (
                <p className="no-meal">No meal assigned</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MealPlanDisplay;
