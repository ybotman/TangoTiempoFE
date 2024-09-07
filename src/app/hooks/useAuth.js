import { useState, useEffect, useRef } from 'react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/utils/firebase';
import axios from 'axios';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const signUpOngoing = useRef(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);

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

    // Google Authentication function
    const authenticateWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            console.log('Google Sign-in successful:', user);
            return user;
        } catch (error) {
            console.error('Google sign-in error:', error);
            setError(error.message);
        }
    };

    const fetchUserRoles = async (firebaseUserId) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/firebase/${firebaseUserId}`);
            if (response.status === 200) {
                const mappedRoles = response.data.roleIds.map(role => ({
                    roleId: role._id,
                    roleName: role.roleName,
                }));
                setRoles(mappedRoles);
            } else {
                setRoles([]);
            }
        } catch (err) {
            setError('Failed to fetch user roles');
            setRoles([]);
        }
    };

    const logOut = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setRoles([]);
            console.log("User logged out.");
        } catch (err) {
            setError(err.message);
        }
    };

    return { user, roles, setRoles, loading, error, logOut, authenticateWithGoogle };
};