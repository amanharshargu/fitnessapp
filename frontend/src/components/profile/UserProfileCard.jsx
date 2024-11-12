import React, { useState, useCallback, useEffect, useRef } from "react";
import { useUserDetails } from "../../contexts/UserDetailsContext";
import { useAuth } from "../../contexts/AuthContext";
import CardioSpinner from '../common/CardioSpinner';
import "../../styles/UserProfileCard.css";

function UserProfileCard() {
  const { userDetails, tempUserDetails, updateTempUserDetails, isLoading, fetchUserDetails } = useUserDetails();
  const { user, updateUserDetails: updateAuthUserDetails } = useAuth();
  const [editingField, setEditingField] = useState(null);
  const [error, setError] = useState("");
  const [localUserDetails, setLocalUserDetails] = useState(userDetails);

  useEffect(() => {
    if (!userDetails || Object.keys(userDetails).length === 0) {
      fetchUserDetails();
    }
  }, [fetchUserDetails, userDetails]);

  useEffect(() => {
    if (userDetails && Object.keys(userDetails).length > 0) {
      setLocalUserDetails(userDetails);
    }
  }, [userDetails]);

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal weight";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateTempUserDetails({ [name]: value });
  };

  const handleEditField = (field) => {
    setEditingField(field);
    updateTempUserDetails({ [field]: userDetails[field] });
  };

  const validateField = (field, value) => {
    if (field === "weight" || field === "height" || field === "age") {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} must be a positive number.`;
      }
    }
    return null;
  };

  const handleSaveField = useCallback(async (field) => {
    setError("");
    const validationError = validateField(field, tempUserDetails[field]);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await updateAuthUserDetails({ [field]: tempUserDetails[field] });
      setEditingField(null);
      setLocalUserDetails(prevDetails => ({
        ...prevDetails,
        [field]: tempUserDetails[field]
      }));
      fetchUserDetails();
    } catch (error) {
      console.error("Updating user details failed:", error);
      setError("Failed to update user details. Please try again.");
    }
  }, [tempUserDetails, updateAuthUserDetails, fetchUserDetails]);

  const handleKeyPress = (e, field) => {
    if (e.key === 'Enter') {
      handleSaveField(field);
    }
  };

  const formatDisplayValue = (value) => {
    if (!value) return "Not set";
    if (typeof value === 'string') {
      if (value.includes('Active')) {
        return value.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase()).trim();
      }
      return value
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return value;
  };

  const renderEditableField = (field, label, options = null, step = null, min = null) => {
    const isEditing = editingField === field;
    const value = isEditing ? tempUserDetails[field] : userDetails[field];

    return (
      <div className="editable-field" onClick={() => !isEditing && handleEditField(field)}>
        <strong>{label}:</strong>
        {isEditing ? (
          <div className="edit-input">
            {options ? (
              <select 
                ref={selectRef}
                name={field} 
                value={value || ""} 
                onChange={handleInputChange}
                onKeyPress={(e) => handleKeyPress(e, field)}
                className="wide-dropdown"
                autoFocus
              >
                <option value="">Select {label.toLowerCase()}</option>
                {options.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                name={field}
                value={value || ""}
                onChange={handleInputChange}
                onKeyPress={(e) => handleKeyPress(e, field)}
                step={step}
                min={min}
                autoFocus
              />
            )}
            <button onClick={() => handleSaveField(field)}>Save</button>
          </div>
        ) : (
          <div className="display-value">
            <span>{formatDisplayValue(value)}</span>
          </div>
        )}
      </div>
    );
  };

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" }
  ];

  const goalOptions = [
    { value: "lose_weight", label: "Lose Weight" },
    { value: "gain_weight", label: "Gain Weight" },
    { value: "maintain_weight", label: "Maintain Weight" }
  ];

  const activityLevelOptions = [
    { value: "sedentary", label: "Sedentary" },
    { value: "lightlyActive", label: "Lightly Active" },
    { value: "moderatelyActive", label: "Moderately Active" },
    { value: "veryActive", label: "Very Active" },
    { value: "extraActive", label: "Extra Active" }
  ];

  const bmi = calculateBMI(localUserDetails.weight, localUserDetails.height);
  const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null;

  const selectRef = useRef(null);

  useEffect(() => {
    if (editingField && selectRef.current) {
      selectRef.current.focus();
      selectRef.current.click();
    }
  }, [editingField]);

  if (isLoading || !user || !userDetails) {
    return (
      <div className="user-profile-card loading">
        <CardioSpinner size="50" color="#007bff" />
      </div>
    );
  }

  return (
    <div className="user-profile-card">
      <h3>User Profile</h3>
      {error && <p className="error">{error}</p>}
      <div className="user-info">
        <div className="non-editable-fields">
          <div className="non-editable-field">
            <strong>Username:</strong>
            <span>{user?.username || 'Not set'}</span>
          </div>
          <div className="non-editable-field">
            <strong>Email:</strong>
            <span>{user?.email || 'Not set'}</span>
          </div>
        </div>
        {renderEditableField("weight", "Weight (kg)", null, 1, 0)}
        {renderEditableField("height", "Height (cm)", null, 1, 0)}
        {renderEditableField("age", "Age", null, 1, 0)}
        {renderEditableField("gender", "Gender", genderOptions)}
        {renderEditableField("goal", "Goal", goalOptions)}
        {renderEditableField("activityLevel", "Activity Level", activityLevelOptions)}
        <div className="bmi-info">
          <strong>BMI:</strong> {bmi ? `${bmi} (${bmiCategory})` : "Not available"}
        </div>
      </div>
    </div>
  );
}

export default React.memo(UserProfileCard);
