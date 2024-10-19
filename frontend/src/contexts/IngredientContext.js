import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const IngredientContext = createContext();

export const useIngredients = () => useContext(IngredientContext);

export const IngredientProvider = ({ children }) => {
  const [ingredients, setIngredients] = useState([]);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      fetchIngredients();
    }
  }, [isLoggedIn]);

  const fetchIngredients = async () => {
    if (!isLoggedIn) return;
    try {
      const response = await api.get("/ingredients");
      setIngredients(response.data);
    } catch (error) {
      console.error("Error fetching ingredients:", error.response?.data || error.message);
    }
  };

  const addIngredient = async (newIngredient) => {
    if (!isLoggedIn) return;
    try {
      await api.post("/ingredients", newIngredient);
      await fetchIngredients();
    } catch (error) {
      console.error("Error adding ingredient:", error.response?.data || error.message);
    }
  };

  const updateIngredient = async (id, updatedIngredient) => {
    if (!isLoggedIn) return;
    try {
      await api.put(`/ingredients/${id}`, updatedIngredient);
      await fetchIngredients();
    } catch (error) {
      console.error("Error updating ingredient:", error.response?.data || error.message);
    }
  };

  const deleteIngredient = async (id) => {
    if (!isLoggedIn) return;
    try {
      await api.delete(`/ingredients/${id}`);
      await fetchIngredients();
    } catch (error) {
      console.error("Error deleting ingredient:", error.response?.data || error.message);
    }
  };

  return (
    <IngredientContext.Provider value={{
      ingredients,
      addIngredient,
      updateIngredient,
      deleteIngredient,
      fetchIngredients
    }}>
      {children}
    </IngredientContext.Provider>
  );
};