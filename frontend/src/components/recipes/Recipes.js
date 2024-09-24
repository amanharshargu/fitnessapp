import React, { useState } from "react";
import RecipeCard from "./RecipeCard";
import { useRecipeSearch } from "../../hooks/useRecipeSearch";
import { useRecipes } from "../../contexts/RecipeContext";
import "../../styles/recipe.css";

const filterOptions = {
  diet: [
    "balanced",
    "high-fiber",
    "high-protein",
    "low-carb",
    "low-fat",
    "low-sodium",
  ],
  health: [
    "alcohol-free",
    "immuno-supportive",
    "dairy-free",
    "egg-free",
    "gluten-free",
    "keto-friendly",
    "kidney-friendly",
    "kosher",
    "low-sugar",
    "paleo",
    "peanut-free",
    "pescatarian",
    "pork-free",
    "red-meat-free",
    "soy-free",
    "sugar-conscious",
    "tree-nut-free",
    "vegan",
    "vegetarian",
  ],
  cuisineType: [
    "American",
    "Asian",
    "British",
    "Caribbean",
    "Central Europe",
    "Chinese",
    "Eastern Europe",
    "French",
    "Indian",
    "Italian",
    "Japanese",
    "Kosher",
    "Mediterranean",
    "Mexican",
    "Middle Eastern",
    "Nordic",
    "South American",
    "South East Asian",
  ],
  mealType: ["Breakfast", "Lunch", "Dinner", "Snack", "Teatime"],
};

function Recipes() {
  const [showFilters, setShowFilters] = useState(false);
  const { likedRecipes, toggleLikedRecipe } = useRecipes();
  const {
    recipes,
    isLoading,
    searchTerm,
    setSearchTerm,
    filters,
    activeFilter,
    setActiveFilter,
    handleSearch,
    handleFilterChange,
    clearFilters,
    applyFilters,
  } = useRecipeSearch();

  return (
    <div className="container mt-5 recipes-container">
      <h2 className="mb-4">Recipes</h2>
      <div className="search-and-filter">
        <form onSubmit={handleSearch} className="search-form mb-4">
          <div className="input-group">
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search recipes"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </div>
        </form>
        <button
          className={`btn ${
            showFilters ? "btn-secondary" : "btn-outline-secondary"
          } show-filters-btn`}
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {showFilters && (
        <div className="filters-section mb-4">
          <h4>Filters</h4>
          <div className="d-flex justify-content-start mb-3">
            {Object.keys(filterOptions).map((filterType) => (
              <button
                key={filterType}
                className={`btn ${
                  activeFilter === filterType
                    ? "btn-primary"
                    : "btn-outline-primary"
                } me-2`}
                onClick={() =>
                  setActiveFilter(
                    activeFilter === filterType ? null : filterType
                  )
                }
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
            <button
              className="btn btn-outline-secondary me-2"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
            <button className="btn btn-success" onClick={applyFilters}>
              Apply Filters
            </button>
          </div>
          {activeFilter && (
            <div className="mb-3">
              <h5>
                {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
              </h5>
              <div className="d-flex flex-wrap">
                {filterOptions[activeFilter].map((option) => (
                  <div key={option} className="form-check me-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`${activeFilter}-${option}`}
                      checked={filters[activeFilter].includes(option)}
                      onChange={() => handleFilterChange(activeFilter, option)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`${activeFilter}-${option}`}
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <p>Loading recipes...</p>
      ) : (
        <div className="row">
          {recipes.map((recipe, index) => (
            <div key={index} className="col-md-4 mb-4">
              <RecipeCard
                recipe={recipe}
                isLiked={likedRecipes.includes(recipe.uri)}
                onLikeToggle={() => toggleLikedRecipe(recipe.uri)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Recipes;
