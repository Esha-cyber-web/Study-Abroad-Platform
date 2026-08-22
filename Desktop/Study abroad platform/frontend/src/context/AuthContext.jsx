import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Page refresh hone par sab se pehle localStorage se user retrieve hoga
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  const login = useCallback((userData, authToken) => {
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData)); // LocalStorage mein user data save
    setToken(authToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // LocalStorage clear
    setToken(null);
    setUser(null);
  }, []);

  // Restore session on page refresh
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('token');

      if (!savedToken) { 
        setLoading(false); 
        return; 
      }

      try {
        const res = await api.get('/auth/profile');
        
        // Response key check karein (res.data.data ya res.data.user)
        const updatedUser = res.data.data || res.data.user || res.data;
        
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setToken(savedToken);
      } catch (err) {
        // Token invalid hone par reset
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);