import React, { createContext, useContext, useState } from 'react';

// Create the context
const RoleContext = createContext();

// Create the provider component
export const RoleProvider = ({ children }) => {
    const [selectedRole, setSelectedRole] = useState('');

    return (
        <RoleContext.Provider value={{ selectedRole, setSelectedRole }}>
            {children}
        </RoleContext.Provider>
    );
};

// Create a custom hook to use the RoleContext
export const useRole = () => {
    return useContext(RoleContext);
};