'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import api from '@/utils/axios';

const AuthContext = createContext();
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cookies, _, removeCookie] = useCookies(['firebaseToken']);

  useEffect(() => {
    const fetchUser = async () => {
      const token = cookies.firebaseToken;
      // console.log ("TokenIn", cookies, token);
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        // console.log ("UserUpdated");
      } catch (error) {
        console.error('Error fetching user:', error);
        removeCookie('firebaseToken', { path: '/' });
        // console.log("REMOVED TOKEN");
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
        // console.log("REMOVED TOKEN");
        removeCookie('firebaseToken', { path: '/' });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
