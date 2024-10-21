// @/hooks/useSiteMenuBar.js

import { useState, useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { RegionsContext } from '@/contexts/RegionsContext';
import { RoleContext } from '@/contexts/RoleContext';
import PropTypes from 'prop-types';

export const useSiteMenuBar = () => {
  const { user, logOut, setSelectedRole } = useContext(AuthContext);
  const {
    selectedRegion,
    setSelectedRegion,
    setSelectedRegionID,
    selectedDivision,
    setSelectedDivision,
    selectedCity,
    setSelectedCity,
    regions,
  } = useContext(RegionsContext);

  const { roles, selectedRole } = useContext(RoleContext);

  const [anchorEl, setAnchorEl] = useState(null);
  const [FAQModalOpen, setFAQModalOpen] = useState(false);
  const [teamMenuAnchorEl, setTeamMenuAnchorEl] = useState(null);
  const [openTeamMenu, setOpenTeamMenu] = useState(false); // Using openTeamMenu

  const handleTeamMenuOpen = (event) => {
    setTeamMenuAnchorEl(event.currentTarget);
    setOpenTeamMenu(true); // Opening team menu
  };

  const handleTeamMenuClose = () => {
    setOpenTeamMenu(false); // Closing team menu
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
    const selectedRegionData = regions.find(
      (region) => region.regionName === selectedRegionName
    );

    setSelectedRegion(selectedRegionName);
    setSelectedRegionID(selectedRegionData ? selectedRegionData._id : '');
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
