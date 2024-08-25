import { useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
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
    // Check if the user is already signed in
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
      return result.user; // Return the user for further processing
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  return { user, loading, error, signUpWithGoogle };
};
