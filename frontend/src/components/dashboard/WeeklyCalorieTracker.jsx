import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import api from '../../services/api';
import '../../styles/WeeklyCalorieTracker.css';

function WeeklyCalorieTracker({ weeklyData }) {
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(null);
  const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  const daysOfWeek = [...Array(7)].map((_, index) => addDays(startOfCurrentWeek, index));

  useEffect(() => {
    const fetchCalorieGoal = async () => {
      try {
        const { data } = await api.get(`/dashboard/calorie-goal`);
        setDailyCalorieGoal(data.dailyCalories || null);
      } catch (error) {
        console.error('Error fetching calorie goal:', error);
      }
    };

    fetchCalorieGoal();
  }, []);

  const getCaloriesForDate = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return weeklyData.find(d => d.date === formattedDate)?.calories || 0;
  };

  const maxCalories = Math.max(
    ...weeklyData.map(d => d.calories || 0),
    dailyCalorieGoal || 0,
    2000
  ) * 1.2;

  const getBarColor = (calories, isToday) => {
    if (!calories) return '#E0E0E0';
    if (isToday) {
      if (calories > dailyCalorieGoal) return '#ff4444';
      if (calories === dailyCalorieGoal) return '#66BB6A';
      return '#2196F3';
    }
    return '#8e9aaf';
  };

  const renderBar = (date) => {
    const calories = getCaloriesForDate(date);
    const heightPercentage = (calories / maxCalories) * 100;
    const goalHeightPercentage = dailyCalorieGoal ? (dailyCalorieGoal / maxCalories) * 100 : 0;
    const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

    return (
      <div key={date} className="calorie-bar">
        <div className="bar-container">
          {dailyCalorieGoal && (
            <div 
              className="bar goal" 
              style={{ height: `${goalHeightPercentage}%` }}
            />
          )}
          <div 
            className="bar actual"
            style={{ 
              height: `${heightPercentage}%`,
              backgroundColor: getBarColor(calories, isToday)
            }}
          >
            {calories > 0 && (
              <div className="calories-tooltip">
                <div className="tooltip-content">
                  <div className="tooltip-main">{calories} / {dailyCalorieGoal} cal</div>
                  {dailyCalorieGoal && calories > dailyCalorieGoal && (
                    <div className="tooltip-excess">
                      (+{calories - dailyCalorieGoal})
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="day">
          <span className="day-name">{format(date, 'EEE')}</span>
          <span className="day-number">{format(date, 'd')}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="weekly-calorie-tracker">
      <h3>Weekly Overview</h3>
      <div className="calorie-chart">
        {daysOfWeek.map(renderBar)}
      </div>
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color past"></div>
          <span>Past Days</span>
        </div>
        <div className="legend-item">
          <div className="legend-color over"></div>
          <span>Today (Over)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color at-goal"></div>
          <span>Today (At Goal)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color under"></div>
          <span>Today (Under)</span>
        </div>
      </div>
    </div>
  );
}

export default WeeklyCalorieTracker;
