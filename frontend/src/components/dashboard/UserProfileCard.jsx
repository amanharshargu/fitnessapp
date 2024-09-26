import React from "react";
import "../../styles/UserProfileCard.css";

function UserProfileCard({ userDetails, user, onSetUserDetails }) {
  const handleSetUserDetails = async () => {
    onSetUserDetails();
  };

  return (
    <div className="user-profile-card">
      <h3>User Profile</h3>
      <div className="user-info">
        <p>
          <strong>Username:</strong> {userDetails.username || user.username}
        </p>
        <p>
          <strong>Email:</strong> {userDetails.email || user.email}
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
      </div>
      <button className="set-details-btn" onClick={handleSetUserDetails}>
        Set User Details
      </button>
    </div>
  );
}

export default UserProfileCard;
