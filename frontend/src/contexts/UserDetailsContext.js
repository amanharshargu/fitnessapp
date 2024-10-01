import React, { createContext, useContext, useState, useCallback } from "react";
import api from "../services/api";

const UserDetailsContext = createContext();

export function useUserDetails() {
  return useContext(UserDetailsContext);
}

export function UserDetailsProvider({ children }) {
  const [userDetails, setUserDetails] = useState({
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
  };

  return (
    <UserDetailsContext.Provider value={value}>
      {children}
    </UserDetailsContext.Provider>
  );
}
