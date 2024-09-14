//app/contexts/CalendarContext.js


"use client";

import React, { createContext, useState } from 'react';
import PropTypes from 'prop-types';

export const CalendarContext = createContext();

export const CalendarProvider = ({ children }) => {
  const [datesSet, setDatesSet] = useState(null);

  return (
    <CalendarContext.Provider value={{ datesSet, setDatesSet }}>
      {children}
    </CalendarContext.Provider>
  );
};

CalendarProvider.propTypes = {
  children: PropTypes.node.isRequired,
};