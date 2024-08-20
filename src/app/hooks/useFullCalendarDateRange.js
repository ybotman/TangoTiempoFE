// src/hooks/useFullCalendarDateRange.js
import { useState } from 'react';

export function useFullCalenderDateRange() {
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const handleDatesSet = (dateInfo) => {
        console.log('useFullCalenderDateRange.handleDatesSet')
        console.log('--> Start Date:', dateInfo.startStr);  // Log start date
        console.log('--> End Date:', dateInfo.endStr);      // Log end date

        setDateRange({
            start: dateInfo.startStr,
            end: dateInfo.endStr,
        });
    };

    return { dateRange, handleDatesSet };
}