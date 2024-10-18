import React from "react";
import { useUserDetails } from "../../contexts/UserDetailsContext";
import CardioSpinner from '../common/CardioSpinner';
import "../../styles/UserProfileCard.css";

function UserProfileCard({ onSetUserDetails }) {
  const { userDetails, isLoading } = useUserDetails();

  if (isLoading) {
    return (
      <div className="user-profile-card loading">
        <CardioSpinner size="50" color="#007bff" />
      </div>
    );
  }

  return (
    <div className="user-profile-card">
      <h3>User Profile</h3>
      <div className="user-info">
        <p>
          <strong>Username:</strong> {userDetails.username}
        </p>
        <p>
          <strong>Email:</strong> {userDetails.email}
        </p>
        <p>
          <strong>Weight:</strong>{" "}
          {userDetails.weight ? `${userDetails.weight} Kg` : "Not set"}
        </p>
        <p>
          <strong>Height:</strong>{" "}
          {userDetails.height ? `${userDetails.height} cm` : "Not set"}
        </p>
        <p>
          <strong>Age:</strong> {userDetails.age || "Not set"}
        </p>
        <p>
          <strong>Gender:</strong>{" "}
          {userDetails.gender
            ? userDetails.gender.charAt(0).toUpperCase() +
              userDetails.gender.slice(1)
            : "Not set"}
        </p>
        <p>
          <strong>Goal:</strong>{" "}
          {userDetails.goal
            ? userDetails.goal
                .replace("_", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())
            : "Not set"}
        </p>
        <p>
          <strong>Activity Level:</strong>{" "}
          {userDetails.activityLevel
            ? userDetails.activityLevel
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
            : "Not set"}
        </p>
      </div>
      <button className="set-details-btn" onClick={onSetUserDetails}>
        Set User Details
      </button>
    </div>
  );
}

export default UserProfileCard;
