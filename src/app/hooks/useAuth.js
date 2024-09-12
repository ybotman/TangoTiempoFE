import { useState, useEffect, useRef } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { auth } from "@/utils/firebase";
import axios from "axios";

export const useAuth = () => {
  const [user, setUser] = useState("");
  const [availibleRoles, setAvailibleRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isRegionalOrganizer, setIsRegionalOrganizer] = useState(false);
  const [isRegionalAdmin, setIsRegionalAdmin] = useState(false);
  const [isSystemOwner, setIsSystemOwner] = useState(false);
  const [isNamedUser, setIsNamedUser] = useState(false); // Track the selected role
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const signUpOngoing = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        if (!signUpOngoing.current) {
          await fetchUserRoles(currentUser.uid); // Fetch user roles
        }
      } else {
        setUser("");
        setAvailibleRoles([]); // Clear roles on logout
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserRoles = async (firebaseUserId) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/firebase/${firebaseUserId}`
      );

      if (response.status === 200) {
        setAvailibleRoles(response.data.roleIds.map((role) => role.roleName)); // Set the list of role names
        setSelectedRole(response.data.roleIds[0]?.roleName || "");
        updateRoleBooleans(response.data.roleIds[0]?.roleName || "");
      } else {
        setAvailibleRoles([]);
      }
    } catch (err) {
      setError("Failed to fetch user roles");
      setAvailibleRoles([]);
    }
  };

  const updateRoleBooleans = (roleName) => {
    setIsNamedUser(roleName === "NamedUser");
    setIsRegionalOrganizer(roleName === "RegionalOrganizer");
    setIsRegionalAdmin(roleName === "RegionalAdmin");
    setIsSystemOwner(roleName === "SystemOwner");
    setIsAnonymous(roleName === "Anonymous");
  };

  const authenticateWithGoogle = async () => {
    if (user) {
      setError("You are already signed in.");
      return null;
    }

    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      signUpOngoing.current = true;
      const result = await signInWithPopup(auth, provider);
      const firebaseUserId = result.user.uid;

      try {
        await axios.get(
          `${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/firebase/${firebaseUserId}`
        );
      } catch (error) {
        if (error.response && error.response.status === 404) {
          const roleResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/`,
            { firebaseUserId }
          );
          if (roleResponse.status !== 204) {
            throw new Error("Failed to assign role in backend");
          }
        } else {
          throw error;
        }
      }

      signUpOngoing.current = false;
      setUser(result.user);
      await fetchUserRoles(firebaseUserId); // Fetch and set the user's roles after signup
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
      setUser("");
      setAvailibleRoles([]); // Clear roles on logout
    } catch (err) {
      setError(err.message);
    }
  };

  console.log("Returning", {
    user,
    availibleRoles,
    selectedRole,
    AN: isAnonymous,
    RO: isRegionalOrganizer,
    RA: isRegionalAdmin,
    SO: isSystemOwner,
    NU: isNamedUser,
  });

  return {
    user,
    availibleRoles,
    selectedRole,
    setSelectedRole,
    isAnonymous,
    isRegionalOrganizer,
    isRegionalAdmin,
    isSystemOwner,
    isNamedUser,
    loading,
    error,
    logOut,
    authenticateWithGoogle,
  };
};
