import React from 'react';
import '../../styles/WeeklyCalorieTracker.css';

function WeeklyCalorieTracker({ userDetails }) {
  // This is a placeholder. In a real application, you'd fetch this data from your backend
  const weeklyData = [
    { day: 'Mon', calories: 2100 },
    { day: 'Tue', calories: 2300 },
    { day: 'Wed', calories: 2000 },
    { day: 'Thu', calories: 2200 },
    { day: 'Fri', calories: 2400 },
    { day: 'Sat', calories: 2600 },
    { day: 'Sun', calories: 2500 },
  ];

  // Placeholder data for previous weeks
  const previousWeeksData = [
    { week: 'Last Week', avgCalories: 2250 },
    { week: '2 Weeks Ago', avgCalories: 2180 },
    { week: '3 Weeks Ago', avgCalories: 2300 },
  ];

  return (
    <div className="weekly-calorie-tracker">
      <h3>Weekly Calorie Tracker</h3>
      <div className="calorie-chart">
        {weeklyData.map((day) => (
          <div key={day.day} className="calorie-bar">
            <div className="bar" style={{ height: `${day.calories / 30}px` }}></div>
            <span className="day">{day.day}</span>
          </div>
        ))}
      </div>
      <div className="previous-weeks-tracker">
        <h4>Previous Weeks Average Daily Calories</h4>
        <ul>
          {previousWeeksData.map((week) => (
            <li key={week.week}>
              <span>{week.week}:</span> {week.avgCalories} calories/day
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default WeeklyCalorieTracker;