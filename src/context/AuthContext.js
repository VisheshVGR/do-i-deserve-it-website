'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCookies } from 'react-cookie';
import axios from 'axios';

const AuthContext = createContext();
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cookies, setCookie, removeCookie] = useCookies(['firebaseToken']);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = cookies.firebaseToken;
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL}users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log ("UserData:", response.data);
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
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
