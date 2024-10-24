//app/contexts/RegionsContext.js

'use client';

import React, { createContext, useState, useEffect } from 'react';
import { useRegions } from '@/hooks/useRegions';
import PropTypes from 'prop-types';

export const RegionsContext = createContext();
//console.log('RegionsContext created');

export const RegionsProvider = ({ children }) => {
  const regionsData = useRegions(); // Custom hook to fetch regions
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(''); // Name of the selected region
  const [selectedRegionID, setSelectedRegionID] = useState(''); // ID of the selected region
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Populate regions when data is available
  useEffect(() => {
    if (regionsData) {
      setRegions(regionsData);
    }
  }, [regionsData]);

  //console.log('RegionsProvider rendered', selectedRegion, selectedRegionID);
  return (
    <RegionsContext.Provider
      value={{
        regions,
        setRegions,
        selectedRegion,
        setSelectedRegion,
        selectedRegionID,
        setSelectedRegionID, // Add setter for the region ID
        selectedDivision,
        setSelectedDivision,
        selectedCity,
        setSelectedCity,
      }}
    >
      {children}
    </RegionsContext.Provider>
  );
};

RegionsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
