import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import API from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketConnected = useRef(false); // Prevent multiple connections

  // Helper to connect Socket.io if not already connected
  const ensureSocketConnection = (userId) => {
    if (userId && !socketConnected.current) {
      connectSocket(userId);
      socketConnected.current = true;
      console.log(`Socket connected for user ${userId}`);
    }
  };

  // Helper to disconnect Socket.io
  const cleanupSocket = () => {
    if (socketConnected.current) {
      disconnectSocket();
      socketConnected.current = false;
      console.log('Socket disconnected');
    }
  };

  // Fetch user on initial load (if token exists)
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const res = await API.get('/auth/profile');
          setUser(res.data);
          ensureSocketConnection(res.data._id || res.data.id);
        } catch (err) {
          console.error('Failed to fetch user', err);
          localStorage.removeItem('accessToken');
        }
      }
      setLoading(false);
    };
    fetchUser();

    // Cleanup on unmount (e.g., page refresh or app closure)
    return () => {
      cleanupSocket();
    };
  }, []);

  // Login function
  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', res.data.accessToken);
    const loggedInUser = res.data.user;
    setUser(loggedInUser);
    ensureSocketConnection(loggedInUser.id);
  };

  // Register function
  const register = async (userData) => {
    const res = await API.post('/auth/register', userData);
    localStorage.setItem('accessToken', res.data.accessToken);
    const newUser = res.data.user;
    setUser(newUser);
    ensureSocketConnection(newUser.id);
  };

  // Logout function
  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (err) {
      console.error('Logout API error', err);
    }
    localStorage.removeItem('accessToken');
    setUser(null);
    cleanupSocket();
  };

  // Update profile
  const updateProfile = async (data) => {
    await API.put('/auth/profile', data);
    const userRes = await API.get('/auth/profile');
    setUser(userRes.data);
    // No need to reconnect socket; user ID unchanged
  };

  // Change password
  const changePassword = async (passwords) => {
    await API.put('/auth/change-password', passwords);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};