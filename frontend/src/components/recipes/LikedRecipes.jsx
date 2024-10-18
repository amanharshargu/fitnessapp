import React, { useState, useEffect, useCallback, useMemo } from "react";
import RecipeCard from "./RecipeCard";
import ContentWrapper from "../layout/ContentWrapper";
import { useNavigate } from "react-router-dom";
import { useRecipes } from "../../contexts/RecipeContext";
import "../../styles/Recipes.css";
import "../../styles/LikedRecipes.css";

const LoadingAnimation = () => (
  <div className="loading-animation" style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100%',
    position: 'fixed',
    top: 0,
    left: 100,
    zIndex: 1000
  }}>
    <div className="spinner" style={{
      width: '50px',
      height: '50px',
      border: '5px solid #f3f3f3',
      borderTop: '5px solid #ff9800',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
);

function LikedRecipes() {
  const { likedRecipes, isLoading, toggleLikedRecipe, fetchLikedRecipes } = useRecipes();
  const [searchTerm, setSearchTerm] = useState("");
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLikedRecipes();
    setIsContentLoaded(true);
  }, [fetchLikedRecipes]);

  const filteredRecipes = useMemo(() => {
    return likedRecipes.filter((recipe) =>
      recipe.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [likedRecipes, searchTerm]);

  const handleRedirectToRecipes = useCallback(() => {
    navigate('/recipes');
  }, [navigate]);

  const handleToggleLike = useCallback((recipe) => {
    toggleLikedRecipe(recipe);
  }, [toggleLikedRecipe]);

  return (
    <ContentWrapper>
      <div className="liked-recipes-container">
        <h1 className="liked-recipes-title">Liked Recipes</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search liked recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="recipes-display-container">
          {!isContentLoaded ? (
            <div className="loading">Loading recipes...</div>
          ) : isLoading ? (
            <LoadingAnimation />
          ) : filteredRecipes.length === 0 ? (
            <div className="no-recipes">
              <p>No liked recipes found. Try searching for some!</p>
              <button 
                className="btn btn-orange mt-3"
                onClick={handleRedirectToRecipes}
              >
                Go to Recipes
              </button>
            </div>
          ) : (
            <div className="recipe-grid">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.uri}
                  recipe={recipe}
                  isLiked={true}
                  onLikeToggle={() => handleToggleLike(recipe)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </ContentWrapper>
  );
}

export default React.memo(LikedRecipes);
