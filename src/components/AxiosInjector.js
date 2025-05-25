'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSnackbarUtils } from '@/context/SnackbarContext';
import { injectAxiosUtils } from '@/utils/axios';

export default function AxiosInjector() {
  const { logout } = useAuth();
  const { notify } = useSnackbarUtils();
  const router = useRouter();

  useEffect(() => {
    injectAxiosUtils({ logout, notify, router });
  }, [logout, notify, router]);

  return null;
}