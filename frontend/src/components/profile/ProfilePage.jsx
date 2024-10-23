import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserDetails } from '../../contexts/UserDetailsContext';
import '../../styles/ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();
  const { userDetails, fetchUserDetails, updateUserDetails } = useUserDetails();
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState({});

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedDetails(userDetails);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedDetails({});
  };

  const handleChange = (e) => {
    setEditedDetails({ ...editedDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserDetails(editedDetails);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="profile-page-container">
      <div className="profile-page">
        <h1>My Profile</h1>
        <div className="profile-content">
          <div className="profile-photo">
            <img src={user.photo || 'default-avatar.png'} alt={user.username} />
          </div>
          <div className="profile-details">
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="username"
                  value={editedDetails.username || ''}
                  onChange={handleChange}
                  placeholder="Username"
                />
                <input
                  type="number"
                  name="age"
                  value={editedDetails.age || ''}
                  onChange={handleChange}
                  placeholder="Age"
                />
                <input
                  type="number"
                  name="weight"
                  value={editedDetails.weight || ''}
                  onChange={handleChange}
                  placeholder="Weight (kg)"
                />
                <input
                  type="number"
                  name="height"
                  value={editedDetails.height || ''}
                  onChange={handleChange}
                  placeholder="Height (cm)"
                />
                <select
                  name="gender"
                  value={editedDetails.gender || ''}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <select
                  name="goal"
                  value={editedDetails.goal || ''}
                  onChange={handleChange}
                >
                  <option value="">Select Goal</option>
                  <option value="lose_weight">Lose Weight</option>
                  <option value="maintain_weight">Maintain Weight</option>
                  <option value="gain_weight">Gain Weight</option>
                </select>
                <select
                  name="activityLevel"
                  value={editedDetails.activityLevel || ''}
                  onChange={handleChange}
                >
                  <option value="">Select Activity Level</option>
                  <option value="sedentary">Sedentary</option>
                  <option value="lightlyActive">Lightly Active</option>
                  <option value="moderatelyActive">Moderately Active</option>
                  <option value="veryActive">Very Active</option>
                  <option value="extraActive">Extra Active</option>
                </select>
                <div className="profile-actions">
                  <button type="submit">Save</button>
                  <button type="button" onClick={handleCancel}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <p><strong>Username:</strong> {userDetails.username}</p>
                <p><strong>Email:</strong> {userDetails.email}</p>
                <p><strong>Age:</strong> {userDetails.age}</p>
                <p><strong>Weight:</strong> {userDetails.weight} kg</p>
                <p><strong>Height:</strong> {userDetails.height} cm</p>
                <p><strong>Gender:</strong> {userDetails.gender}</p>
                <p><strong>Goal:</strong> {userDetails.goal}</p>
                <p><strong>Activity Level:</strong> {userDetails.activityLevel}</p>
                <div className="profile-actions">
                  <button onClick={handleEdit}>Edit Profile</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
