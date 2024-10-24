import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserDetails } from '../../contexts/UserDetailsContext';
import UserProfileCard from './UserProfileCard';
import CardioSpinner from '../common/CardioSpinner';
import '../../styles/ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();
  const { fetchUserDetails, userDetails, uploadPhoto, error } = useUserDetails();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadUserDetails = async () => {
      setLoading(true);
      await fetchUserDetails();
      setLoading(false);
    };
    loadUserDetails();
  }, [fetchUserDetails]);

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploading(true);
      try {
        await uploadPhoto(file);
      } catch (error) {
        console.error("Error uploading photo:", error);
      } finally {
        setUploading(false);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

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
            {uploading ? (
              <div className="photo-placeholder">
                <CardioSpinner size="30" color="#007bff" />
              </div>
            ) : userDetails.photo ? (
              <img src={userDetails.photo} alt={user.username} className="profile-photo" onClick={triggerFileInput} />
            ) : (
              <div className="photo-placeholder" onClick={triggerFileInput}>
                <span>Click to upload photo</span>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoUpload} 
              style={{ display: 'none' }} 
              accept="image/*"
            />
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
