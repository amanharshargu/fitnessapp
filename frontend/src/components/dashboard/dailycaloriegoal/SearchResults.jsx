import React from 'react';

export default function SearchResults({ results, onSelect }) {
  if (!results || results.length === 0) return null;

  return (
    <div className="dcg-search-results">
      {results.map((recipe) => (
        <div
          key={recipe.uri}
          className="dcg-search-result-item"
          onClick={() => onSelect(recipe)}
        >
          <img 
            src={recipe.image} 
            alt={recipe.label}
            className="dcg-result-image"
          />
          <div className="dcg-result-info">
            <div className="dcg-result-name">{recipe.label}</div>
            <div className="dcg-result-calories">
              {Math.round(recipe.calories / recipe.yield)} cal per serving
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 