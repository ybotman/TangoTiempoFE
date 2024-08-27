import React from 'react';
import PropTypes from 'prop-types';


export const metadata = {
  title: 'Tango Tiempo',
  description: 'Just another Calendar for tango',
};


export default function Layout({ children }) {
  console.log('-->layout.js')
  console.log('BE API URL:', process.env.NEXT_PUBLIC_TangoTiempoBE_URL);
  console.log('Images API URL:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);

  return (
    <>
      <html lang="en">
        <body>{children}</body>
      </html>
    </>
  );
}


// Prop validation
Layout.propTypes = {
  children: PropTypes.node.isRequired,
};