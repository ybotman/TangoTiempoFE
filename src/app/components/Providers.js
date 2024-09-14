// src/app/components/Providers.js

"use client";

import React from 'react';
import PropTypes from 'prop-types';
import { AuthProvider } from '@/contexts/AuthContext';
import { RegionsProvider } from '@/contexts/RegionsContext';
import { CalendarProvider } from '@/contexts/CalendarContext';
import { PostFilterProvider } from '@/contexts/PostFilterContext';
import { RoleProvider } from '@/contexts/RoleContext';

const Providers = ({ children }) => {
  return (
    <AuthProvider>
      <RegionsProvider>
        <CalendarProvider>
          <PostFilterProvider>
            <RoleProvider>
              {children}
            </RoleProvider>
          </PostFilterProvider>
        </CalendarProvider>
      </RegionsProvider>
    </AuthProvider>
  );
};

Providers.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Providers;