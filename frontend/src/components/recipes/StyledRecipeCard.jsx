import React, { useState } from "react";
import "../../styles/StyledRecipeCard.css";

function StyledRecipeCard({ recipe, isLiked, onLikeToggle }) {
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div
      className="styled-recipe-card"
      style={{ backgroundImage: `url(${recipe.image})` }}
    >
      <div className="styled-recipe-card-content">
        <h3 className="styled-recipe-card-title">{recipe.label}</h3>
        <div className="styled-recipe-card-info">
          <p>Calories: {Math.round(recipe.calories)}</p>
          <p>Ingredients: {recipe.ingredientLines.length}</p>
        </div>
        <div className="button-group">
          <button onClick={toggleDetails}>
            {showDetails ? "Hide Details" : "Show Details"}
          </button>
        </div>
        {showDetails && (
          <div className="recipe-details">
            <h4>Ingredients:</h4>
            <div className="ingredients-list">
              {recipe.ingredientLines.map((ingredient, index) => (
                <p key={index}>{ingredient}</p>
              ))}
            </div>
            <p>Source: {recipe.source}</p>
            <a href={recipe.url} target="_blank" rel="noopener noreferrer">
              View Full Recipe
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default StyledRecipeCard;
