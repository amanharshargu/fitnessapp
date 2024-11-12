import React, { useState } from 'react';
import api from '../../services/api';
import '../../styles/WaterIntakeTracker.css';

function WaterIntakeTracker({ intake, onUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const dailyGoal = 2000;
  const glassSize = 250;
  const bottleSize = 500;

  const handleAddWater = async (amount) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await api.post('/dashboard/water-intake', { amount });
      onUpdate();
      showSuccessFeedback(amount);
    } catch (error) {
      console.error('Error updating water intake:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const showSuccessFeedback = (amount) => {
    setShowFeedback(amount);
    setTimeout(() => setShowFeedback(false), 1500);
  };

  const calculateProgress = () => {
    return Math.min((intake / dailyGoal) * 100, 100);
  };

  const getProgressColor = () => {
    const progress = (intake / dailyGoal) * 100;
    if (progress >= 100) return '#4CAF50';
    if (progress >= 75) return '#8BC34A';
    if (progress >= 50) return '#FFC107';
    if (progress >= 25) return '#FF9800';
    return '#FF5722';
  };

  const getRemainingWater = () => {
    const remaining = dailyGoal - intake;
    return remaining > 0 ? remaining : 0;
  };

  const getProgressMessage = () => {
    const progress = (intake / dailyGoal) * 100;
    if (progress >= 100) return 'Great job! Daily goal achieved! 🎉';
    if (progress >= 75) return 'Almost there! Keep going! 💪';
    if (progress >= 50) return 'Halfway there! Stay hydrated! 💧';
    if (progress >= 25) return 'Good start! Keep drinking! 👍';
    return 'Start hydrating! 💧';
  };

  return (
    <div className="water-tracker">
      <div className="water-tracker-header">
        <h3>Water Intake</h3>
        <div className="progress-status">
          <span className="progress-message">{getProgressMessage()}</span>
        </div>
      </div>

      <div className="water-stats">
        <div className="water-amount">
          <span className="current">{intake}</span>
          <span className="separator">/</span>
          <span className="goal">{dailyGoal}</span>
          <span className="unit">ml</span>
        </div>
        <div className="remaining-info">
          {getRemainingWater() > 0 ? (
            <span>Remaining: {getRemainingWater()}ml</span>
          ) : (
            <span className="goal-reached">Daily Goal Reached!</span>
          )}
        </div>
      </div>

      <div className="water-progress-container">
        <div className="water-progress">
          <div 
            className="water-progress-fill"
            style={{ 
              width: `${calculateProgress()}%`,
              backgroundColor: getProgressColor()
            }}
          >
            <div className="water-ripple"></div>
          </div>
        </div>
        <div className="progress-percentage">
          {Math.round((intake / dailyGoal) * 100)}%
        </div>
      </div>

      <div className="water-actions">
        <div className="quick-add-buttons">
          <button 
            onClick={() => handleAddWater(glassSize)} 
            className={`quick-add-btn glass ${isUpdating ? 'updating' : ''}`}
            disabled={isUpdating}
          >
            <span className="icon">🥤</span>
            <span className="amount">Glass</span>
            <span className="size">250ml</span>
          </button>
          <button 
            onClick={() => handleAddWater(bottleSize)} 
            className={`quick-add-btn bottle ${isUpdating ? 'updating' : ''}`}
            disabled={isUpdating}
          >
            <span className="icon">🍶</span>
            <span className="amount">Bottle</span>
            <span className="size">500ml</span>
          </button>
        </div>
      </div>

      {showFeedback && (
        <div className="water-feedback" style={{ backgroundColor: getProgressColor() }}>
          <span>+{showFeedback}ml added! 💧</span>
        </div>
      )}
    </div>
  );
}

export default WaterIntakeTracker;