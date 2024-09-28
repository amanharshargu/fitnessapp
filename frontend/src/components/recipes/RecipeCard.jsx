import React, { useState } from 'react';
import '../../styles/RecipeCard.css';

function RecipeCard({ recipe, isLiked, onLikeToggle }) {
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div className="recipe-card">
      <img className="recipe-card__image" src={recipe.image} alt={recipe.label} />
      <div className="recipe-card__content">
        <h3 className="recipe-card__title">{recipe.label}</h3>
        <p className="recipe-card__info">Calories: {Math.round(recipe.calories)}</p>
        <p className="recipe-card__info">Ingredients: {recipe.ingredientLines.length}</p>
        <div className="recipe-card__button-group">
          <button className="recipe-card__button recipe-card__button--like" onClick={() => onLikeToggle(recipe.uri)}>
            {isLiked ? 'Unlike' : 'Like'}
          </button>
          <button className="recipe-card__button recipe-card__button--details" onClick={toggleDetails}>
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
        {showDetails && (
          <div className="recipe-card__details">
            <h4 className="recipe-card__details-title">Ingredients:</h4>
            <ul className="recipe-card__ingredients-list">
              {recipe.ingredientLines.map((ingredient, index) => (
                <li key={index} className="recipe-card__ingredient-item">{ingredient}</li>
              ))}
            </ul>
            <p className="recipe-card__source">Source: {recipe.source}</p>
            <a className="recipe-card__link" href={recipe.url} target="_blank" rel="noopener noreferrer">View Full Recipe</a>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecipeCard;
