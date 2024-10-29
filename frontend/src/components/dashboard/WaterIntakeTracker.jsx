import React, { useState } from 'react';
import api from '../../services/api';
import '../../styles/WaterIntakeTracker.css';

function WaterIntakeTracker({ intake, onUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const dailyGoal = 2000;
  const glassSize = 250;

  const handleAddGlass = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await api.post('/dashboard/water-intake', { amount: glassSize });
      onUpdate();
      showSuccessFeedback();
    } catch (error) {
      console.error('Error updating water intake:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const showSuccessFeedback = () => {
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 1500);
  };

  const calculateProgress = () => {
    return Math.min((intake / dailyGoal) * 100, 100);
  };

  return (
    <div className="water-tracker">
      <div className="water-tracker-header">
        <h3>Water Intake</h3>
        <button 
          onClick={handleAddGlass} 
          className={`add-water-btn ${isUpdating ? 'updating' : ''}`}
          disabled={isUpdating}
        >
          {isUpdating ? 'Adding...' : '+ Add Glass'}
        </button>
      </div>

      <div className="water-stats">
        <div className="water-amount">
          <span className="current">{intake}</span>
          <span className="separator">/</span>
          <span className="goal">{dailyGoal}</span>
          <span className="unit">ml</span>
        </div>
        <div className="glasses-info">
          {Math.floor(intake / glassSize)} of {Math.ceil(dailyGoal / glassSize)} glasses
        </div>
      </div>

      <div className="water-progress">
        <div 
          className="water-progress-fill"
          style={{ width: `${calculateProgress()}%` }}
        >
          <div className="water-ripple"></div>
        </div>
      </div>

      {showFeedback && (
        <div className="water-feedback">
          <span>+250ml added! 💧</span>
        </div>
      )}
    </div>
  );
}

export default WaterIntakeTracker;