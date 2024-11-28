import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const IngredientContext = createContext();

export function IngredientProvider({ children }) {
  const [state, setState] = useState({
    ingredients: [],
    loading: false,
    error: null
  });
  
  const { token } = useAuth();

  const refreshIngredients = useCallback(async () => {
    if (!token) return;
    
    setState(prev => ({ ...prev, loading: true }));
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/ingredients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ingredients');
      }

      const data = await response.json();
      setState(prev => ({
        ...prev,
        ingredients: data,
        error: null,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to fetch ingredients',
        loading: false
      }));
      console.error('Error fetching ingredients:', error);
    }
  }, [token]);

  const addIngredient = useCallback(async (newIngredient) => {
    if (!token) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/ingredients`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newIngredient),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add ingredient');
      }
      
      const addedIngredient = await response.json();
      setState(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, addedIngredient]
      }));
    } catch (error) {
      console.error('Error adding ingredient:', error);
      throw error;
    }
  }, [token]);

  const updateIngredient = useCallback(async (id, updatedIngredient) => {
    if (!token) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/ingredients/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedIngredient),
      });

      if (!response.ok) {
        throw new Error('Failed to update ingredient');
      }

      const updated = await response.json();
      setState(prev => ({
        ...prev,
        ingredients: prev.ingredients.map(ingredient =>
          ingredient.id === id ? updated : ingredient
        )
      }));
    } catch (error) {
      console.error('Error updating ingredient:', error);
      throw error;
    }
  }, [token]);

  const deleteIngredient = useCallback(async (id) => {
    if (!token) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/ingredients/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete ingredient');
      }

      setState(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter(ingredient => ingredient.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      throw error;
    }
  }, [token]);

  const value = {
    ingredients: state.ingredients,
    loading: state.loading,
    setIngredients: ingredients => setState(prev => ({ ...prev, ingredients })),
    deleteIngredient,
    refreshIngredients,
    addIngredient,
    updateIngredient,
  };

  return (
    <IngredientContext.Provider value={value}>
      {children}
    </IngredientContext.Provider>
  );
}

export function useIngredients() {
  return useContext(IngredientContext);
}