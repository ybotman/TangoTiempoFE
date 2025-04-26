// @/hooks/useSiteMenuBar.js

import { useState, useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { RoleContext } from '@/contexts/RoleContext';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import PropTypes from 'prop-types';

export const useSiteMenuBar = () => {
  const { user, logOut, setSelectedRole } = useContext(AuthContext);
  const { roles, selectedRole } = useContext(RoleContext);
  
  // Use GeoLocationContext instead of RegionsContext
  const { 
    selectedLocation,
    selectLocation
  } = useGeoLocation();
  
  // Map values from GeoLocationContext to match the old RegionsContext interface
  const selectedRegion = selectedLocation.region.name;
  const selectedDivision = selectedLocation.division.name;
  const selectedCity = selectedLocation.city.name;
  
  // We'll fetch regions elsewhere if needed
  const regions = [];

  const [anchorEl, setAnchorEl] = useState(null);
  const [FAQModalOpen, setFAQModalOpen] = useState(false);
  const [teamMenuAnchorEl, setTeamMenuAnchorEl] = useState(null);
  const [openTeamMenu, setOpenTeamMenu] = useState(false);

  const handleTeamMenuOpen = (event) => {
    setTeamMenuAnchorEl(event.currentTarget);
    setOpenTeamMenu(true);
  };

  const handleTeamMenuClose = () => {
    setOpenTeamMenu(false);
  };

  const handleHamburgerMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleHamburgerMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  const handleRegionChange = (event) => {
    const selectedRegionName = event.target.value;
    
    // Update GeoLocationContext with the new region
    selectLocation({
      ...selectedLocation,
      region: { 
        ...selectedLocation.region,
        name: selectedRegionName 
      },
      division: { id: null, name: '' },
      city: { id: null, name: '', latitude: null, longitude: null }
    });
  };

  const handleDivisionChange = (event) => {
    const selectedDivisionName = event.target.value;
    
    // Update GeoLocationContext with the new division
    selectLocation({
      ...selectedLocation,
      division: { 
        ...selectedLocation.division,
        name: selectedDivisionName 
      },
      city: { id: null, name: '', latitude: null, longitude: null }
    });
  };

  const handleCityChange = (event) => {
    const selectedCityName = event.target.value;
    
    // Update GeoLocationContext with the new city
    selectLocation({
      ...selectedLocation,
      city: { 
        ...selectedLocation.city,
        name: selectedCityName 
      }
    });
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
    teamMenuAnchorEl,
    openTeamMenu, // Using openTeamMenu
    setOpenTeamMenu, // Include setter
    handleTeamMenuOpen,
    handleTeamMenuClose,
    logOut,
  };
};

useSiteMenuBar.propTypes = {
  activeCategories: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleCategoryChange: PropTypes.func.isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      categoryName: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedOrganizer: PropTypes.string.isRequired,
  handleOrganizerChange: PropTypes.func.isRequired,
};

export default useSiteMenuBar;
