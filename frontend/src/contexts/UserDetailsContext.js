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
    photo: "",
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
          photo: response.data.photo || '',
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

  const uploadPhoto = useCallback(async (file) => {
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await api.post("/users/upload-photo", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.message === "Photo uploaded successfully") {
        // Fetch updated user details to get the new photo
        await fetchUserDetails();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error uploading photo:", error);
      throw error;
    }
  }, [fetchUserDetails]);

  const value = {
    userDetails,
    updateUserDetails,
    fetchUserDetails,
    tempUserDetails,
    updateTempUserDetails,
    uploadPhoto,
  };

  return (
    <UserDetailsContext.Provider value={value}>
      {children}
    </UserDetailsContext.Provider>
  );
}
