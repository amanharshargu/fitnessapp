import React, { useState } from 'react';
import '../../styles/WeeklyCalorieTracker.css';

function WeeklyCalorieTracker({ weeklyData }) {
  const [hoveredDay, setHoveredDay] = useState(null);

  const getBarColor = (calories, goal) => {
    if (calories > goal) return "#FF6666";
    if (calories === goal) return "#90EE90";
    return "#ff7800";
  };

  return (
    <div className="weekly-calorie-tracker">
      <h3>Weekly Calorie Tracker</h3>
      <div className="calorie-chart">
        {weeklyData.map((day) => (
          <div 
            key={day.date} 
            className="calorie-bar"
            onMouseEnter={() => setHoveredDay(day.date)}
            onMouseLeave={() => setHoveredDay(null)}
          >
            <div className="bar-container">
              <div 
                className="bar actual" 
                style={{ 
                  maxHeight: '100%',
                  height: `${day.goal > 0 ? (day.calories / day.goal) * 100 : 0}%`,
                  backgroundColor: getBarColor(day.calories, day.goal)
                }}
              ></div>
              <div 
                className="bar goal" 
                style={{ height: '100%' }}
              ></div>
            </div>
            <span className="day">{day.day}</span>
            {hoveredDay === day.date && (
              <div className="calories-tooltip">
                {day.goal > 0 ? `${day.calories}/${day.goal}` : "Please set your information"}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color actual"></div>
          <span>Actual Calories</span>
        </div>
        <div className="legend-item">
          <div className="legend-color goal"></div>
          <span>Daily Calorie Goal</span>
        </div>
      </div>
    </div>
  );
}

export default WeeklyCalorieTracker;
