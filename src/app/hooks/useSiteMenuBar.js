//FE/src/app/hooks/useSiteMenuBar.js

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import useOrganizers from "@/hooks/useOrganizers";
import { useRegions } from "@/hooks/useRegions"; // Import useRegions

export const useSiteMenuBar = () => {
  // Use authentication hook to manage user and roles
  const {
    user,
    availibleRoles,
    loading,
    error,
    logOut,
    isAnonymous,
    isRegionalOrganizer,
    isRegionalAdmin,
    isSystemOwner,
    isNamedUser,
    selectedRole,
    setSelectedRole,
  } = useAuth();
  // State variables

const [selectedRegion, setSelectedRegion] = useState("");
const [selectedDivision, setSelectedDivision] = useState("");
const [selectedCity, setSelectedCity] = useState("");
  // Organizers based on selected region
  const organizers = useOrganizers('Northeast');  //ybotman fix!
   const regions = useRegions(); // Now regions is defined here


  // Handle role change
  const handleRoleChange = (event) => {
    console.log("handleRoleChange", event.target.value);
    setSelectedRole(event.target.value);
  };

    // Handlers
const handleRegionChange = (event) => {
  const value = event.target.value;
  console.log("handleRegionChange:", value);
  setSelectedRegion(value);
  setSelectedDivision("");
  setSelectedCity("");
};

const handleDivisionChange = (event) => {
  const value = event.target.value;
  console.log("handleDivisionChange:", value);
  setSelectedDivision(value);
  setSelectedCity("");
};

const handleCityChange = (event) => {
  const value = event.target.value;
  console.log("handleCityChange:", value);
  setSelectedCity(value);
};
  

  
  return {
    user,
    availibleRoles,
    loading,
    error,
    logOut,
    regions,
    selectedRegion, selectedDivision, selectedCity,
    handleRegionChange, handleDivisionChange, handleCityChange,
    isAnonymous, isRegionalOrganizer,isRegionalAdmin, isSystemOwner,isNamedUser,
    selectedRole,
    setSelectedRole,
    organizers,
    handleRoleChange,

  };
};
