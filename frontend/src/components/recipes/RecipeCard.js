import React, { useState } from 'react';
import '../../styles/RecipeCard.css';

function RecipeCard({ recipe, isLiked, onLikeToggle }) {
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div className="recipe-card">
      <img src={recipe.image} alt={recipe.label} />
      <div className="recipe-card-content">
        <h3>{recipe.label}</h3>
        <p>Calories: {Math.round(recipe.calories)}</p>
        <p>Ingredients: {recipe.ingredientLines.length}</p>
        <div className="button-group">
          <button onClick={() => onLikeToggle(recipe.uri)}>
            {isLiked ? 'Unlike' : 'Like'}
          </button>
          <button onClick={toggleDetails}>
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
        {showDetails && (
          <div className="recipe-details">
            <h4>Ingredients:</h4>
            <ul>
              {recipe.ingredientLines.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
            <p>Source: {recipe.source}</p>
            <a href={recipe.url} target="_blank" rel="noopener noreferrer">View Full Recipe</a>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecipeCard;
