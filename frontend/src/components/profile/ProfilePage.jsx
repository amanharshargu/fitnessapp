import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserDetails } from '../../contexts/UserDetailsContext';
import UserProfileCard from '../dashboard/UserProfileCard';
import UserDetailsModal from '../auth/UserDetailsModal';
import '../../styles/ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();
  const { fetchUserDetails } = useUserDetails();
  const [showModal, setShowModal] = useState(false);

  const handleSetUserDetails = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleDetailsSubmitted = () => {
    fetchUserDetails();
    setShowModal(false);
  };

  return (
    <div className="profile-page-container">
      <div className="profile-content">
        <h1>My Profile</h1>
        <div className="profile-layout">
          <div className="profile-photo-container">
            {user.photo ? (
              <img src={user.photo} alt={user.username} className="profile-photo" />
            ) : (
              <div className="photo-placeholder">
                <span>No photo available</span>
              </div>
            )}
          </div>
          <div className="profile-details">
            <UserProfileCard onSetUserDetails={handleSetUserDetails} />
          </div>
        </div>
      </div>
      <UserDetailsModal
        show={showModal}
        onClose={handleCloseModal}
        onDetailsSubmitted={handleDetailsSubmitted}
      />
    </div>
  );
};

export default ProfilePage;
