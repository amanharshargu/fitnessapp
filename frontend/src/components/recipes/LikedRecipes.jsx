import React, { useState, useEffect, useCallback, useMemo } from "react";
import RecipeCard from "./RecipeCard";
import ContentWrapper from "../layout/ContentWrapper";
import { useNavigate } from "react-router-dom";
import { useRecipes } from "../../contexts/RecipeContext";
import CardioSpinner from "../common/CardioSpinner";
import "../../styles/Recipes.css";
import "../../styles/LikedRecipes.css";

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
          {isLoading || !isContentLoaded ? (
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
              <CardioSpinner size="50" color="#ff9800" />
            </div>
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
