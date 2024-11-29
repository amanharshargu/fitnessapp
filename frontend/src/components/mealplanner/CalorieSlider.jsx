import React from 'react';
import Slider from 'react-slider';
import '../../styles/CalorieSlider.css';

const CalorieSlider = ({ label, min, max, value, onChange }) => {
  return (
    <div className={`calorie-slider ${label==='Lunch' || label==='Daily Total'?'jpg':''}`}>
      <div className="slider-header">
        <h5>{label}</h5>
        <div className="range-display">
          <input
            type="number"
            value={value.min}
            onChange={(e) => onChange({ ...value, min: parseInt(e.target.value) })}
            min={min}
            max={value.max}
          />
          <span> - </span>
          <input
            type="number"
            value={value.max}
            onChange={(e) => onChange({ ...value, max: parseInt(e.target.value) })}
            min={value.min}
            max={max}
          />
        </div>
      </div>
      <Slider
        className="slider"
        thumbClassName="thumb"
        trackClassName="track"
        value={[value.min, value.max]}
        onChange={([newMin, newMax]) => onChange({ min: newMin, max: newMax })}
        min={min}
        max={max}
        pearling
        minDistance={10}
      />
    </div>
  );
};

export default CalorieSlider;