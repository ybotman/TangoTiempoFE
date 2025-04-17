//@/calendar/layout.js
'use client'; // Enable client-side rendering

import { React, useContext, useEffect } from 'react';
import PropTypes from 'prop-types'; // Import prop-types
import { AuthContext } from '@/contexts/AuthContext';
import { useGeoLocation } from '@/contexts/GeoLocationContext';

const RootLayout = ({ children }) => {
  const { user } = useContext(AuthContext);
  const { selectedLocation } = useGeoLocation();

  useEffect(() => {
    if (user?.displayName) {
      console.log('Layout:uE User Name:', user.displayName);
    }

    // Use GeoLocationContext instead of RegionsContext for logging
    if (selectedLocation?.region?.name) {
      console.log('Layout:uE Selected Region:', selectedLocation.region.name);
    }
  }, [user, selectedLocation]);

  return <>{children}</>;
};

// Define prop types for validation
RootLayout.propTypes = {
  children: PropTypes.node.isRequired, // Ensure that children is a valid React node
};

export default RootLayout;
