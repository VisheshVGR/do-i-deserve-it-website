'use client';

import { useAuth } from '@/context/AuthContext';
import { useSnackbarUtils } from '@/context/SnackbarContext';
import { useLoader } from '@/context/LoaderContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const withAuth = (WrappedComponent) => {
  const AuthenticatedComponent = (props) => {
    const { user, loading } = useAuth();
    const { notify } = useSnackbarUtils();
    const { showLoader, hideLoader } = useLoader();
    const router = useRouter();

    useEffect(() => {
      if (loading) {
        showLoader();
      } else {
        hideLoader();
        if (!user) {
          notify('Not Logged In', 'warning');
          router.push('/');
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, user]);

    if (loading || !user) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return AuthenticatedComponent;
};

export default withAuth;
