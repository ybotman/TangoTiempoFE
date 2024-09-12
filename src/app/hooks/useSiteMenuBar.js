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

<<<<<<< HEAD
=======
  /*  
  console.log("Returning", {
    user,
    availibleRoles,
    selectedRole,
    AN: isAnonymous,
    RO: isRegionalOrganizer,
    RA: isRegionalAdmin,
    SO: isSystemOwner,
    NU: isNamedUser,
  });
*/

>>>>>>> 4a899778630e7618aaeba60279f7e754de6bc869
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
