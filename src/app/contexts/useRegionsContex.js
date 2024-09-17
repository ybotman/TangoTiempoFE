//app/contexts/useRegionsContex.js

import { useContext } from 'react';
import { RegionsContext } from './RegionsContext';

export const useRegionsContext = () => {
  console.log('useRegionsContext');

  const context = useContext(RegionsContext);
  if (!context) {
    throw new Error('useRegionsContext must be used within a RegionsProvider');
  }
  return context;
};
