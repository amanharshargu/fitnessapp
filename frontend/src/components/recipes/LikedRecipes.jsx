import React, { useState, useEffect } from "react";
import { useLikedRecipes } from "../../hooks/useLikedRecipes";
import RecipeCard from "./RecipeCard";
import ContentWrapper from "../layout/ContentWrapper";
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
  const { likedRecipes, isLoading, error, handleLikeToggle } = useLikedRecipes();
  const [searchTerm, setSearchTerm] = useState("");
  const [isContentLoaded, setIsContentLoaded] = useState(false);

  useEffect(() => {
    setIsContentLoaded(true);
  }, []);

  const filteredRecipes = likedRecipes.filter((recipe) =>
    recipe.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          ) : error ? (
            <div className="error">Error: {error}</div>
          ) : filteredRecipes.length === 0 ? (
            <p className="no-recipes">No liked recipes found.</p>
          ) : (
            <div className="recipe-grid">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.uri}
                  recipe={recipe}
                  isLiked={true}
                  onLikeToggle={() => handleLikeToggle(recipe.uri)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </ContentWrapper>
  );
}

export default LikedRecipes;
