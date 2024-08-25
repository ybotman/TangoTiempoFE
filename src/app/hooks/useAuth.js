import { useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/utils/firebase';
import axios from 'axios';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUpWithGoogle = async () => {
    if (user) {
      setError('You are already signed in.');
      return null;
    }

    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUserId = result.user.uid;
      
      // Assign the default role "user" in MongoDB via the backend
      const roleResponse = await axios.post(
        process.env.NEXT_PUBLIC_TangoTiempoBE_URL 
          ? `${process.env.NEXT_PUBLIC_TangoTiempoBE_URL}/api/userlogin` 
          : 'https://tangotiempobe-g3c0ebh2b6asbbd6.eastus-01.azurewebsites.net/api/userlogin',
        {
          firebaseUserId: firebaseUserId,
          role: 'user',
        }
      );

      if (roleResponse.status !== 201) {
        throw new Error('Failed to assign role in backend');
      }

      setUser(result.user);
      setLoading(false);
      return result.user;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  const logInWithGoogle = async () => {
    if (user) {
      setError('You are already logged in.');
      return null;
    }

    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      setLoading(false);
      return result.user;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      setError(err.message);
      console.error('Error logging out:', err);
    }
  };

  return { user, loading, error, signUpWithGoogle, logInWithGoogle, logOut };
};
