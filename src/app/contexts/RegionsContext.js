//app/contexts/RegionsContext.js

"use client";

import React, { createContext, useState, useEffect } from 'react';
import { useRegions } from '@/hooks/useRegions';
import PropTypes from 'prop-types';

export const RegionsContext = createContext();
console.log('RegionsContext created');

export const RegionsProvider = ({ children }) => {
  const regionsData = useRegions(); // Custom hook to fetch regions
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    if (regionsData) {
      setRegions(regionsData);
    }
  }, [regionsData]);

  return (
    <RegionsContext.Provider
      value={{
        regions,
        setRegions,
        selectedRegion,
        setSelectedRegion,
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