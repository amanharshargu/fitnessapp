import React from 'react';
import '../../styles/WeeklyCalorieGoal.css';

function WeeklyCalorieGoal({ userDetails }) {
  const dailyCalorieGoal = userDetails.dailyCalorieGoal || 2000; // Default to 2000 if not set
  const weeklyCalorieGoal = dailyCalorieGoal * 7;

  // This is a placeholder. In a real application, you'd fetch this data from your backend
  const totalWeeklyCalories = 15100; // Example value

  const percentage = weeklyCalorieGoal > 0 ? Math.min((totalWeeklyCalories / weeklyCalorieGoal) * 100, 100) : 0;
  const isOverGoal = totalWeeklyCalories > weeklyCalorieGoal;

  return (
    <div className="weekly-calorie-goal">
      <h3>Weekly Calorie Goal</h3>
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
        Calories eaten: {totalWeeklyCalories} / {weeklyCalorieGoal}
      </p>
    </div>
  );
}

export default WeeklyCalorieGoal;