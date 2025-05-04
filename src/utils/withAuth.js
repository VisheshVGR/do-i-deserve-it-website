'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation'; // Use `next/navigation` for client-side routing
import { useEffect } from 'react';

const withAuth = (WrappedComponent) => {
  const AuthenticatedComponent = (props) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/login'); // Redirect to login if not authenticated
      }
    }, [loading, user, router]);

    if (loading || !user) {
      return <p>Loading...</p>; // Show a loading state while checking authentication
    }

    return <WrappedComponent {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return AuthenticatedComponent;
};

export default withAuth;