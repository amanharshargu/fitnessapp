import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "../services/api";

const UserDetailsContext = createContext();

export function useUserDetails() {
  return useContext(UserDetailsContext);
}

export function UserDetailsProvider({ children }) {
  const [userDetails, setUserDetails] = useState({});
  const [tempUserDetails, setTempUserDetails] = useState({});
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(null);

  const updateUserDetails = useCallback((newDetails) => {
    setUserDetails((prevDetails) => ({ ...prevDetails, ...newDetails }));
  }, []);

  const updateTempUserDetails = useCallback((newDetails) => {
    setTempUserDetails((prevDetails) => ({ ...prevDetails, ...newDetails }));
  }, []);

  const fetchUserDetails = useCallback(async () => {
    try {
      const response = await api.get("/dashboard/user-details");
      if (response.data) {
        setUserDetails(response.data);
        setTempUserDetails(response.data); // Set tempUserDetails when fetching user details
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user details:", error);
      throw error;
    }
  }, []);

  const fetchDailyCalorieGoal = useCallback(async () => {
    try {
      const response = await api.get(`/dashboard/calorie-goal`);
      const data = response.data;
      setDailyCalorieGoal(data.dailyCalories || null);
    } catch (error) {
      console.error('Error fetching calorie goal:', error);
    }
  }, []);

  // Fetch user details when the context is first created
  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const value = {
    userDetails,
    updateUserDetails,
    fetchUserDetails,
    tempUserDetails,
    updateTempUserDetails,
    dailyCalorieGoal,
    fetchDailyCalorieGoal,
  };

  return (
    <UserDetailsContext.Provider value={value}>
      {children}
    </UserDetailsContext.Provider>
  );
}
