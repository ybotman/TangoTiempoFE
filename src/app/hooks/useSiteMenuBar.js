import { useState } from 'react';
import useOrganizers from '@/hooks/useOrganizers';  // Import the organizer hook
import { useAuth } from '@/hooks/useAuth';  // Import the useAuth hook for role-based logic

export const useSiteMenuBar = ({
    setSelectedRegion, setSelectedDivision, setSelectedCity, handleOrganizerChange
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [sortedCategories, setSortedCategories] = useState([]);
    const organizers = useOrganizers();  // Fetch organizers
    const { user, selectedRole, setSelectedRole, availableRoles, logOut } = useAuth();  // Destructure role logic

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleSortedCategories = (sortedCategories) => {
        setSortedCategories(sortedCategories);
    };

    const handleRegionChange = (event) => {
        setSelectedRegion(event.target.value);
        setSelectedDivision('');
        setSelectedCity('');
        handleOrganizerChange('');  // Reset organizer when the region changes
    };

    const handleDivisionChange = (event) => {
        setSelectedDivision(event.target.value);
        setSelectedCity('');
    };

    const handleCityChange = (event) => {
        setSelectedCity(event.target.value);
    };

    const handleRoleChange = (event) => {
        setSelectedRole(event.target.value);  // Change the role when selected from the dropdown
    };

    return {
        anchorEl,
        setAnchorEl,
        sortedCategories,
        setSortedCategories,
        organizers,
        user,
        selectedRole,
        availableRoles,
        logOut,
        handleMenuOpen,
        handleMenuClose,
        handleSortedCategories,
        handleRegionChange,
        handleDivisionChange,
        handleCityChange,
        handleRoleChange,
    };
};