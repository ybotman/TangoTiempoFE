'use client';

import { useEffect } from 'react';
import PropTypes from 'prop-types'; // Add PropTypes import

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="error-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <h2>Something went wrong!</h2>
      <button
        onClick={() => reset()}
        style={{
          padding: '8px 16px',
          marginTop: '12px',
          cursor: 'pointer'
        }}
      >
        Try again
      </button>
    </div>
  );
}

// Define prop-types for validation
GlobalError.propTypes = {
  error: PropTypes.object.isRequired, // Add error prop validation
  reset: PropTypes.func.isRequired, // Add reset prop validation
};
