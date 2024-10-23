import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useUserDetails } from "../../contexts/UserDetailsContext";
import WeeklyCalorieTracker from "./WeeklyCalorieTracker";
import DailyCalorieGoal from "./DailyCalorieGoal";
import ContentWrapper from "../layout/ContentWrapper";
import api from "../../services/api";
import "../../styles/Dashboard.css";

function Dashboard({ onSetUserDetails, userDetailsVersion }) {
  const { user } = useAuth();
  const { fetchUserDetails, userDetails } = useUserDetails();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);

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

  const fetchWeeklyData = useCallback(async () => {
    try {
      const response = await api.get('/dashboard/weekly-calorie-data');
      setWeeklyData(response.data);
    } catch (error) {
      console.error('Error fetching weekly calorie data:', error);
      setError("Failed to load weekly calorie data. Please try again.");
    }
  }, []);

  useEffect(() => {
    loadUserDetails();
    fetchWeeklyData();
  }, [loadUserDetails, fetchWeeklyData, userDetailsVersion]);

  const handleDishesChanged = useCallback(() => {
    fetchWeeklyData();
  }, [fetchWeeklyData]);

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
                  <DailyCalorieGoal 
                    key={`calorie-goal-${userDetailsVersion}`} 
                    userDetails={userDetails} 
                    onDishesChanged={handleDishesChanged}
                  />
                </div>
                <div className="dashboard-column">
                  <WeeklyCalorieTracker 
                    key={`calorie-tracker-${userDetailsVersion}`} 
                    weeklyData={weeklyData}
                  />
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
