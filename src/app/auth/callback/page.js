'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCookies } from 'react-cookie';
import { auth } from '@/utils/firebase';
import { signInWithCustomToken } from 'firebase/auth';

export default function Callback() {
  const router = useRouter();
  const [_, setCookie] = useCookies(['firebaseToken']);

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
    };

    //////////////////////////////////

    // const testFirestoreQuery = async () => {
    //   try {
    //     // Ensure the user is authenticated
    //     const user = auth.currentUser;
    //     if (!user) {
    //       console.error('User is not authenticated');
    //       return;
    //     }

    //     console.log('Authenticated user:', user);

    //     // Initialize Firestore
    //     const db = getFirestore();

    //     // Query a document from Firestore
    //     const docRef = doc(db, 'users', 'testUserId'); // Replace 'testUserId' with a valid document ID
    //     const docSnap = await getDoc(docRef);

    //     if (docSnap.exists()) {
    //       console.log('Document data:', docSnap.data());
    //     } else {
    //       console.log('No such document!');
    //     }
    //   } catch (error) {
    //     console.error('Error querying Firestore:', error);
    //   }
    // };
    // testFirestoreQuery();
    // // Test sign-in with a valid custom token
    // console.log('Firebase Auth Object:', auth);
    // const testToken =
    //   'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTc0NjMzNjI3NywiZXhwIjoxNzQ2MzM5ODc3LCJpc3MiOiJmaXJlYmFzZS1hZG1pbnNkay1mYnN2Y0Bkby1pLWRlc2VydmUtaXQuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCJzdWIiOiJmaXJlYmFzZS1hZG1pbnNkay1mYnN2Y0Bkby1pLWRlc2VydmUtaXQuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCJ1aWQiOiIxMDQ2ODkyODU5MjY4MzgxNjMyOTgifQ.FztBswHTtS_E3R2VwrxE3L1iaV0kJ_2M3TPf2E26ygY90M-EOPBUDADLJlITBSC9_boZhME4QhujhJRQHd5eSj4QUmrce1aQvPpplLkVT6TnB6n-s-5LKef4ARpXCDL9PAvXQJYeodkuF34NpyClAgkCSGDuQF7FdkVACaPQ_iVLT3s55AtUeQSVxXoAifOa4D9Rzqra03JpqHrWA6EpQhnjY7e3la1P7WBDXla0pkUUd7v-gZdf2BSOwiXXDugyDkJKeTlpN3pvMD5RuOOdsp14eXH7UTq7sREB5hhmpUjXMV1WjuBSLBiG8a8fMQZcUAjztGbMuJEC-OxXvaON5A';
    // signInWithCustomToken(auth, testToken)
    //   .then((userCredential) => {
    //     console.log('@@Successfully signed in:', userCredential.user);
    //   })
    //   .catch((error) => {
    //     console.error('@@Error signing in:', error);
    //   });

    handleCallback();
  }, [setCookie, router]);

  return <p>Logging in...</p>;
}
