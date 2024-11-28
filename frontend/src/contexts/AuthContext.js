import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from "react";
import api from "../services/api";

const AuthContext = createContext(null);
let inMemoryToken = null;

const getStoredToken = () => {
  try {
    return localStorage.getItem("token");
  } catch (error) {
    console.warn("Unable to access localStorage, using in-memory storage");
    return inMemoryToken;
  }
};

const setStoredToken = (token) => {
  try {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  } catch (error) {
    console.warn("Unable to access localStorage, using in-memory storage");
    inMemoryToken = token;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    isLoggedIn: false,
    user: null,
    token: getStoredToken(),
    loading: true
  });

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateAuthHeaders = useCallback((token) => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, []);

  const checkAuth = useCallback(async () => {
    if (state.token) {
      try {
        const response = await api.get("/auth/check");
        updateState({
          user: response.data.user,
          isLoggedIn: true,
          loading: false
        });
      } catch (error) {
        console.error("Token invalid:", error);
        handleLogout();
      }
    } else {
      updateState({ loading: false });
    }
  }, [state.token]);

  useEffect(() => {
    updateAuthHeaders(state.token);
    updateState({ isLoggedIn: !!state.token });
    checkAuth();
  }, [state.token, updateAuthHeaders, checkAuth]);

  const handleLogin = useCallback(async (email, password) => {
    try {
      const response = await api.post(
        "/auth/login",
        { email, password },
        { withCredentials: true }
      );
      const { token: newToken, user: newUser } = response.data;
      setStoredToken(newToken);
      updateState({
        token: newToken,
        user: newUser,
        isLoggedIn: true
      });
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setStoredToken(null);
      updateState({
        token: null,
        isLoggedIn: false,
        user: null
      });
      updateAuthHeaders(null);
    }
  }, [updateAuthHeaders]);

  const handleSignup = useCallback(async (signupData) => {
    try {
      const response = await api.post("/auth/register", signupData);
      const { token: newToken, user: newUser } = response.data;
      setStoredToken(newToken);
      updateState({
        token: newToken,
        user: newUser,
        isLoggedIn: true
      });
      return response.data;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  }, []);

  const handleUpdateUserDetails = useCallback(async (userDetails) => {
    try {
      const response = await api.put("/users/update", userDetails, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token}`,
        },
        withCredentials: true,
      });

      if (response.data?.user) {
        updateState({ user: response.data.user });
      }
      return response.data;
    } catch (error) {
      console.error("Error updating user details:", error);
      throw error;
    }
  }, [state.token]);

  const handleOAuthCallback = useCallback(async (token) => {
    setStoredToken(token);
    updateState({ token, isLoggedIn: true });
    await checkAuth();
  }, [checkAuth]);

  const value = useMemo(() => ({
    isLoggedIn: state.isLoggedIn,
    user: state.user,
    token: state.token,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    updateUserDetails: handleUpdateUserDetails,
    handleOAuthCallback
  }), [
    state.isLoggedIn,
    state.user,
    state.token,
    handleLogin,
    handleSignup,
    handleLogout,
    handleUpdateUserDetails,
    handleOAuthCallback
  ]);

  if (state.loading) {
    return null; // Changed from div to null for better integration
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
