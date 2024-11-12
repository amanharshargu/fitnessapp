import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useUserDetails } from "../../contexts/UserDetailsContext";
import WeeklyCalorieTracker from "./WeeklyCalorieTracker";
import DailyCalorieGoal from "./DailyCalorieGoal";
import ContentWrapper from "../layout/ContentWrapper";
import api from "../../services/api";
import WaterIntakeTracker from './WaterIntakeTracker';
import DailyMotivation from './DailyMotivation';
import "../../styles/Dashboard.css";

function Dashboard({ userDetailsVersion }) {
  const { user } = useAuth();
  const { fetchUserDetails, userDetails } = useUserDetails();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [waterIntake, setWaterIntake] = useState(0);

  const loadUserDetails = useCallback(async () => {
    try {
      await fetchUserDetails();
    } catch (err) {
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
      setError("Failed to load weekly calorie data. Please try again.");
    }
  }, []);

  const fetchWaterIntake = useCallback(async () => {
    try {
      const response = await api.get('/dashboard/water-intake');
      setWaterIntake(response.data.intake);
    } catch (error) {
      console.error('Error fetching water intake:', error);
    }
  }, []);

  useEffect(() => {
    loadUserDetails();
    fetchWeeklyData();
    fetchWaterIntake();
  }, [loadUserDetails, fetchWeeklyData, fetchWaterIntake, userDetailsVersion]);

  if (loading) return <div className="loading-message">Loading user details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!user) return <p>User data not available.</p>;

  return (
    <ContentWrapper>
      <div className="dashboard-container">
        <div className="dashboard-grid">
          <div className="dashboard-item motivation">
            <DailyMotivation />
          </div>
          <div className="dashboard-item calories">
            <DailyCalorieGoal 
              key={`calorie-goal-${userDetailsVersion}`} 
              userDetails={userDetails} 
              onDishesChanged={fetchWeeklyData}
            />
          </div>
          <div className="dashboard-item water">
            <WaterIntakeTracker 
              intake={waterIntake} 
              onUpdate={fetchWaterIntake}
            />
          </div>
          <div className="dashboard-item overview">
            <WeeklyCalorieTracker 
              key={`calorie-tracker-${userDetailsVersion}`} 
              weeklyData={weeklyData}
            />
          </div>
        </div>
      </div>
    </ContentWrapper>
  );
}

export default Dashboard;
