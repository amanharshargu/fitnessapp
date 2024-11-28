import React from 'react';
import SearchResults from './SearchResults';

export default function DishForm({ 
  newDish, 
  handleInputChange, 
  isLoading, 
  searchResults, 
  handleRecipeSelect,
  isAddingDish,
  onSubmit,
  searchContainerRef 
}) {
  return (
    <form onSubmit={onSubmit} className="dcg-form">
      <div className="dcg-form-inputs">
        <div className="dcg-input-row">
          <div className="dcg-search-container" ref={searchContainerRef}>
            <label htmlFor="dish-name" className="visually-hidden">Dish name</label>
            <input
              id="dish-name"
              type="text"
              name="name"
              value={newDish.name}
              onChange={handleInputChange}
              placeholder="Search or enter dish name"
              required
              aria-label="Enter dish name"
              autoComplete="off"
            />
            
            {isLoading && (
              <div className="dcg-search-loading">
                <div className="dcg-spinner"></div>
              </div>
            )}

            <SearchResults 
              results={searchResults}
              onSelect={handleRecipeSelect}
            />
          </div>
          
          <div className="dcg-calories-input">
            <label htmlFor="dish-calories" className="visually-hidden">Calories</label>
            <input
              id="dish-calories"
              type="text"
              name="calories"
              value={newDish.calories}
              onChange={handleInputChange}
              placeholder="Calories"
              required
              pattern="\d*"
              aria-label="Enter calories"
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={isAddingDish}
          aria-label={isAddingDish ? "Adding dish..." : "Add new dish"}
        >
          {isAddingDish ? (
            <div className="dcg-button-loading">
              <div className="dcg-spinner"></div>
              <span>Adding...</span>
            </div>
          ) : (
            'Add Dish'
          )}
        </button>
      </div>
    </form>
  );
} 