import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/RecipeOfDayModal.css';

const RecipeOfDayModal = ({ show, onClose, recipe }) => {
  const navigate = useNavigate();
  if (!show || !recipe) return null;

  const handleViewRecipe = () => {
    onClose();
    // Check if it's an external recipe URL
    if (recipe.uri.startsWith('http')) {
      window.open(recipe.uri, '_blank', 'noopener,noreferrer');
      return;
    }
    // Otherwise, navigate internally
    const encodedUri = encodeURIComponent(recipe.uri);
    navigate(`/recipe/${encodedUri}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="recipe-of-day-modal" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="recipe-hero">
          <img src={recipe.image} alt={recipe.label} className="recipe-image" />
          <div className="recipe-badge">Recipe of the Day</div>
        </div>

        <div className="recipe-content">
          <h2>{recipe.label}</h2>
          
          <div className="recipe-stats">
            <div className="stat">
              <i className="fas fa-fire"></i>
              <span>{Math.round(recipe.calories)} calories</span>
            </div>
            <div className="stat">
              <i className="fas fa-clock"></i>
              <span>20 min</span>
            </div>
            <div className="stat">
              <i className="fas fa-user-friends"></i>
              <span>4 servings</span>
            </div>
          </div>

          <div className="recipe-tags">
            {recipe.healthLabels?.slice(0, 3).map((label, index) => (
              <span key={index} className="tag">{label}</span>
            ))}
          </div>

          <div className="recipe-description">
            <p>Discover this delicious and healthy recipe that's perfect for any time of day. 
            Made with fresh ingredients and packed with flavor!</p>
          </div>

          <button 
            className="view-recipe-btn" 
            onClick={handleViewRecipe}
            disabled={!recipe.uri}
          >
            {recipe.uri ? 'View Full Recipe' : 'Preview Recipe'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeOfDayModal; 