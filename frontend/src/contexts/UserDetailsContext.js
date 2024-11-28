import React, { createContext, useContext, useCallback, useMemo, useReducer } from "react";
import api from "../services/api";

const UserDetailsContext = createContext();

const initialState = {
  userDetails: {},
  tempUserDetails: {
    weight: "",
    height: "",
    age: "",
    gender: "",
    goal: "",
    activityLevel: "",
    photo: "",
  }
};

function userDetailsReducer(state, action) {
  switch (action.type) {
    case 'SET_USER_DETAILS':
      return { ...state, userDetails: action.payload };
    case 'SET_TEMP_DETAILS':
      return { ...state, tempUserDetails: action.payload };
    case 'UPDATE_TEMP_DETAILS':
      return {
        ...state,
        tempUserDetails: {
          ...state.tempUserDetails,
          ...action.payload
        }
      };
    default:
      return state;
  }
}

export function UserDetailsProvider({ children }) {
  const [state, dispatch] = useReducer(userDetailsReducer, initialState);

  const formatUserDetails = useCallback((details) => ({
    ...details,
    weight: String(details.weight || ''),
    height: String(details.height || ''),
    age: String(details.age || ''),
    photo: details.photo || '',
  }), []);

  const fetchUserDetails = useCallback(async () => {
    try {
      const response = await api.get("/dashboard/user-details");
      if (response.data) {
        const formattedDetails = formatUserDetails(response.data);
        dispatch({ type: 'SET_USER_DETAILS', payload: formattedDetails });
        dispatch({ type: 'SET_TEMP_DETAILS', payload: formattedDetails });
        return formattedDetails;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user details:", error);
      throw error;
    }
  }, [formatUserDetails]);

  const uploadPhoto = useCallback(async (file) => {
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await api.post("/users/upload-photo", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.message === "Photo uploaded successfully") {
        await fetchUserDetails();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error uploading photo:", error);
      throw error;
    }
  }, [fetchUserDetails]);

  const value = useMemo(() => ({
    userDetails: state.userDetails,
    tempUserDetails: state.tempUserDetails,
    updateUserDetails: (details) => dispatch({ type: 'SET_USER_DETAILS', payload: details }),
    updateTempUserDetails: (details) => dispatch({ type: 'UPDATE_TEMP_DETAILS', payload: details }),
    fetchUserDetails,
    uploadPhoto,
  }), [state.userDetails, state.tempUserDetails, fetchUserDetails, uploadPhoto]);

  return (
    <UserDetailsContext.Provider value={value}>
      {children}
    </UserDetailsContext.Provider>
  );
}

export function useUserDetails() {
  const context = useContext(UserDetailsContext);
  if (!context) {
    throw new Error("useUserDetails must be used within a UserDetailsProvider");
  }
  return context;
}
