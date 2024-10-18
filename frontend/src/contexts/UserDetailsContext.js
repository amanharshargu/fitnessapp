import React, { createContext, useContext, useState, useCallback } from "react";
import api from "../services/api";

const UserDetailsContext = createContext();

export function useUserDetails() {
  return useContext(UserDetailsContext);
}

export function UserDetailsProvider({ children }) {
  const [userDetails, setUserDetails] = useState({});
  const [tempUserDetails, setTempUserDetails] = useState({
    weight: "",
    height: "",
    age: "",
    gender: "",
    goal: "",
    activityLevel: "",
  });

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
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user details:", error);
      throw error;
    }
  }, []);

  const value = {
    userDetails,
    updateUserDetails,
    fetchUserDetails,
    tempUserDetails,
    updateTempUserDetails,
  };

  return (
    <UserDetailsContext.Provider value={value}>
      {children}
    </UserDetailsContext.Provider>
  );
}
