import React, { useState, useEffect, useCallback } from 'react';
import '../../styles/DailyCalorieGoal.css';
import api from "../../services/api";
import Confetti from 'react-confetti';
import { useRecipes } from "../../contexts/RecipeContext";
import { debounce } from 'lodash';

function DailyCalorieGoal({ onDishesChanged }){
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
  const [isSearching, setIsSearching] = useState(false);
  const { fetchRecipes, recipes, isLoading } = useRecipes();
  const [searchTerm, setSearchTerm] = useState('');

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

  const formatPercentage = (value) => {
    if (value === 100) return "100";
    return value.toFixed(2).replace(/\.00$/, '');
  };

  return (
    <div className="dcg-daily-calorie-goal" role="region" aria-label="Daily Calorie Goal">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight - 75}
          recycle={confettiRecycle}
          numberOfPieces={200}
          gravity={0.1}
        />
      )}
      <h3 id="calorie-goal-title">Daily Calorie Goal</h3>
      <div className="dcg-goal-content" aria-labelledby="calorie-goal-title">
        <div className="dcg-goal-chart-container">
          <div className="dcg-goal-chart-wrapper">
            <div className="dcg-goal-chart" role="progressbar" 
                 aria-valuenow={totalDailyCalories} 
                 aria-valuemin="0" 
                 aria-valuemax={dailyCalorieGoal}
                 aria-label="Calorie progress">
              <svg viewBox="0 0 36 36" className="dcg-circular-chart">
                <path
                  className={`dcg-circle-bg ${isGoalExactlyMet || isOverGoal ? 'dcg-goal-reached-bg' : ''}`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  stroke={isGoalExactlyMet || isOverGoal ? progressColor : "#ffe290"}
                />
                <path
                  className="dcg-circle"
                  strokeDasharray={`${percentage}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  stroke={progressColor}
                />
                <text x="18" y="20.35" className="dcg-percentage">{formatPercentage(percentage)}%</text>
              </svg>
            </div>
            <div className="dcg-goal-info">
              <p className="dcg-calorie-info">
                {dailyCalorieGoal > 0 
                  ? `Calories eaten: ${totalDailyCalories} / ${dailyCalorieGoal}`
                  : "Please set your information to view calorie goal"}
              </p>
              {isGoalExactlyMet && (
                <div className="dcg-goal-reached">
                  <p>Congratulations! You've reached your daily calorie goal!</p>
                </div>
              )}
              {isOverGoal && (
                <div className="dcg-calorie-warning">
                  <p>Warning: You have exceeded your daily calorie goal by {Math.round(caloriesExceeded)} {Math.round(caloriesExceeded) === 1 ? 'calorie' : 'calories'}!</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="dcg-goal-details">
          <form onSubmit={addDish} className="dcg-form">
            <div className="dcg-form-inputs">
              <div className="dcg-input-row">
                <div className="dcg-search-container">
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

                  {searchResults.length > 0 && (
                    <div className="dcg-search-results">
                      {searchResults.map((recipe) => (
                        <div
                          key={recipe.uri}
                          className="dcg-search-result-item"
                          onClick={() => handleRecipeSelect(recipe)}
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
                  )}
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
              
              <button type="submit" aria-label="Add new dish">Add Dish</button>
            </div>
          </form>

          {dishes.length > 0 && (
            <div className="dcg-dishes-list-container">
              <h4 style={{ color: '#ff7800', fontSize: '0.9rem', marginBottom: '5px' }}>Today's Dishes</h4>
              <ul className="dcg-dishes-list">
                {dishes.map((dish) => (
                  <li key={dish.id}>
                    <div className="dcg-dish-content" style={{ padding: '6px 8px' }}>
                      {editingDish && editingDish.id === dish.id ? (
                        <div className="dcg-editing-dish">
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            saveEdit();
                          }}>
                            <input
                              type="text"
                              name="dishName"
                              value={editingDish.dishName}
                              onChange={handleEditChange}
                              placeholder="Dish name"
                              className="dcg-edit-input dcg-edit-input--name"
                            />
                            <input
                              type="text"
                              name="calories"
                              value={editingDish.calories}
                              onChange={handleEditChange}
                              placeholder="Calories"
                              pattern="\d*"
                              className="dcg-edit-input dcg-edit-input--calories"
                            />
                            <div className="dcg-editing-dish-actions">
                              <button type="submit" className="dcg-edit-save-button">Save</button>
                              <button 
                                type="button" 
                                className="dcg-edit-cancel-button" 
                                onClick={() => setEditingDish(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      ) : (
                        <>
                          <div className="dcg-dish-info" style={{ fontSize: '0.8rem' }}>
                            <span>{dish.dishName}</span>
                            <span className="dcg-dish-calories" style={{ color: '#ff7800' }}> • {dish.calories} cal</span>
                          </div>
                          <div className="dcg-dish-actions">
                            <button onClick={() => startEditing(dish)} className="dcg-edit-button">
                              <i className="fas fa-pencil-alt"></i>
                            </button>
                            {renderDeleteButton(dish.id)}
                          </div>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DailyCalorieGoal;
