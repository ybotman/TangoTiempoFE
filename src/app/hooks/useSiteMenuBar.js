// @/hooks/useSiteMenuBar.js

import { useState, useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { RegionsContext } from '@/contexts/RegionsContext';
import { RoleContext } from '@/contexts/RoleContext';
import PropTypes from 'prop-types';

export const useSiteMenuBar = () => {
  const { user, logOut, selectRole } = useContext(AuthContext);
  const {
    selectedRegion,
    setSelectedRegion,
    selectedRegionID,
    setSelectedRegionID,
    selectedDivision,
    setSelectedDivision,
    selectedCity,
    setSelectedCity,
    regions
  } = useContext(RegionsContext);
  //const { organizers } = useContext(PostFilterContext);
  const { roles, selectedRole } = useContext(RoleContext);

  const [anchorEl, setAnchorEl] = useState(null);
  const [FAQModalOpen, setFAQModalOpen] = useState(false);

  // Handle menu opening and closing
  const handleHamburgerMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleHamburgerMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle role changes
  const handleRoleChange = (event) => {
    selectRole(event.target.value);
  };
const handleRegionChange = (event) => {
  const selectedRegionName = event.target.value;
  const selectedRegionData = regions.find((region) => region.regionName === selectedRegionName);

  setSelectedRegion(selectedRegionName);
  
  // Make sure you're setting the correct ID
  setSelectedRegionID(selectedRegionData ? selectedRegionData._id : '');  // assuming _id is the ID of the region

  setSelectedDivision('');
  setSelectedCity('');
};

  const handleDivisionChange = (event) => {
    setSelectedDivision(event.target.value);
    setSelectedCity('');
  };

  const handleCityChange = (event) => {
    setSelectedCity(event.target.value);
  };

  const openFAQModal = () => setFAQModalOpen(true);
  const closeFAQModal = () => setFAQModalOpen(false);

  return {
    anchorEl,
    setAnchorEl,
    FAQModalOpen,
    setFAQModalOpen,
    selectedRegion,
    selectedDivision,
    selectedCity,
   // organizers,
    regions,
    roles,
    selectedRole,
    user,
    handleHamburgerMenuOpen,
    handleHamburgerMenuClose,
    handleRoleChange,
    handleRegionChange,
    handleDivisionChange,
    handleCityChange,
    openFAQModal,
    closeFAQModal,
    logOut
  };
};

useSiteMenuBar.propTypes = {
  activeCategories: PropTypes.arrayOf(PropTypes.string).isRequired,  // Array of active category names
  handleCategoryChange: PropTypes.func.isRequired,                   // Function to handle category change
  categories: PropTypes.arrayOf(                                     // Array of category objects with name property
    PropTypes.shape({
      categoryName: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedOrganizer: PropTypes.string.isRequired,                    // Currently selected organizer
  handleOrganizerChange: PropTypes.func.isRequired,                  // Function to handle organizer change
};

export default useSiteMenuBar;