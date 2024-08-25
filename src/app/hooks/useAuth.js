import { useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/utils/firebase';
import axios from 'axios';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);  // New state for user role
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserRole(currentUser.uid);  // Fetch user role after setting the user
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserRole = async (firebaseUserId) => {
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_TangoTiempoBE_URL 
          ? `${process.env.NEXT_PUBLIC_TangoTiempoBE_URL}/api/userlogin/firebase/${firebaseUserId}`
          : `https://tangotiempobe-g3c0ebh2b6asbbd6.eastus-01.azurewebsites.net/api/userlogin/firebase/${firebaseUserId}`
      );
      if (response.status === 200) {
        setRole(response.data.role);  // Set the role from the backend response
      } else {
        setRole(null);
      }
    } catch (err) {
      console.error('Error fetching user role:', err);
      setError('Failed to fetch user role');
      setRole(null);
    }
  };

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
      await fetchUserRole(firebaseUserId);  // Fetch and set the user's role after signup
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
      await fetchUserRole(result.user.uid);  // Fetch and set the user's role after login
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
      setRole(null);  // Clear role state on logout
    } catch (err) {
      setError(err.message);
      console.error('Error logging out:', err);
    }
  };

  return { user, role, loading, error, signUpWithGoogle, logInWithGoogle, logOut };
};
