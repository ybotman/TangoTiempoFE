export const validateEvent = (eventData) => {
  const errors = [];

  // Event title validation
  if (!eventData.title || eventData.title.trim() === '') {
    errors.push('Event title is required.');
  }

  // End date must be after start date
  if (new Date(eventData.endDate) <= new Date(eventData.startDate)) {
    errors.push('End date and time must be after the start date and time.');
  }

  // Check if image file is provided (optional if required)
  if (!eventData.imageFile) {
    errors.push('Event image is required.');
  }

  // Additional field validations (e.g., location, category)
  if (!eventData.categoryFirst) {
    errors.push('Primary category is required.');
  }

  return errors;
};
