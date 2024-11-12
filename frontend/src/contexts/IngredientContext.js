import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const IngredientContext = createContext();

export function IngredientProvider({ children }) {
  const [ingredients, setIngredients] = useState([]);
  const { token } = useAuth();

  const refreshIngredients = useCallback(async () => {
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
      setIngredients(data);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    }
  }, [token]);

  const addIngredient = async (newIngredient) => {
    if (!token) return;
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/ingredients`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newIngredient),
      });
      await refreshIngredients();
    } catch (error) {
      console.error('Error adding ingredient:', error);
    }
  };

  const updateIngredient = async (id, updatedIngredient) => {
    if (!token) return;
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/ingredients/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedIngredient),
      });
      await refreshIngredients();
    } catch (error) {
      console.error('Error updating ingredient:', error);
    }
  };

  const deleteIngredient = async (id) => {
    if (!token) return;
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/ingredients/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      await refreshIngredients();
    } catch (error) {
      console.error('Error deleting ingredient:', error);
    }
  };

  return (
    <IngredientContext.Provider value={{
      ingredients,
      setIngredients,
      deleteIngredient,
      refreshIngredients,
      addIngredient,
      updateIngredient,
    }}>
      {children}
    </IngredientContext.Provider>
  );
}

export function useIngredients() {
  return useContext(IngredientContext);
}