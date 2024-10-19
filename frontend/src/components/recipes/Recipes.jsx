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
    setCurrentPage(pageNumber);
  };

  const handleSearchWrapper = useCallback((e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setCurrentPage(1);
      handleSearch(e);
      setHasSearched(true);
    }
  }, [handleSearch, searchTerm, setHasSearched]);

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
      <div className={`pagination-container d-flex justify-content-center ${isBottom ? 'pagination-bottom' : ''}`}>
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
              &laquo;
            </button>
          </li>
          {startPage > 1 && (
            <>
              <li className="page-item">
                <button className="page-link" onClick={() => handlePageChange(1)}>1</button>
              </li>
              {startPage > 2 && <li className="page-item disabled"><span className="page-link">...</span></li>}
            </>
          )}
          {pageNumbers.map(number => (
            <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(number)}>
                {number}
              </button>
            </li>
          ))}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <li className="page-item disabled"><span className="page-link">...</span></li>}
              <li className="page-item">
                <button className="page-link" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
              </li>
            </>
          )}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
              &raquo;
            </button>
          </li>
        </ul>
      </div>
    );
  };

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
      left: 0,
      backgroundColor: 'rgba(255, 255, 255, 0)',
      zIndex: 1000
    }}>
      <div className="spinner" style={{
        width: '60px',
        height: '60px',
        border: '6px solid #ffe290',
        borderTop: '6px solid #ff9800',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
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
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );

  return (
    <div className="recipes-container">
      <div className="recipes-content">
        <div className="search-and-filter">
          <form onSubmit={handleSearchWrapper} className="search-form">
            <div className="input-group">
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search recipes"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                type="submit" 
                className="btn btn-primary search-button"
                disabled={!searchTerm.trim()}
              >
                Search
              </button>
            </div>
          </form>
          {hasSearched && (
            <button
              className={`btn ${
                showFilters ? "btn-secondary" : "btn-outline-secondary"
              } show-filters-btn`}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          )}
        </div>

        {showFilters && (
          <div className="filters-section mb-1">
            <div className="d-flex justify-content-start">
              {Object.keys(filterOptions).map((filterType) => (
                <button
                  key={filterType}
                  className={`btn ${
                    activeFilter === filterType
                      ? "btn-primary active-filter"
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
              <button className="btn btn-success" onClick={handleApplyFilters}>
                Apply Filters
              </button>
            </div>
            {activeFilter && (
              <div className="mb-3">
                <div className="filter-options">
                  {filterOptions[activeFilter].map((option) => (
                    <label key={option} className="custom-checkbox">
                      <input
                        type="checkbox"
                        checked={filters[activeFilter].includes(option)}
                        onChange={() => handleFilterChange(activeFilter, option)}
                      />
                      <span className="checkmark"></span>
                      <span className="label-text">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {recipes.length > 0 && (
          <div className="d-flex justify-content-between align-items-center mb-3">
            {!isLoading && <PaginationControls />}
          </div>
        )}

        {isLoading ? (
          <LoadingAnimation />
        ) : recipes.length > 0 ? (
          <>
            <div className="row">
              {currentRecipes.map((recipe, index) => (
                <div key={`${recipe.uri}-${index}`} className="col-md-3 col-sm-6 mb-4">
                  <RecipeCard
                    recipe={recipe}
                    isLiked={likedRecipes.some(likedRecipe => likedRecipe.uri === recipe.uri)}
                    onLikeToggle={() => toggleLikedRecipe(recipe)}
                  />
                </div>
              ))}
            </div>
            <PaginationControls isBottom={true} />
          </>
        ) : (
          <div className="no-recipes-message">
            <p>No recipes found. Try searching for a recipe or adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Recipes;
