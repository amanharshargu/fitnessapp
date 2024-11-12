import React, { useState, useEffect } from 'react';
import { useIngredients } from '../../contexts/IngredientContext';
import { useRecipes } from '../../contexts/RecipeContext';
import RecipeCard from './RecipeCard';
import CardioSpinner from '../common/CardioSpinner';
import '../../styles/SuggestedRecipes.css';

function SuggestedRecipes() {
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { ingredients } = useIngredients();
  const { getRandomRecipes } = useRecipes();

  const fetchRecipesForIngredients = async (ingredientNames) => {
    try {
      const recipes = await getRandomRecipes(12, ingredientNames);
      return recipes.filter(recipe => recipe.ingredientLines && Array.isArray(recipe.ingredientLines));
    } catch (error) {
      console.error('Error fetching recipes:', error);
      return [];
    }
  };

  const fetchSuggestedRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      const fridgeIngredients = ingredients.map(ing => ing.name);
      let recipes = await fetchRecipesForIngredients(fridgeIngredients);
      
      if (recipes.length === 0 && fridgeIngredients.length > 0) {
        const individualRecipesPromises = fridgeIngredients.map(ingredient => 
          fetchRecipesForIngredients([ingredient])
        );
        
        const individualRecipesResults = await Promise.all(individualRecipesPromises);
        recipes = Array.from(new Set(
          individualRecipesResults.flat().map(recipe => JSON.stringify(recipe))
        )).map(str => JSON.parse(str));
      }

      if (recipes.length === 0) {
        setError('No recipes found. Try different ingredients.');
      } else {
        setSuggestedRecipes(recipes.slice(0, 12));
      }
    } catch (err) {
      setError('Failed to fetch suggested recipes. Please try again later.');
      console.error('Error fetching suggested recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestedRecipes();
  }, [ingredients]);

  return (
    <div style={{ paddingLeft: '220px', paddingTop: '70px' }}>
      <div className="suggested-recipes-container">
        <button 
          onClick={fetchSuggestedRecipes} 
          className="suggest-button"
          disabled={loading}
        >
          {loading ? 'Finding Recipes...' : 'Suggest New Recipes'}
        </button>
        <div className="suggested-recipes">
          {loading ? (
            <div className="loading-animation"><CardioSpinner /></div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : suggestedRecipes.length === 0 ? (
            <div className="no-recipes">
              <p>No suggested recipes available. Try adding more ingredients to your fridge or use different ingredients!</p>
            </div>
          ) : (
            <div className="recipe-grid">
              {suggestedRecipes.map((recipe) => (
                <RecipeCard key={recipe.uri} recipe={recipe} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SuggestedRecipes;
