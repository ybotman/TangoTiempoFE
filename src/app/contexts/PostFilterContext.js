//app/contexts/PostFilterContext.js

"use client";
import PropTypes from 'prop-types';
import React, { useContext,createContext, useState } from 'react';
import { RegionsContext } from '@/contexts/RegionsContext';
import useOrganizers from '@/hooks/useOrganizers';

export const PostFilterContext = createContext();
//console.log('PostFilterContext created');

export const PostFilterProvider = ({ children }) => {
    const { selectedRegion } = useContext(RegionsContext);
  const [selectedOrganizers, setSelectedOrganizers] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const organizers = useOrganizers(selectedRegion); // Fetch organizers based on selectedRegion

 // console.log('PostFilterProvider rendering. selectedOrganizers:', selectedOrganizers, 'selectedCategories:', selectedCategories);
  
  return (
    <PostFilterContext.Provider value={{
      organizers, // Provide organizers to the context
      selectedOrganizers,
      setSelectedOrganizers,
      selectedCategories,
      setSelectedCategories,
    }}>
      {children}
    </PostFilterContext.Provider>
  );
};

PostFilterProvider.propTypes = {
  children: PropTypes.node.isRequired,
};