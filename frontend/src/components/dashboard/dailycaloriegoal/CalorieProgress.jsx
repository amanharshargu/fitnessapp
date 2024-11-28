import React from 'react';
import Confetti from 'react-confetti';

export default function CalorieProgress({ 
  showConfetti, 
  confettiRecycle, 
  percentage, 
  totalDailyCalories, 
  dailyCalorieGoal, 
  isGoalExactlyMet, 
  isOverGoal, 
  progressColor, 
  caloriesExceeded 
}) {
  const formatPercentage = (value) => {
    if (value === 100) return "100";
    return value.toFixed(2).replace(/\.00$/, '');
  };

  return (
    <div className="dcg-goal-chart-container">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight - 75}
          recycle={confettiRecycle}
          numberOfPieces={200}
          gravity={0.1}
        />
      )}
      <div className="dcg-goal-chart-wrapper">
        <div className="dcg-goal-chart" role="progressbar" 
             aria-valuenow={totalDailyCalories} 
             aria-valuemin="0" 
             aria-valuemax={dailyCalorieGoal}
             aria-label="Calorie progress">
          <svg viewBox="0 0 36 36" className="dcg-circular-chart">
            <path
              className={`dcg-circle-bg ${isGoalExactlyMet || isOverGoal ? 'dcg-goal-reached-bg' : ''}`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              stroke={isGoalExactlyMet || isOverGoal ? progressColor : "#ffe290"}
            />
            <path
              className="dcg-circle"
              strokeDasharray={`${percentage}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
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
  );
} 