import React, { useState } from "react";
import { useLikedRecipes } from "../../hooks/useLikedRecipes";
import RecipeCard from "./RecipeCard";
import ContentWrapper from "../layout/ContentWrapper";
import "../../styles/LikedRecipes.css";

function LikedRecipes() {
  const { likedRecipes, isLoading, error, handleLikeToggle } =
    useLikedRecipes();
  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const filteredRecipes = likedRecipes.filter((recipe) =>
    recipe.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ContentWrapper>
      <div className="liked-recipes-container">
        <h2 className="liked-recipes-title">Liked Recipes</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button
            className="search-button"
            onClick={() => setSearchTerm(searchTerm)}
          >
            Search
          </button>
        </div>
        {filteredRecipes.length === 0 ? (
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
    </ContentWrapper>
  );
}

export default LikedRecipes;
