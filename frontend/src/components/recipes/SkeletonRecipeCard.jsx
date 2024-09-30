import React from 'react';
import '../../styles/RecipeCard.css';

function SkeletonRecipeCard() {
  return (
    <div className="recipe-card skeleton-card">
      <div className="skeleton-image"></div>
      <div className="recipe-card__content">
        <div className="skeleton-title"></div>
        <div className="skeleton-info"></div>
        <div className="skeleton-info"></div>
        <div className="skeleton-button-group">
          <div className="skeleton-button"></div>
          <div className="skeleton-button"></div>
        </div>
      </div>
    </div>
  );
}

export default SkeletonRecipeCard;