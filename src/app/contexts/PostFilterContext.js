//app/contexts/PostFilterContext.js

"use client";

import React, { createContext, useState } from 'react';
import PropTypes from 'prop-types';

export const PostFilterContext = createContext();

export const PostFilterProvider = ({ children }) => {
  const [selectedOrganizers, setSelectedOrganizers] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  return (
    <PostFilterContext.Provider value={{
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