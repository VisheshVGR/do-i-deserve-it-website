'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import api from '@/utils/axios';

const AuthContext = createContext();
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cookies, removeCookie] = useCookies(['firebaseToken']);

  useEffect(() => {
    const fetchUser = async () => {
      const token = cookies.firebaseToken;
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
        removeCookie('firebaseToken');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [cookies.firebaseToken, removeCookie]);

  const login = () => {
    window.location.href = `${BASE_URL}auth/google`;
  };

  const logout = () => {
    setUser(null);
    removeCookie('firebaseToken');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
