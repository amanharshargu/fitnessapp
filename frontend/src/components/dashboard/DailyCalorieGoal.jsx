import React, { useState, useEffect } from 'react';
import '../../styles/DailyCalorieGoal.css';
import api from "../../services/api";

function DailyCalorieGoal(){
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(0);
  const [totalDailyCalories, setTotalDailyCalories] = useState(0);

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

    fetchCalorieGoal();
  }, []);

  const percentage = dailyCalorieGoal > 0 ? Math.min((totalDailyCalories / dailyCalorieGoal) * 100, 100) : 0;
  const isOverGoal = totalDailyCalories > dailyCalorieGoal;

  return (
    <div className="daily-calorie-goal">
      <h3>Daily Calorie Goal</h3>
      <div className="goal-chart">
        <svg viewBox="0 0 36 36" className="circular-chart">
          <path
            className="circle-bg"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#eee"
            strokeWidth="2"
          />
          <path
            className="circle"
            strokeDasharray={`${percentage}, 100`}
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={isOverGoal ? '#ff4136' : '#4CAF50'}
            strokeWidth="2"
          />
          <text x="18" y="20.35" className="percentage">{Math.round(percentage)}%</text>
        </svg>
      </div>
      <p className="calorie-info">
        Calories eaten: {totalDailyCalories} / {dailyCalorieGoal}
      </p>
    </div>
  );
}

export default DailyCalorieGoal;