//app/contexts/useCalendarContext.js

import { useContext } from 'react';
import { CalendarContext } from './CalendarContext';

export const useCalendarContext = () => {
  console.log('useCalendarContext');
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendarContext must be used within a CalendarProvider');
  }
  return context;
};