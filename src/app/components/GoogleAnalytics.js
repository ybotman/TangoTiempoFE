// GoogleAnalytics.js
'use client';

import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';
import PropTypes from 'prop-types';

export default function GoogleClientWrapper({ children }) {
  useGoogleAnalytics();

  return <>{children}</>;
}

// Define propTypes for GoogleClientWrapper
GoogleClientWrapper.propTypes = {
  children: PropTypes.node.isRequired, // Ensures that children is a valid React node
};
