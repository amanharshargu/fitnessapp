import React, { useState, useEffect } from 'react';
import { useRecipes } from '../../contexts/RecipeContext';
import '../../styles/RecipeCard.css';

function RecipeCard({ recipe, isLiked: initialIsLiked, onLikeToggle }) {
  const [showDetails, setShowDetails] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const { toggleLikedRecipe } = useRecipes();
  const [isLiked, setIsLiked] = useState(initialIsLiked);

  useEffect(() => {
    setIsLiked(initialIsLiked);
  }, [initialIsLiked]);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleLikeToggle = async () => {
    try {
      await toggleLikedRecipe(recipe);
      setIsLiked(!isLiked);
      if (onLikeToggle) {
        onLikeToggle(recipe);
      }
    } catch (error) {
      console.error('Error toggling recipe like:', error);
    }
  };

  const caloriesPerServing = Math.round(recipe.calories / recipe.yield);

  return (
    <div className={`recipe-card ${showDetails ? 'show-details' : ''}`}>
      <div className="recipe-card__main">
        <div className="recipe-card__image-container">
          {imageLoading && <div className="loading-spinner"></div>}
          <img 
            className={`recipe-card__image ${imageLoading ? 'loading' : ''}`} 
            src={recipe.image} 
            alt={recipe.label} 
            onLoad={handleImageLoad}
          />
          <div className="recipe-card__image-overlay"></div>
          <button 
            className={`recipe-card__like-button ${isLiked ? 'recipe-card__like-button--liked' : ''}`} 
            onClick={handleLikeToggle}
          >
            {isLiked ? '❤️' : '🤍'}
          </button>
        </div>
        <div className="recipe-card__content">
          <h3 className="recipe-card__title">{recipe.label}</h3>
          <div className="recipe-card__info-container">
            <div className="recipe-card__info-item">
              <span className="recipe-card__info-number">{caloriesPerServing}</span>
              <small className="recipe-card__info-label">cal/serving</small>
            </div>
            <div className="recipe-card__info-item">
              <span className="recipe-card__info-number">{recipe.yield}</span>
              <small className="recipe-card__info-label">servings</small>
            </div>
            <div className="recipe-card__info-item">
              <span className="recipe-card__info-number">{recipe.ingredientLines.length}</span>
              <small className="recipe-card__info-label">ingredients</small>
            </div>
          </div>
          <div className="recipe-card__button-group">
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
