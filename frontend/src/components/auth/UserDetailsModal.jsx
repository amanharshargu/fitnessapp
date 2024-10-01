import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useUserDetails } from "../../contexts/UserDetailsContext";
import "../../styles/UserDetailsModal.css";

function UserDetailsModal({ show, onClose, onDetailsSubmitted }) {
  const { user, updateUserDetails: updateAuthUserDetails } = useAuth();
  const { userDetails, updateUserDetails } = useUserDetails();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      updateUserDetails({
        weight: user.weight || "",
        height: user.height || "",
        age: user.age || "",
        gender: user.gender || "",
        goal: user.goal || "",
        activityLevel: user.activityLevel || "",
      });
    }
  }, [user, updateUserDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateUserDetails({ [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await updateAuthUserDetails(userDetails);
      onClose();
      if (onDetailsSubmitted) {
        onDetailsSubmitted();
      }
      navigate("/dashboard");
    } catch (error) {
      console.error("Updating user details failed:", error);
      setError("Failed to update user details. Please try again.");
    }
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
              value={userDetails.weight}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="height">Height (cm)</label>
            <input
              type="number"
              id="height"
              name="height"
              value={userDetails.height}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              type="number"
              id="age"
              name="age"
              value={userDetails.age}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={userDetails.gender}
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
              value={userDetails.goal}
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
              value={userDetails.activityLevel}
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
          <button type="submit" className="submit-btn">
            Update Details
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
