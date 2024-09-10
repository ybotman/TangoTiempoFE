import { useState, useEffect, useRef } from 'react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/utils/firebase';
import axios from 'axios';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [roles, setRoles] = useState([]);  // Updated to manage multiple roles
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const signUpOngoing = useRef(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);

                // If user is signing up, set the flag and skip fetching user roles
                if (!signUpOngoing.current) {
                    await fetchUserRoles(currentUser.uid);  // Fetch user roles
                }
            } else {
                setUser(null);
                setRoles([]);  // Clear roles on logout
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const fetchUserRoles = async (firebaseUserId) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/firebase/${firebaseUserId}`);

            if (response.status === 200) {
                setRoles(response.data.roleIds.map(role => role.roleName));  // Set the list of role names
            } else {
                setRoles([]);
            }
        } catch (err) {
            console.error('Error fetching user roles:', err);
            setError('Failed to fetch user roles');
            setRoles([]);
        }
    };

    const authenticateWithGoogle = async () => {
        if (user) {
            setError('You are already signed in.');
            return null;
        }

        setLoading(true);
        const provider = new GoogleAuthProvider();

        try {
            signUpOngoing.current = true;
            const result = await signInWithPopup(auth, provider);
            const firebaseUserId = result.user.uid;
            const { displayName, phoneNumber, photoURL } = result.user;
    
            // Derive firstName and lastName from displayName
            let firstName = '';
            let lastName = '';
            if (displayName) {
                const nameParts = displayName.split(' ');
                firstName = nameParts[0] || '';
                lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
            }
    
            // Prepare user data object
            const userData = {
                firebaseUserId
            };
            if (firstName) userData.firstName = firstName;
            if (lastName) userData.lastName = lastName;
            if (phoneNumber) userData.phoneNumber = phoneNumber;
            if (photoURL) userData.photoUrl = photoURL;
    
            try {
                // Check if the user already exists in the backend
                await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/firebase/${firebaseUserId}`);
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    // User does not exist, create a new one with POST request
                    const roleResponse = await axios.post(
                        `${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/`,
                        userData
                    );
    
                    if (roleResponse.status !== 204) {
                        throw new Error('Failed to create user in backend');
                    }
                } else {
                    throw error;
                }
            }
    
            signUpOngoing.current = false;
            setUser(result.user);
            await fetchUserRoles(firebaseUserId);  // Fetch and set the user's roles after signup
            setLoading(false);
            return result.user;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            signUpOngoing.current = false;
            return null;
        }
    };    

    const logOut = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setRoles([]);  // Clear roles on logout
        } catch (err) {
            setError(err.message);
            console.error('Error logging out:', err);
        }
    };

    return { user, roles, loading, error, authenticateWithGoogle, logOut };
};
