import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import useOrganizers from "@/hooks/useOrganizers";

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

  // Manage region, division, and city
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // Organizers based on selected region
  const organizers = useOrganizers(selectedRegion);

  // Handle role change
  const handleRoleChange = (event) => {
    console.log("handleRoleChange", event.target.value);
    setSelectedRole(event.target.value);
  };

  // Handle region, division, and city changes
  const handleRegionChange = (event) => {
    setSelectedRegion(event.target.value);
    setSelectedDivision("");
    setSelectedCity("");
  };

  const handleDivisionChange = (event) => {
    setSelectedDivision(event.target.value);
    setSelectedCity("");
  };

  const handleCityChange = (event) => {
    setSelectedCity(event.target.value);
  };

  return {
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
    selectedRegion,
    setSelectedRegion,
    selectedDivision,
    setSelectedDivision,
    selectedCity,
    setSelectedCity,
    organizers,
    handleRoleChange,
    handleRegionChange,
    handleDivisionChange,
    handleCityChange,
  };
};
