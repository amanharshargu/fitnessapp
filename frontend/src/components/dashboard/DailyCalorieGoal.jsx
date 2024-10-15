import React, { useState, useEffect } from 'react';
import '../../styles/DailyCalorieGoal.css';
import api from "../../services/api";

function DailyCalorieGoal({ onDishesChanged }){
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(0);
  const [totalDailyCalories, setTotalDailyCalories] = useState(0);
  const [dishes, setDishes] = useState([]);
  const [newDish, setNewDish] = useState({ name: '', calories: '' });
  const [editingDish, setEditingDish] = useState(null);

  useEffect(() => {
    const fetchCalorieGoal = async () => {
      try {
        const response = await api.get(`/dashboard/calorie-goal`);
        const data = response.data;
        setDailyCalorieGoal(data.dailyCalories || 0);
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
  }, [dishes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDish(prev => ({ ...prev, [name]: value }));
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
        onDishesChanged(); // Call this function to update weekly data
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
    setEditingDish(prev => ({ ...prev, [name]: value }));
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
      onDishesChanged(); // Call this function to update weekly data
    } catch (error) {
      console.error('Error updating eaten dish:', error);
    }
  };

  const deleteDish = async (id) => {
    try {
      await api.delete(`/dashboard/eaten-dishes/${id}`);
      setDishes(prev => prev.filter(dish => dish.id !== id));
      onDishesChanged(); // Call this function to update weekly data
    } catch (error) {
      console.error('Error deleting eaten dish:', error);
    }
  };

  const percentage = dailyCalorieGoal > 0 ? Math.min((totalDailyCalories / dailyCalorieGoal) * 100, 100) : 0;
  const isOverGoal = totalDailyCalories > dailyCalorieGoal;

  return (
    <div className="dcg-daily-calorie-goal">
      <h3>Daily Calorie Goal</h3>
      <div className="dcg-goal-content">
        <div className="dcg-goal-chart-container">
          <div className="dcg-goal-chart">
            <svg viewBox="0 0 36 36" className="dcg-circular-chart">
              <path
                className="dcg-circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="dcg-circle"
                strokeDasharray={`${percentage}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                stroke="#ff7800" // Changed to dark orange
              />
              <text x="18" y="20.35" className="dcg-percentage">{Math.round(percentage)}%</text>
            </svg>
          </div>
          <p className="dcg-calorie-info">
            Calories eaten: {totalDailyCalories} / {dailyCalorieGoal}
          </p>
        </div>
        
        <div className="dcg-goal-details">
          <form onSubmit={addDish} className="dcg-form">
            <div className="dcg-form-inputs">
              <input
                type="text"
                name="name"
                value={newDish.name}
                onChange={handleInputChange}
                placeholder="Dish name"
                required
              />
              <input
                type="number"
                name="calories"
                value={newDish.calories}
                onChange={handleInputChange}
                placeholder="Calories"
                required
              />
            </div>
            <div className="dcg-form-button-container">
              <button type="submit">Add Dish</button>
            </div>
          </form>

          <div className="dcg-dishes-list-container">
            <ul className="dcg-dishes-list">
              {dishes.map((dish) => (
                <li key={dish.id}>
                  <div className="dcg-dish-content">
                    {editingDish && editingDish.id === dish.id ? (
                      <div className="dcg-editing-dish">
                        <input
                          type="text"
                          name="dishName"
                          value={editingDish.dishName}
                          onChange={handleEditChange}
                          placeholder="Dish name"
                        />
                        <input
                          type="number"
                          name="calories"
                          value={editingDish.calories}
                          onChange={handleEditChange}
                          placeholder="Calories"
                        />
                        <div className="dcg-editing-dish-actions">
                          <button onClick={saveEdit}>Save</button>
                          <button onClick={() => setEditingDish(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <span className="dcg-dish-info">{dish.dishName}</span>
                          <div className="dcg-dish-calories">{dish.calories} calories</div>
                        </div>
                        <div className="dcg-dish-actions">
                          <button onClick={() => startEditing(dish)}>Edit</button>
                          <button onClick={() => deleteDish(dish.id)}>Delete</button>
                        </div>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailyCalorieGoal;
