//app/hooks/useSiteMenuBar.js
// app/hooks/useSiteMenuBar.js

import { useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useOrganizers } from "@/hooks/useOrganizers";
import { RegionsContext } from "@/contexts/RegionsContext";

export const useSiteMenuBar = () => {
  const {
    user,
    availibleRoles,
    logOut,
    selectedRole,
    setSelectedRole,
  } = useContext(AuthContext);

  const {
    selectedRegion,
    setSelectedRegion,
    selectedDivision,
    setSelectedDivision,
    selectedCity,
    setSelectedCity,
    regions,
  } = useContext(RegionsContext);

  const organizers = useOrganizers(selectedRegion);

  const handleRoleChange = (event) => {
    console.log("handleRoleChange", event.target.value);
    setSelectedRole(event.target.value);
  };

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
    logOut,
    selectedRole,
    setSelectedRole,
    regions,
    selectedRegion,
    selectedDivision,
    selectedCity,
    handleRegionChange,
    handleDivisionChange,
    handleCityChange,
    organizers,
    handleRoleChange,
  };
};