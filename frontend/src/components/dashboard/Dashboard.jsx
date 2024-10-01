import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useUserDetails } from "../../contexts/UserDetailsContext";
import UserProfileCard from "./UserProfileCard";
import WeeklyCalorieTracker from "./WeeklyCalorieTracker";
import DailyCalorieGoal from "./DailyCalorieGoal";
import ContentWrapper from "../layout/ContentWrapper";
import "../../styles/Dashboard.css";

function Dashboard({ onSetUserDetails }) {
  const { user } = useAuth();
  const { fetchUserDetails, userDetails } = useUserDetails();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [key, setKey] = useState(0);

  const loadUserDetails = useCallback(async () => {
    try {
      await fetchUserDetails();
      setKey(prevKey => prevKey + 1);
    } catch (err) {
      console.error("Failed to fetch user details:", err);
      setError("Failed to load user details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [fetchUserDetails]);

  useEffect(() => {
    loadUserDetails();
  }, [loadUserDetails]);

  useEffect(() => {
    setKey(prevKey => prevKey + 1);
  }, [userDetails]);

  if (loading) {
    return <div className="loading-message">Loading user details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <ContentWrapper>
      <div className="dashboard-container">
        <div className="dashboard-grid">
          {user ? (
            <>
              <div className="dashboard-row">
                <UserProfileCard
                  key={`profile-${key}`}
                  userDetails={userDetails}
                  user={user}
                  onSetUserDetails={onSetUserDetails}
                />
                <DailyCalorieGoal key={`calorie-goal-${key}`} userDetails={userDetails} />
                <WeeklyCalorieTracker key={`calorie-tracker-${key}`} userDetails={userDetails} />
              </div>
            </>
          ) : (
            <p>User data not available.</p>
          )}
        </div>
      </div>
    </ContentWrapper>
  );
}

export default Dashboard;
