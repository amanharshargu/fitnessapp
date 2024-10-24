import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserDetails } from '../../contexts/UserDetailsContext';
import UserProfileCard from './UserProfileCard';
import CardioSpinner from '../common/CardioSpinner';
import '../../styles/ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();
  const { fetchUserDetails, error } = useUserDetails();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserDetails = async () => {
      setLoading(true);
      await fetchUserDetails();
      setLoading(false);
    };
    loadUserDetails();
  }, [fetchUserDetails]);

  if (loading || !user) {
    return (
      <div className="profile-page-container">
        <div className="profile-content loading">
          <CardioSpinner size="50" color="#007bff" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page-container">
        <div className="profile-content">
          <div>Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      <div className="profile-content">
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
            <UserProfileCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
