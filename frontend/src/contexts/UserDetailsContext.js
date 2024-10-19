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
    setTempUserDetails((prevDetails) => {
      const updatedDetails = { ...prevDetails, ...newDetails };
      
      // Ensure weight, height, and age are always strings
      if ('weight' in newDetails) updatedDetails.weight = String(newDetails.weight);
      if ('height' in newDetails) updatedDetails.height = String(newDetails.height);
      if ('age' in newDetails) updatedDetails.age = String(newDetails.age);

      return updatedDetails;
    });
  }, []);

  const fetchUserDetails = useCallback(async () => {
    try {
      const response = await api.get("/dashboard/user-details");
      if (response.data) {
        const formattedDetails = {
          ...response.data,
          weight: String(response.data.weight || ''),
          height: String(response.data.height || ''),
          age: String(response.data.age || ''),
        };
        setUserDetails(formattedDetails);
        setTempUserDetails(formattedDetails);
        return formattedDetails;
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
