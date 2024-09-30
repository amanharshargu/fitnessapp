import React, { useState } from 'react';
import '../../styles/RecipeCard.css';

function RecipeCard({ recipe, isLiked, onLikeToggle }) {
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div className={`recipe-card ${showDetails ? 'show-details' : ''}`}>
      <div className="recipe-card__main">
        <div className="recipe-card__image-container">
          <img className="recipe-card__image" src={recipe.image} alt={recipe.label} />
        </div>
        <div className="recipe-card__content">
          <h3 className="recipe-card__title">{recipe.label}</h3>
          <div className="recipe-card__info-container">
            <p className="recipe-card__info">Calories: {Math.round(recipe.calories)}</p>
            <p className="recipe-card__info">Ingredients: {recipe.ingredientLines.length}</p>
          </div>
          <div className="recipe-card__button-group">
            <button 
              className={`recipe-card__button recipe-card__button--like ${isLiked ? 'recipe-card__button--liked' : ''}`} 
              onClick={() => onLikeToggle(recipe.uri)}
            >
              {isLiked ? 'Unlike' : 'Like'}
            </button>
            <button 
              className="recipe-card__button recipe-card__button--details" 
              onClick={toggleDetails}
            >
              Details
            </button>
          </div>
        </div>
      </div>
      <div className="recipe-card__details">
        <div className="recipe-card__details-header">
          <h3 className="recipe-card__details-title">{recipe.label}</h3>
          <button 
            className="recipe-card__button recipe-card__button--close" 
            onClick={toggleDetails}
          >
            &times;
          </button>
        </div>
        <h4 className="recipe-card__details-subtitle">Ingredients:</h4>
        <ul className="recipe-card__ingredients-list">
          {recipe.ingredientLines.map((ingredient, index) => (
            <li key={index} className="recipe-card__ingredient-item">{ingredient}</li>
          ))}
        </ul>
        <p className="recipe-card__source">Source: {recipe.source}</p>
        <a className="recipe-card__link" href={recipe.url} target="_blank" rel="noopener noreferrer">View Full Recipe</a>
      </div>
    </div>
  );
}

export default RecipeCard;
