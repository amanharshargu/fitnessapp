import React from 'react';
import '../../styles/MealPlanDisplay.css';

function MealPlanDisplay({ mealPlan, handleViewRecipe }) {
  if (!mealPlan) return null;
  
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <>
      {mealPlan.status === "INCOMPLETE" && (
        <p className="warning text-warning">
          Note: The meal plan is incomplete. Some days may not have assigned
          meals. Consider adjusting your dietary preferences or regenerating
          the plan.
        </p>
      )}
      <div className="meal-plan">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="meal-day-row">
            <div className="day-label text-primary">{day}</div>
            <div className="meal-columns">
              {["Breakfast", "Lunch", "Dinner"].map((mealType) => (
                <div key={mealType} className="meal-column">
                  <h5 className="text-secondary">{mealType}</h5>
                  {mealPlan.selection[index] &&
                  mealPlan.selection[index].sections[mealType] &&
                  mealPlan.selection[index].sections[mealType]
                    .recipeDetails ? (
                    <div className="recipe-card-compact">
                      <img src={mealPlan.selection[index].sections[mealType].recipeDetails.image} alt={mealPlan.selection[index].sections[mealType].recipeDetails.label} />
                      <div className="recipe-info">
                        <h6 className="text-primary">{mealPlan.selection[index].sections[mealType].recipeDetails.label}</h6>
                        <p className="calories-servings small-text text-secondary">
                          {Math.round(mealPlan.selection[index].sections[mealType].recipeDetails.calories / mealPlan.selection[index].sections[mealType].recipeDetails.yield)} cal
                          <span className="servings"> • {mealPlan.selection[index].sections[mealType].recipeDetails.yield} servings</span>
                        </p>
                        <p className="macros text-dark">
                          Protein: {Math.round(mealPlan.selection[index].sections[mealType].recipeDetails.totalNutrients.PROCNT.quantity / mealPlan.selection[index].sections[mealType].recipeDetails.yield)}g | 
                          Carbs: {Math.round(mealPlan.selection[index].sections[mealType].recipeDetails.totalNutrients.CHOCDF.quantity / mealPlan.selection[index].sections[mealType].recipeDetails.yield)}g | 
                          Fat: {Math.round(mealPlan.selection[index].sections[mealType].recipeDetails.totalNutrients.FAT.quantity / mealPlan.selection[index].sections[mealType].recipeDetails.yield)}g
                        </p>
                      </div>
                      <button className="view-recipe-btn btn btn-primary" onClick={() => handleViewRecipe(mealPlan.selection[index].sections[mealType].recipeDetails)}>
                        View
                      </button>
                    </div>
                  ) : (
                    <p className="no-meal text-muted">No meal assigned</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default MealPlanDisplay;