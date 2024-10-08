'use client'; // Enable client-side rendering

import { React, useContext, useEffect } from 'react';
import PropTypes from 'prop-types'; // Import prop-types
import { AuthContext } from '@/contexts/AuthContext';
import { RegionsContext } from '@/contexts/RegionsContext';

const RootLayout = ({ children }) => {
  const { user } = useContext(AuthContext);
  const { regions, selectedRegion } = useContext(RegionsContext);

  useEffect(() => {
    if (user?.displayName) {
      // console.log('User Name:', user.displayName);
    }

    if (regions?.length > 0) {
      // console.log('Selected Region:', selectedRegion);
    }
  }, [user, regions, selectedRegion]);

  return <>{children}</>;
};

// Define prop types for validation
RootLayout.propTypes = {
  children: PropTypes.node.isRequired, // Ensure that children is a valid React node
};

export default RootLayout;
