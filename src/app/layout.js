import React from 'react';
import PropTypes from 'prop-types';
import { RoleProvider } from '@/context/RoleContext';

export const metadata = {
  title: 'Tango Tiempo',
  description: 'Just another Calendar for tango',
};

export default function Layout({ children }) {
  console.log('-->layout.js')
  console.log('BE API URL:', process.env.NEXT_PUBLIC_BE_URL);
  console.log('FIREBASE JSON:', process.env.NEXT_PUBLIC_FIREBASE_JSON);
  console.log('Images API URL:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);

  return (
    <RoleProvider>
      {children}  {/* Wrap the children within RoleProvider */}
    </RoleProvider>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};