import React, { useState, useEffect, useMemo } from 'react';
import '../../styles/MealPlanDisplay.css';
import CardioSpinner from "../common/CardioSpinner";

const MealPlanDisplay = ({ mealPlan, handleViewRecipe }) => {
  if (!mealPlan) return null;
  
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const [selectedDay, setSelectedDay] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});
  const [loadingImages, setLoadingImages] = useState({});

  const formatNutrient = (nutrient, yield_) => {
    return Math.round(nutrient.quantity / yield_) + nutrient.unit;
  };

  const getTop5HealthLabels = (healthLabels) => {
    return healthLabels?.slice(0, 5).join(', ') || 'N/A';
  };

  const toggleDay = (index) => {
    setSelectedDay(index);
  };

  useEffect(() => {
    if (mealPlan.selection) {
      const initialLoadingState = {};
      mealPlan.selection.forEach((day, dayIndex) => {
        initialLoadingState[dayIndex] = {
          Breakfast: true,
          Lunch: true,
          Dinner: true
        };
      });
      setLoadingImages(initialLoadingState);
    }
  }, [mealPlan.selection]);

  const handleImageLoad = (mealType, dayIndex) => {
    setLoadingImages(prev => ({
      ...prev,
      [dayIndex]: { ...prev[dayIndex], [mealType]: false }
    }));
  };

  // Memoize the image URLs
  const mealImages = useMemo(() => {
    if (!mealPlan.selection) return {};
    
    return mealPlan.selection.reduce((acc, day, dayIndex) => {
      acc[dayIndex] = {};
      ["Breakfast", "Lunch", "Dinner"].forEach(mealType => {
        if (day.sections[mealType]?.recipeDetails) {
          acc[dayIndex][mealType] = day.sections[mealType].recipeDetails.image;
        }
      });
      return acc;
    }, {});
  }, [mealPlan.selection]);

  if (mealPlan.status === "INCOMPLETE") {
    return (
      <div className="meal-plan-error">
        <h2>No Meal Plan Found</h2>
        <p>We couldn't generate a complete meal plan based on your current preferences. Please try adjusting your dietary preferences or calorie ranges and try again.</p>
      </div>
    );
  }

  if (!mealPlan.selection) {
    return (
      <div className="meal-plan-error">
        <h2>Error Loading Meal Plan</h2>
        <p>There was an issue loading your meal plan. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="meal-plan">
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
                    {loadingImages[selectedDay]?.[mealType] && (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CardioSpinner size="40" stroke="3" speed="2" color="#ff9800" />
                      </div>
                    )}
                    <img 
                      className={`recipe-image ${loadingImages[selectedDay]?.[mealType] ? 'loading' : ''}`}
                      src={mealImages[selectedDay][mealType]}
                      alt={mealPlan.selection[selectedDay].sections[mealType].recipeDetails.label}
                      onLoad={() => handleImageLoad(mealType, selectedDay)}
                      style={{ display: loadingImages[selectedDay]?.[mealType] ? 'none' : 'block' }}
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
};

export default MealPlanDisplay;
