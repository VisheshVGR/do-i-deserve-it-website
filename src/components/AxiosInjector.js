'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSnackbarUtils } from '@/context/SnackbarContext';
import { injectAxiosUtils } from '@/utils/axios';
import { useCookies } from 'react-cookie'; // Import useCookies

export default function AxiosInjector() {
  const { logout } = useAuth();
  const { notify } = useSnackbarUtils();
  const router = useRouter();
  const [cookies] = useCookies(['firebaseToken']); // Get cookies

  useEffect(() => {
    const getToken = () => cookies.firebaseToken; // Define a function to get the token
    injectAxiosUtils({ logout, notify, router, getToken });
  }, [logout, notify, router, cookies.firebaseToken]); // Add cookies.firebaseToken to dependencies

  return null;
}