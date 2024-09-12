import { useEffect, useState } from 'react';
import useOrganizers from '@/hooks/useOrganizers';
import { useAuth } from '@/hooks/useAuth';

export const useSiteMenuBar = ({
    setSelectedRegion, setSelectedDivision, setSelectedCity, handleOrganizerChange
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [sortedCategories, setSortedCategories] = useState([]);
    const [isNoRegionSelectedModalOpen, setNoRegionSelectedModalOpen] = useState(false); // Add state for modal
    const organizers = useOrganizers();
    const {
        user,
        selectedRole,
        setSelectedRole,
        availableRoles,
        logOut,
        isAnonymous,
        isRegionalOrganizer,
        isRegionalAdmin,
        isSystemOwner,
        isNamedUser
    } = useAuth();

    useEffect(() => {
        console.log('useEffect returning', {
            selectedRole,
            AN: isAnonymous,
            RO: isRegionalOrganizer,
            RA: isRegionalAdmin,
            SO: isSystemOwner,
            NU: isNamedUser
        });
    }, [isAnonymous, isRegionalOrganizer, isRegionalAdmin, isSystemOwner, isNamedUser, selectedRole]);

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
        const region = event.target.value;
        if (!region) {
            setNoRegionSelectedModalOpen(true);  // Open modal if no region selected
        } else {
            setSelectedRegion(region);
            setSelectedDivision('');
            setSelectedCity('');
            handleOrganizerChange('');
        }
    };

    const handleDivisionChange = (event) => {
        setSelectedDivision(event.target.value);
        setSelectedCity('');
    };

    const handleCityChange = (event) => {
        setSelectedCity(event.target.value);
    };

    const handleRoleChange = (event) => {
        setSelectedRole(event.target.value);
    };

    console.log('useSiteMenuBar returning', {
        selectedRole,
        AN: isAnonymous,
        RO: isRegionalOrganizer,
        RA: isRegionalAdmin,
        SO: isSystemOwner,
        NU: isNamedUser
    });

    return {
        anchorEl,
        setAnchorEl,
        sortedCategories,
        setSortedCategories,
        isNoRegionSelectedModalOpen, // Return modal state
        setNoRegionSelectedModalOpen, // Return modal setter
        organizers,
        user,
        availableRoles,
        logOut,
        isNamedUser,            // Ensure this is returned
        isRegionalOrganizer,     // Ensure this is returned
        isRegionalAdmin,         // Ensure this is returned
        isSystemOwner,
        selectedRole,
        handleMenuOpen,
        handleMenuClose,
        handleSortedCategories,
        handleRegionChange,
        handleDivisionChange,
        handleCityChange,
        handleRoleChange,
    };
};