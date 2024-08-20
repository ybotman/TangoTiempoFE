"use client";
import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Usage in a component
<DatePicker
    label="Select Date"
    value={selectedDate}
    onChange={(newDate) => setSelectedDate(newDate)}
/>