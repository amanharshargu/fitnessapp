import React, {
  createContext, useState, useContext, useEffect,
  useMemo,
} from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
let inMemoryToken = null;

const getStoredToken = () => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.warn('Unable to access localStorage, using in-memory storage');
    return inMemoryToken;
  }
};

const setStoredToken = (token) => {
  try {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  } catch (error) {
    console.warn('Unable to access localStorage, using in-memory storage');
    inMemoryToken = token;
  }
};

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    try {
      const response = await api.post(
        '/auth/login',
        { email, password },
        {
          withCredentials: true,
        },
      );
      const { token: newToken, user: newUser } = response.data;
      setStoredToken(newToken);
      setToken(newToken);
      setUser(newUser);
      setIsLoggedIn(true);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setStoredToken(null);
      setToken(null);
      setIsLoggedIn(false);
      setUser(null);
      delete api.defaults.headers.common.Authorization;
    }
  };

  const signup = async (signupData) => {
    try {
      const response = await api.post('/auth/register', signupData);
      const { token: newToken, user: newUser } = response.data;
      setStoredToken(newToken);
      setToken(newToken);
      setUser(newUser);
      setIsLoggedIn(true);
      return response.data;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const updateUserDetails = async (userDetails) => {
    try {
      const response = await api.put('/users/update', userDetails, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      if (response.data && response.data.user) {
        setUser(response.data.user);
      }

      return response.data;
    } catch (error) {
      console.error('Error updating user details:', error);
      throw error;
    }
  };

  const checkAuth = async () => {
    if (token) {
      try {
        const response = await api.get('/auth/check');
        setUser(response.data.user);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Token invalid:', error);
        logout();
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      setIsLoggedIn(true);
    } else {
      delete api.defaults.headers.common.Authorization;
      setIsLoggedIn(false);
    }
    checkAuth(); // Ensure checkAuth is called once the token is set/changed
  }, [token]); // Only run when token changes

  const handleOAuthCallback = async (token) => {
    setStoredToken(token);
    setToken(token);
    setIsLoggedIn(true);
    await checkAuth();
  };

  const contextValue = useMemo(() => ({
    isLoggedIn, user, token, login, signup, logout, updateUserDetails, handleOAuthCallback,
  }), [token, isLoggedIn, user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
