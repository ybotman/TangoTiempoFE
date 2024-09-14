// FE/src/app/contexts/RegionsContext.js

"use client";

import React, { createContext, useState, useEffect } from 'react';
import { useRegions } from '@/hooks/useRegions';
import PropTypes from 'prop-types';

export const RegionsContext = createContext();

export const RegionsProvider = ({ children }) => {
  const regionsData = useRegions();
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    if (regionsData) {
      setRegions(regionsData);
    }
  }, [regionsData]);

  return (
    <RegionsContext.Provider value={{ regions, setRegions }}>
      {children}
    </RegionsContext.Provider>
  );
};

RegionsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};