// src/utils/EventCreateRules.js
export const validateEvent = (eventData) => {
    const errors = [];

    // Example rule: End date must be after start date
    if (new Date(eventData.endDate) <= new Date(eventData.startDate)) {
        errors.push("End date and time must be after the start date and time.");
    }

    // Add more validation rules as needed

    return errors;
};