import { useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/utils/firebase';

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
      setUser(result.user);
      setLoading(false);
      return result.user;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  // New logOut function
  const logOut = async () => {
    try {
      await signOut(auth);
      setUser(null);  // Clear user state on logout
    } catch (err) {
      setError(err.message);
      console.error('Error logging out:', err);
    }
  };

  return { user, loading, error, signUpWithGoogle, logOut };
};
