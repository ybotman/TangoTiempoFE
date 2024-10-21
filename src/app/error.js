'use client';

import { useEffect } from 'react';
import PropTypes from 'prop-types'; // Add PropTypes import

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}

// Define prop-types for validation
GlobalError.propTypes = {
  error: PropTypes.object.isRequired, // Add error prop validation
  reset: PropTypes.func.isRequired, // Add reset prop validation
};
