import { useState, useCallback } from 'react';
import { useRecipes } from '../contexts/RecipeContext';

export default function useRecipeSearch() {
  const {
    recipes, isLoading, fetchRecipes, searchTerm,
  } = useRecipes();
  const [filters, setFilters] = useState({
    diet: [],
    health: [],
    cuisineType: [],
    mealType: [],
  });
  const [activeFilter, setActiveFilter] = useState(null);

  const handleSearch = useCallback(() => {
    if (searchTerm.trim()) {
      fetchRecipes(searchTerm, filters);
    }
  }, [searchTerm, filters, fetchRecipes]);

  const handleFilterChange = useCallback((filterType, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: prevFilters[filterType].includes(value)
        ? prevFilters[filterType].filter((item) => item !== value)
        : [...prevFilters[filterType], value],
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      diet: [],
      health: [],
      cuisineType: [],
      mealType: [],
    });
    setActiveFilter(null);
  }, []);

  const applyFilters = useCallback(() => {
    if (searchTerm.trim()) {
      fetchRecipes(searchTerm, filters);
    }
  }, [searchTerm, filters, fetchRecipes]);

  return {
    recipes,
    isLoading,
    filters,
    activeFilter,
    setActiveFilter,
    handleSearch,
    handleFilterChange,
    clearFilters,
    applyFilters,
  };
}
