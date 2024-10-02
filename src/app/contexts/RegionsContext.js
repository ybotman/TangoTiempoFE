//app/contexts/RegionsContext.js

'use client';

import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

export const RegionsContext = createContext();
console.log('RegionsContext created');

export const RegionsProvider = ({ children }) => {
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(''); // Name of the selected region
  const [selectedRegionID, setSelectedRegionID] = useState(''); // ID of the selected region
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Populate regions when data is available
  useEffect(() => {
    fetchRegions();
    console.log('RegionsProvider useEffect');
  }, []);

  // Fetch regions from the backend
  const fetchRegions = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/regions/activeRegions`
      );
      setRegions(response.data);
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };

  // console.log('RegionsProvider rendered', selectedRegion, selectedRegionID);
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
