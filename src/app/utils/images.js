// ./utils/image.js

// ./utils/image.js

export const isValidImage = (eventImage) => {
  if (!eventImage) return false;

  const img = new Image();
  img.src = eventImage;

  return new Promise((resolve) => {
    img.onload = () => {
      const isLandscape = img.width > img.height;
      resolve(isLandscape);
    };
    img.onerror = () => {
      resolve(false);
    };
  });
};

// Function to apply the event image if it is valid and the event is featured
export const applyEventImage = async (event) => {
  if (event.eventImage && event.featured) {
    const valid = await isValidImage(event.eventImage);
    return valid ? event.eventImage : null;
  }
  return null;
};
