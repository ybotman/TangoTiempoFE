//app/contexts/usePostFilterContext.js


import { useContext } from 'react';
import { PostFilterContext } from './PostFilterContext';

export const usePostFilterContext = () => {
  const context = useContext(PostFilterContext);
  if (!context) {
    throw new Error('usePostFilterContext must be used within a PostFilterProvider');
  }
  return context;
};