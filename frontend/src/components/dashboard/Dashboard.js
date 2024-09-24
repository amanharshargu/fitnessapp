import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useUserDetails } from "../../contexts/UserDetailsContext";
import UserProfileCard from "./UserProfileCard";
import WeeklyCalorieTracker from "./WeeklyCalorieTracker";
import WeeklyCalorieGoal from "./WeeklyCalorieGoal";
import MealPlanner from "./MealPlanner";
import "../../styles/dashboard.css";

function Dashboard({ onSetUserDetails }) {
  const { user } = useAuth();
  const { fetchUserDetails, userDetails } = useUserDetails();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUserDetails = useCallback(async () => {
    try {
      await fetchUserDetails();
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

  if (loading) {
    return <div className="loading-message">Loading user details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        <h2 className="dashboard-title">Dashboard</h2>
        <div className="dashboard-grid">
          {user ? (
            <>
              <div className="dashboard-row">
                <UserProfileCard userDetails={userDetails} user={user} onSetUserDetails={onSetUserDetails} />
                <WeeklyCalorieGoal userDetails={userDetails} />
                <WeeklyCalorieTracker userDetails={userDetails} />
              </div>
              <div className="dashboard-row">
                <MealPlanner />
              </div>
            </>
          ) : (
            <p>User data not available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
