// src/utils/EventCreateRules.js
export const validateEvent = (eventData) => {
    const errors = [];

    // End date must be after start date
    if (new Date(eventData.endDate) <= new Date(eventData.startDate)) {
        errors.push("End date and time must be after the start date and time.");
    }


    return errors;
};