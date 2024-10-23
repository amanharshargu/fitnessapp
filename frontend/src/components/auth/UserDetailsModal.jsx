import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useUserDetails } from "../../contexts/UserDetailsContext";
import CardioSpinner from '../common/CardioSpinner';
import "../../styles/UserDetailsModal.css";

function UserDetailsModal({ show, onClose, onDetailsSubmitted }) {
  const { updateUserDetails: updateAuthUserDetails } = useAuth();
  const { userDetails, tempUserDetails, updateTempUserDetails } = useUserDetails();
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateTempUserDetails({ [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const weight = parseFloat(tempUserDetails.weight);
    const height = parseFloat(tempUserDetails.height);
    const age = parseInt(tempUserDetails.age, 10);

    if ((tempUserDetails.weight !== "" && (isNaN(weight) || weight <= 0)) ||
        (tempUserDetails.height !== "" && (isNaN(height) || height <= 0)) ||
        (tempUserDetails.age !== "" && (isNaN(age) || age <= 0))) {
      setError("Weight, height, and age must be positive numbers when provided.");
      setIsLoading(false);
      return;
    }

    try {
      await updateAuthUserDetails(tempUserDetails);
      onClose();
      if (onDetailsSubmitted) {
        onDetailsSubmitted();
      }
      navigate("/profile");  // Changed from "/dashboard" to "/profile"
    } catch (error) {
      console.error("Updating user details failed:", error);
      setError("Failed to update user details. Please try again.");
    }

    setIsLoading(false);
  };

  const getInputValue = (field) => {
    return tempUserDetails[field] !== undefined ? tempUserDetails[field] : userDetails[field] || "";
  };

  const renderNumberInput = (name, label, step = 1, min = 0) => (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input
        type="number"
        id={name}
        name={name}
        value={getInputValue(name)}
        onChange={handleInputChange}
        step={step}
        min={min}
      />
    </div>
  );

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Additional Details</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          {renderNumberInput("weight", "Weight (kg)", 0.5)}
          {renderNumberInput("height", "Height (cm)", 1)}
          {renderNumberInput("age", "Age", 1)}
          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={getInputValue("gender")}
              onChange={handleInputChange}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="goal">Goal</label>
            <select
              id="goal"
              name="goal"
              value={getInputValue("goal")}
              onChange={handleInputChange}
            >
              <option value="">Select goal</option>
              <option value="lose_weight">Lose Weight</option>
              <option value="gain_weight">Gain Weight</option>
              <option value="maintain_weight">Maintain Weight</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="activityLevel">Activity Level</label>
            <select
              id="activityLevel"
              name="activityLevel"
              value={getInputValue("activityLevel")}
              onChange={handleInputChange}
            >
              <option value="">Select activity level</option>
              <option value="sedentary">Sedentary</option>
              <option value="lightlyActive">Lightly Active</option>
              <option value="moderatelyActive">Moderately Active</option>
              <option value="veryActive">Very Active</option>
              <option value="extraActive">Extra Active</option>
            </select>
          </div>
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? <CardioSpinner size="20" color="#ffffff" /> : 'Update Details'}
          </button>
        </form>
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
      </div>
    </div>
  );
}

export default UserDetailsModal;
