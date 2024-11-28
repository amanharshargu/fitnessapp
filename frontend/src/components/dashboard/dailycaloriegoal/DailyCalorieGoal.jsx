import React, { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from 'lodash';
import { useRecipes } from "../../../contexts/RecipeContext";
import api from "../../../services/api";
import CalorieProgress from './CalorieProgress';
import DishForm from './DishForm';
import DishesList from './DishesList';
import '../../../styles/DailyCalorieGoal.css';

function DailyCalorieGoal({ onDishesChanged }) {
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(null);
  const [totalDailyCalories, setTotalDailyCalories] = useState(0);
  const [dishes, setDishes] = useState([]);
  const [newDish, setNewDish] = useState({ name: '', calories: '' });
  const [editingDish, setEditingDish] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiRecycle, setConfettiRecycle] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const { fetchRecipes, recipes, isLoading } = useRecipes();
  const searchContainerRef = useRef(null);
  const [isAddingDish, setIsAddingDish] = useState(false);

  useEffect(() => {
    const fetchCalorieGoal = async () => {
      try {
        const response = await api.get(`/dashboard/calorie-goal`);
        const data = response.data;
        setDailyCalorieGoal(data.dailyCalories || null);
      } catch (error) {
        console.error('Error fetching calorie goal:', error);
      }
    };

    const fetchEatenDishes = async () => {
      try {
        const response = await api.get('/dashboard/eaten-dishes');
        setDishes(response.data);
      } catch (error) {
        console.error('Error fetching eaten dishes:', error);
      }
    };

    fetchCalorieGoal();
    fetchEatenDishes();
  }, []);

  useEffect(() => {
    const total = dishes.reduce((sum, dish) => sum + dish.calories, 0);
    setTotalDailyCalories(total);

    if (dailyCalorieGoal && total === dailyCalorieGoal) {
      setShowConfetti(true);
      setConfettiRecycle(true);
      setTimeout(() => {
        setConfettiRecycle(false);
        setTimeout(() => setShowConfetti(false), 5000);
      }, 4000);
    }
  }, [dishes, dailyCalorieGoal]);

  useEffect(() => {
    if (recipes && recipes.length > 0) {
      const formattedResults = recipes.map(recipe => ({
        uri: recipe.uri,
        label: recipe.label,
        image: recipe.image,
        calories: recipe.calories,
        yield: recipe.yield
      }));
      setSearchResults(formattedResults.slice(0, 5));
    } else {
      setSearchResults([]);
    }
  }, [recipes]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const percentage = dailyCalorieGoal > 0 ? Math.min((totalDailyCalories / dailyCalorieGoal) * 100, 100) : 0;
  const isGoalExactlyMet = totalDailyCalories === dailyCalorieGoal;
  const isOverGoal = dailyCalorieGoal > 0 && totalDailyCalories > dailyCalorieGoal;
  const progressColor = isOverGoal ? "#FF6666" : (isGoalExactlyMet ? "#28a745" : "#ff7800");
  const caloriesExceeded = isOverGoal ? totalDailyCalories - dailyCalorieGoal : 0;

  const debouncedSearch = useCallback(
    debounce(async (searchTerm) => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }
      
      try {
        await fetchRecipes(searchTerm);
      } catch (error) {
        console.error('Error searching recipes:', error);
        setSearchResults([]);
      }
    }, 300),
    [fetchRecipes]
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') {
      setNewDish(prev => ({ ...prev, [name]: value }));
      if (value.length >= 2) {
        debouncedSearch(value);
      } else {
        setSearchResults([]);
      }
    } else {
      const numericValue = value.replace(/\D/g, '');
      setNewDish(prev => ({ ...prev, [name]: numericValue }));
    }
  };

  const handleRecipeSelect = (recipe) => {
    setNewDish({
      name: recipe.label,
      calories: Math.round(recipe.calories / recipe.yield)
    });
    setSearchResults([]);
  };

  const addDish = async (e) => {
    e.preventDefault();
    if (newDish.name && newDish.calories) {
      setIsAddingDish(true);
      try {
        const response = await api.post('/dashboard/eaten-dishes', {
          dishName: newDish.name,
          calories: parseInt(newDish.calories),
          eatenAt: new Date().toISOString().split('T')[0],
        });
        setDishes(prev => [...prev, response.data]);
        setNewDish({ name: '', calories: '' });
        onDishesChanged();
      } catch (error) {
        console.error('Error adding eaten dish:', error);
      } finally {
        setIsAddingDish(false);
      }
    }
  };

  const startEditing = (dish) => {
    setEditingDish({ ...dish });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === 'calories') {
      const numericValue = value.replace(/\D/g, '');
      setEditingDish(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setEditingDish(prev => ({ ...prev, [name]: value }));
    }
  };

  const saveEdit = async () => {
    try {
      const response = await api.put(`/dashboard/eaten-dishes/${editingDish.id}`, {
        dishName: editingDish.dishName,
        calories: parseInt(editingDish.calories),
        eatenAt: editingDish.eatenAt,
      });
      const updatedDishes = dishes.map(dish => 
        dish.id === editingDish.id ? response.data : dish
      );
      setDishes(updatedDishes);
      setEditingDish(null);
      onDishesChanged();
    } catch (error) {
      console.error('Error updating eaten dish:', error);
    }
  };

  const handleDelete = (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async (id) => {
    try {
      setDeletingId(id);
      await api.delete(`/dashboard/eaten-dishes/${id}`);
      setDishes(prev => prev.filter(dish => dish.id !== id));
      onDishesChanged();
    } finally {
      setDeletingId(null);
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const renderDeleteButton = (id) => (
    <>
      {deleteConfirm === id ? (
        <div className="dcg-delete-confirmation">
          {deletingId === id ? (
            <div className="dcg-delete-loading">
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span>Deleting...</span>
            </div>
          ) : (
            <>
              <span>Delete?</span>
              <button
                className="dcg-confirm-button"
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDelete(id);
                }}
              >
                Yes
              </button>
              <button
                className="dcg-cancel-button"
                onClick={(e) => {
                  e.stopPropagation();
                  cancelDelete();
                }}
              >
                No
              </button>
            </>
          )}
        </div>
      ) : (
        <button
          className="dcg-delete-button"
          onClick={() => handleDelete(id)}
        >
          <i className="fas fa-trash-alt"></i>
        </button>
      )}
    </>
  );

  return (
    <div className="dcg-daily-calorie-goal" role="region" aria-label="Daily Calorie Goal">
      <h3 id="calorie-goal-title">Daily Calorie Goal</h3>
      <div className="dcg-goal-content" aria-labelledby="calorie-goal-title">
        <CalorieProgress 
          showConfetti={showConfetti}
          confettiRecycle={confettiRecycle}
          percentage={percentage}
          totalDailyCalories={totalDailyCalories}
          dailyCalorieGoal={dailyCalorieGoal}
          isGoalExactlyMet={isGoalExactlyMet}
          isOverGoal={isOverGoal}
          progressColor={progressColor}
          caloriesExceeded={caloriesExceeded}
        />
        
        <div className="dcg-goal-details">
          <DishForm 
            newDish={newDish}
            handleInputChange={handleInputChange}
            isLoading={isLoading}
            searchResults={searchResults}
            handleRecipeSelect={handleRecipeSelect}
            isAddingDish={isAddingDish}
            onSubmit={addDish}
            searchContainerRef={searchContainerRef}
          />

          {dishes.length > 0 && (
            <DishesList 
              dishes={dishes}
              editingDish={editingDish}
              handleEditChange={handleEditChange}
              saveEdit={saveEdit}
              setEditingDish={setEditingDish}
              startEditing={startEditing}
              renderDeleteButton={renderDeleteButton}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default DailyCalorieGoal;
