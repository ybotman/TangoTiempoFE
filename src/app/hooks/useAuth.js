"use client";  // Add this to ensure it's treated as a client component

import { useState, useEffect, useRef } from 'react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/utils/firebase';
import axios from 'axios';


export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [availableRoles, setAvailableRoles] = useState([]);
    const [selectedRole, setSelectedRoleState] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isAnonymous = selectedRole === "isAnonymous";
    const isRegionalOrganizer = selectedRole === "RegionalOrganizer";
    const isRegionalAdmin = selectedRole === "RegionalAdmin";
    const isSystemOwner = selectedRole === "SystemOwner";
    const isNamedUser = selectedRole === "NamedUser";


    const signUpOngoing = useRef(false);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                if (!signUpOngoing.current) {
                    await fetchUserRoles(currentUser.uid);  // Fetch roles on login
                }
            } else {
                setUser(null);
                setAvailableRoles([]);
                setSelectedRoleState('');  // Reset role on logout
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const fetchUserRoles = async (firebaseUserId) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/firebase/${firebaseUserId}`);
            if (response.status === 200) {
                const mappedRoles = response.data.roleIds.map(role => ({
                    roleId: role._id,
                    roleName: role.roleName,
                }));
                setAvailableRoles(mappedRoles);
                setSelectedRoleState(mappedRoles[0]?.roleName || "");  // Automatically select the first role
            } else {
                setAvailableRoles([]);
                setSelectedRoleState('');
            }
        } catch (err) {
            setError('Failed to fetch user roles');
            setAvailableRoles([]);
            setSelectedRoleState('');
        }
    };

    const setSelectedRole = (newRole) => {
        console.log("Role being set to:", newRole);  // Debugging
        setSelectedRoleState(newRole);
    };

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

    const logOut = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setAvailableRoles([]);
            setSelectedRoleState('');  // Reset role on logout
        } catch (err) {
            setError(err.message);
        }
    };

    return {
        user,
        availableRoles,
        setAvailableRoles,
        selectedRole,
        setSelectedRole,  // Ensure this function is properly used
        isAnonymous,
        isRegionalOrganizer,
        isRegionalAdmin,
        isSystemOwner,
        isNamedUser,
        loading,
        error,
        logOut,
        authenticateWithGoogle  // Google authentication
    };
};

/* previous version
import { useState, useEffect, useRef } from 'react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/utils/firebase';
import axios from 'axios';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [availableRoles, setAvailableRoles] = useState([]);  // Updated name for clarity
    const [selectedRole, setSelectedRole] = useState('');  // Manage selected role globally
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const signUpOngoing = useRef(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                if (!signUpOngoing.current) {
                    await fetchUserRoles(currentUser.uid);
                }
            } else {
                setUser(null);
                setAvailableRoles([]);
                setSelectedRole('');  // Reset role on logout
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const fetchUserRoles = async (firebaseUserId) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/firebase/${firebaseUserId}`);
            if (response.status === 200) {
                const mappedRoles = response.data.roleIds.map(role => ({
                    roleId: role._id,
                    roleName: role.roleName,
                }));
                setAvailableRoles(mappedRoles);
                setSelectedRole(mappedRoles[0]?.roleName || "");  // Automatically select the first role
            } else {
                setAvailableRoles([]);
                setSelectedRole('');
            }
        } catch (err) {
            setError('Failed to fetch user roles');
            setAvailableRoles([]);
            setSelectedRole('');
        }
    };

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

    const logOut = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setAvailableRoles([]);
            setSelectedRole('');  // Reset role on logout
        } catch (err) {
            setError(err.message);
        }
    };

    return {
        user,
        availableRoles,
        setAvailableRoles,
        selectedRole,
        setSelectedRole,
        loading,
        error,
        logOut,
        authenticateWithGoogle
    };
};
*/