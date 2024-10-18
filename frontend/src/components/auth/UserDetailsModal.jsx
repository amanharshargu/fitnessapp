import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useUserDetails } from "../../contexts/UserDetailsContext";
import CardioSpinner from '../common/CardioSpinner';
import "../../styles/UserDetailsModal.css";

function UserDetailsModal({ show, onClose, onDetailsSubmitted }) {
  const { updateUserDetails: updateAuthUserDetails } = useAuth();
  const { userDetails, tempUserDetails, updateTempUserDetails, fetchUserDetails } = useUserDetails();
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (show) {
      fetchUserDetails(); // Fetch latest user details when modal is shown
    }
  }, [show, fetchUserDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "weight" || name === "height" || name === "age") {
      const numericValue = value.replace(/\D/g, '');
      updateTempUserDetails({ [name]: numericValue ? parseFloat(numericValue) : '' });
    } else {
      updateTempUserDetails({ [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const weight = tempUserDetails.weight;
    const height = tempUserDetails.height;
    const age = tempUserDetails.age;

    if (!weight || weight <= 0) {
      setError("Weight must be a positive number.");
      setIsLoading(false);
      return;
    }

    if (!height || height <= 0) {
      setError("Height must be a positive number.");
      setIsLoading(false);
      return;
    }

    if (!age || age <= 0) {
      setError("Age must be a positive integer.");
      setIsLoading(false);
      return;
    }

    try {
      await updateAuthUserDetails(tempUserDetails);
      onClose();
      if (onDetailsSubmitted) {
        onDetailsSubmitted();
      }
      // Navigate to dashboard with a unique key to force re-render
      navigate("/dashboard", { state: { refresh: Date.now() } });
    } catch (error) {
      console.error("Updating user details failed:", error);
      setError("Failed to update user details. Please try again.");
    }

    setIsLoading(false);
  };

  const getInputValue = (field) => {
    return tempUserDetails[field] !== undefined ? tempUserDetails[field] : userDetails[field] || "";
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Additional Details</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="weight">Weight (kg)</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={getInputValue("weight")}
              onChange={handleInputChange}
              min="1"
              step="0.1"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="height">Height (cm)</label>
            <input
              type="number"
              id="height"
              name="height"
              value={getInputValue("height")}
              onChange={handleInputChange}
              min="1"
              step="0.1"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              type="number"
              id="age"
              name="age"
              value={getInputValue("age")}
              onChange={handleInputChange}
              min="1"
              step="1"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={getInputValue("gender")}
              onChange={handleInputChange}
              required
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
              required
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
              required
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
