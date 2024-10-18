import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import RecipeCard from '../recipe/RecipeCard';
import CardioSpinner from '../common/CardioSpinner';
import '../../styles/LikedRecipes.css';

function LikedRecipes() {
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLikedRecipes = async () => {
      try {
        const response = await api.get('/recipes/liked');
        setLikedRecipes(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching liked recipes:', err);
        setError('Failed to fetch liked recipes. Please try again later.');
        setLoading(false);
      }
    };

    if (user) {
      fetchLikedRecipes();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="liked-recipes-loading">
        <CardioSpinner size="50" color="#007bff" />
      </div>
    );
  }

  if (error) {
    return <div className="liked-recipes-error">{error}</div>;
  }

  return (
    <div className="liked-recipes-container">
      <h2>Liked Recipes</h2>
      {likedRecipes.length === 0 ? (
        <p>You haven't liked any recipes yet.</p>
      ) : (
        <div className="liked-recipes-grid">
          {likedRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}

export default LikedRecipes;
