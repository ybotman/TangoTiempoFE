// src/app/components/Providers.js

'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { AuthProvider } from '@/contexts/AuthContext';
import { RegionsProvider } from '@/contexts/RegionsContext';
import { RoleProvider } from '@/contexts/RoleContext';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Settings } from 'luxon';

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
Settings.defaultZone = timezone;
const Providers = ({ children }) => {
  return (
    <AuthProvider>
      <RegionsProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <RoleProvider>{children}</RoleProvider>
        </LocalizationProvider>
      </RegionsProvider>
    </AuthProvider>
  );
};

Providers.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Providers;
