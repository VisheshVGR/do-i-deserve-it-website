'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCookies } from 'react-cookie';
import { auth } from '@/utils/firebase';
import { signInWithCustomToken } from 'firebase/auth';
import UniversalLoader from '@/components/UniversalLoader';

export default function Callback() {
  const router = useRouter();
  const [_, setCookie] = useCookies(['firebaseToken']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      // Extract the Firebase custom token from the query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      console.log('TOKEN:', token);

      if (token) {
        try {
          // Use the Firebase custom token to sign in
          const userCredential = await signInWithCustomToken(auth, token);

          // Get the Firebase ID token
          const firebaseToken = await userCredential.user.getIdToken();

          // Save the Firebase token in cookies
          setCookie('firebaseToken', firebaseToken, { path: '/' });

          // Save user details in local storage
          const { uid, email, displayName, photoURL } = userCredential.user;
          localStorage.setItem(
            'user',
            JSON.stringify({ uid, email, displayName, photoURL })
          );

          // Redirect to the dashboard
          router.push('/');
        } catch (error) {
          console.error('Error during Firebase authentication:', error);
          if (error.code === 'auth/invalid-custom-token') {
            console.error('The custom token format is incorrect.');
          } else if (error.code === 'auth/custom-token-mismatch') {
            console.error(
              'The custom token does not match the Firebase project.'
            );
          }
        }
      } else {
        console.error('Authentication failed: Missing token');
      }
      setLoading(false);
    };

    handleCallback();
  }, [setCookie, router]);

  return loading ? <UniversalLoader /> : <p>Logging in...</p>;
}
