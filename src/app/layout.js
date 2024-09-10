import React from 'react';
import PropTypes from 'prop-types';
import { RoleProvider } from '@/context/RoleContext';

export const metadata = {
  title: 'Tango Tiempo',
  description: 'Tango Tiempo is a comprehensive calendar application designed to help tango dancers and organizers across the nation coordinate and manage tango events. The application provides multiple views (calendar, list, and upcoming map view) for users to browse events and includes advanced filtering options for a personalized experience.',
};

export default function Layout({ children }) {
  console.log('-->layout.js');

  return (
    <RoleProvider>
      {children}  {/* Wrap the children within RoleProvider */}
    </RoleProvider>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};