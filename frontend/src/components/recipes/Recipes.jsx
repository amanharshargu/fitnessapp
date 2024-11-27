import React, { useState, useCallback, useEffect } from "react";
import RecipeCard from "./RecipeCard";
import { useRecipeSearch } from "../../hooks/useRecipeSearch";
import { useRecipes } from "../../contexts/RecipeContext";
import "../../styles/Recipes.css";

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
  const { 
    likedRecipes, 
    toggleLikedRecipe,
    searchTerm, 
    setSearchTerm, 
    hasSearched, 
    setHasSearched,
    showFilters,
    setShowFilters
  } = useRecipes();
  
  const {
    recipes,
    isLoading,
    filters,
    activeFilter,
    setActiveFilter,
    handleSearch,
    handleFilterChange,
    clearFilters,
    applyFilters,
  } = useRecipeSearch();

  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 12;

  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = recipes.slice(indexOfFirstRecipe, indexOfLastRecipe);

  const totalPages = Math.ceil(recipes.length / recipesPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const handleSearchWrapper = useCallback((e) => {
    if (e) e.preventDefault();
    if (searchTerm.trim()) {
      setCurrentPage(1);
      handleSearch();
      setHasSearched(true);
    }
  }, [handleSearch, searchTerm, setHasSearched, setCurrentPage]);

  const handleApplyFilters = useCallback(() => {
    setCurrentPage(1);
    applyFilters();
    setHasSearched(true);
  }, [applyFilters, setHasSearched]);

  const PaginationControls = ({ isBottom }) => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className={`recipes-pagination-container d-flex justify-content-center ${isBottom ? 'recipes-pagination-bottom' : ''}`}>
        <ul className="recipes-pagination">
          <li className={`recipes-page-item ${currentPage === 1 ? 'recipes-disabled' : ''}`}>
            <button 
              className="recipes-page-link" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &laquo;
            </button>
          </li>
          {startPage > 1 && (
            <>
              <li className="recipes-page-item">
                <button className="recipes-page-link" onClick={() => handlePageChange(1)}>1</button>
              </li>
              {startPage > 2 && <li className="recipes-page-item recipes-disabled"><span className="recipes-page-link">...</span></li>}
            </>
          )}
          {pageNumbers.map(number => (
            <li key={number} className={`recipes-page-item ${currentPage === number ? 'recipes-active' : ''}`}>
              <button className="recipes-page-link" onClick={() => handlePageChange(number)}>
                {number}
              </button>
            </li>
          ))}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <li className="recipes-page-item recipes-disabled"><span className="recipes-page-link">...</span></li>}
              <li className="recipes-page-item">
                <button className="recipes-page-link" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
              </li>
            </>
          )}
          <li className={`recipes-page-item ${currentPage === totalPages ? 'recipes-disabled' : ''}`}>
            <button 
              className="recipes-page-link" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &raquo;
            </button>
          </li>
        </ul>
      </div>
    );
  };

  const LoadingAnimation = () => (
    <div className="recipes-loading-animation" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100%',
      position: 'fixed',
      top: 0,
      left: 0,
      backgroundColor: 'rgba(255, 255, 255, 0)',
      zIndex: 1000
    }}>
      <div className="recipes-spinner" style={{
        width: '60px',
        height: '60px',
        border: '6px solid #ffe290',
        borderTop: '6px solid #ff9800',
        borderRadius: '50%',
        animation: 'recipes-spin 1s linear infinite',
        boxShadow: '0 0 10px rgba(255, 152, 0, 0.3)'
      }}></div>
      <p style={{
        marginTop: '20px',
        fontSize: '18px',
        color: '#ff9800',
        fontWeight: 'bold'
      }}>Loading...</p>
      <style>
        {`
          @keyframes recipes-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );

  return (
    <div className="recipes-page">
      <div className="recipes-content">
        <div className="recipes-search-section">
          <form onSubmit={handleSearchWrapper} className="recipes-search-form">
            <div className="recipes-search-wrapper">
              <input
                type="text"
                className="recipes-search-input"
                placeholder="Search recipes"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                type="submit" 
                className="recipes-search-button"
                disabled={!searchTerm.trim()}
              >
                Search
              </button>
            </div>
          </form>
          {hasSearched && (
            <button
              className={`recipes-filter-toggle ${showFilters ? "active" : ""}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          )}
        </div>

        {showFilters && (
          <div className="recipes-filters-section">
            <div className="recipes-filter-buttons">
              {Object.keys(filterOptions).map((filterType) => (
                <button
                  key={filterType}
                  className={`recipes-filter-btn ${
                    activeFilter === filterType ? "active" : ""
                  }`}
                  onClick={() => setActiveFilter(activeFilter === filterType ? null : filterType)}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </button>
              ))}
              <button className="recipes-clear-btn" onClick={clearFilters}>
                Clear Filters
              </button>
              <button className="recipes-apply-btn" onClick={handleApplyFilters}>
                Apply Filters
              </button>
            </div>
            {activeFilter && (
              <div className="recipes-filter-options">
                {filterOptions[activeFilter].map((option) => (
                  <label key={option} className="recipes-checkbox">
                    <input
                      type="checkbox"
                      checked={filters[activeFilter].includes(option)}
                      onChange={() => handleFilterChange(activeFilter, option)}
                    />
                    <span className="recipes-checkmark"></span>
                    <span className="recipes-label-text">{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {recipes.length > 0 && (
          <div className="recipes-pagination">
            {!isLoading && <PaginationControls />}
          </div>
        )}

        {isLoading ? (
          <LoadingAnimation />
        ) : recipes.length > 0 ? (
          <>
            <div className="recipes-grid">
              {currentRecipes.map((recipe, index) => (
                <div key={`${recipe.uri}-${index}`} className="recipes-grid-item">
                  <RecipeCard
                    recipe={recipe}
                    isLiked={likedRecipes.some(likedRecipe => likedRecipe.uri === recipe.uri)}
                    onLikeToggle={() => toggleLikedRecipe(recipe)}
                  />
                </div>
              ))}
            </div>
            <div className="recipes-pagination bottom">
              <PaginationControls isBottom={true} />
            </div>
          </>
        ) : (
          <div className="recipes-no-results">
            <p>No recipes found. Try searching for a recipe or adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Recipes;
