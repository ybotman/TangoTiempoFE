// context/RoleContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth'; // Assuming useAuth handles login state and available roles

const RoleContext = createContext();  // Create the Role Context

export const RoleProvider = ({ children }) => {
    const { selectedRole, setSelectedRole, availableRoles } = useAuth();  // Get roles from useAuth
    const [role, setRole] = useState(selectedRole);  // State for managing the role

    useEffect(() => {
        setRole(selectedRole);  // Whenever selectedRole changes in useAuth, update the context's role
    }, [selectedRole]);

    const handleRoleChange = (newRole) => {
        setRole(newRole);
        setSelectedRole(newRole);  // Sync with useAuth if needed
        console.log("Role changed to:", newRole);
    };

    return (
        <RoleContext.Provider value={{ role, setRole: handleRoleChange, availableRoles }}>
            {children}
        </RoleContext.Provider>
    );
};

export default RoleContext;