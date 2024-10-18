import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useUserDetails } from "../../contexts/UserDetailsContext";
import { useLocation } from "react-router-dom";
import UserProfileCard from "./UserProfileCard";
import WeeklyCalorieTracker from "./WeeklyCalorieTracker";
import DailyCalorieGoal from "./DailyCalorieGoal";
import ContentWrapper from "../layout/ContentWrapper";
import api from "../../services/api";
import "../../styles/Dashboard.css";

function Dashboard({ onSetUserDetails }) {
  const { user } = useAuth();
  const { fetchUserDetails, userDetails, fetchDailyCalorieGoal } = useUserDetails();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);

  const loadUserDetails = useCallback(async () => {
    try {
      await fetchUserDetails();
      await fetchDailyCalorieGoal();
      setLoading(false);
      setRefreshKey(prevKey => prevKey + 1);
    } catch (err) {
      console.error("Failed to fetch user details:", err);
      setError("Failed to load user details. Please try again.");
      setLoading(false);
    }
  }, [fetchUserDetails, fetchDailyCalorieGoal]);

  useEffect(() => {
    loadUserDetails();
  }, [loadUserDetails, location.state?.refresh]);

  const handleDishesChanged = useCallback(() => {
    loadUserDetails();
  }, [loadUserDetails]);

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
                <div className="dashboard-column">
                  <UserProfileCard
                    userDetails={userDetails}
                    user={user}
                    onSetUserDetails={onSetUserDetails}
                  />
                </div>
                <div className="dashboard-column">
                  <DailyCalorieGoal 
                    key={refreshKey}
                    onDishesChanged={handleDishesChanged}
                  />
                </div>
                <div className="dashboard-column">
                  <WeeklyCalorieTracker key={refreshKey} />
                </div>
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
