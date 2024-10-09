import React, { useState } from "react";
import { useLikedRecipes } from "../../hooks/useLikedRecipes";
import RecipeCard from "./RecipeCard";
import ContentWrapper from "../layout/ContentWrapper";
import "../../styles/Recipes.css";

function LikedRecipes() {
  const { likedRecipes, isLoading, error, handleLikeToggle } =
    useLikedRecipes();
  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const filteredRecipes = likedRecipes.filter((recipe) =>
    recipe.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <ContentWrapper>
      <div className="liked-recipes-container">
        <div className="liked-recipes-content">
          <h1 className="recipes-title">Liked Recipes</h1>
          <div className="search-and-filter">
            <form className="search-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Search liked recipes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control search-input"
                />
                <div className="input-group-append">
                  <button type="submit" className="btn search-button">
                    Search
                  </button>
                </div>
              </div>
            </form>
          </div>
          {filteredRecipes.length === 0 ? (
            <p className="no-recipes-message">No liked recipes found.</p>
          ) : (
            <div className="row">
              {filteredRecipes.map((recipe) => (
                <div key={recipe.uri} className="col-md-3">
                  <RecipeCard
                    recipe={recipe}
                    isLiked={true}
                    onLikeToggle={() => handleLikeToggle(recipe.uri)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ContentWrapper>
  );
}

export default LikedRecipes;
