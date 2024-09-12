// src/hooks/useFullCalendarDateRange.js
import { useState } from 'react';

export function useFullCalendarDateRange() {
    const [dateRange, setDateRange] = useState({ firstCalDt: '', lastCalDt: '' });

    const handleDatesSet = (dateInfo) => {
        console.log('useFullCalendarDateRange.handleDatesSet')
        console.log('--> Calendar earliest Date:', dateInfo.startStr);
        console.log('--> Calendar latest Date:', dateInfo.endStr);

        setDateRange({
            firstCalDt: dateInfo.startStr,
            lastCalDt: dateInfo.endStr,
        });
    };

    return { dateRange, handleDatesSet };
}