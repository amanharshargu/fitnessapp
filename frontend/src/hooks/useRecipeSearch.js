import { useState } from 'react';
import { useRecipes } from '../contexts/RecipeContext';

export function useRecipeSearch() {
  const { recipes, isLoading, fetchRecipes } = useRecipes();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    diet: [],
    health: [],
    cuisineType: [],
    mealType: [],
  });
  const [activeFilter, setActiveFilter] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchRecipes(searchTerm, filters);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: prevFilters[filterType].includes(value)
        ? prevFilters[filterType].filter((item) => item !== value)
        : [...prevFilters[filterType], value],
    }));
  };

  const clearFilters = () => {
    setFilters({
      diet: [],
      health: [],
      cuisineType: [],
      mealType: [],
    });
    setActiveFilter(null);
  };

  const applyFilters = () => {
    if (searchTerm.trim()) {
      fetchRecipes(searchTerm, filters);
    }
  };

  return {
    recipes,
    isLoading,
    searchTerm,
    setSearchTerm,
    filters,
    activeFilter,
    setActiveFilter,
    handleSearch,
    handleFilterChange,
    clearFilters,
    applyFilters,
  };
}