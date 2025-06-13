import axios from 'axios';

/**
 * Uploads a file to the server, which will then handle Azure storage.
 * This approach avoids exposing storage keys in the frontend.
 * 
 * @param {File} file - The file object to upload
 * @param {string} authToken - The user's authentication token
 * @returns {Promise<{imageUrl: string, fallbackUrl: string}>} URLs of the uploaded image
 */
export const uploadEventImage = async (file, authToken = null) => {
  try {
    // Create a unique filename to avoid collisions
    const timestamp = new Date().getTime();
    const uniqueFilename = `${timestamp}_${file.name.replace(/\s+/g, '_')}`;
    
    // Create form data
    const formData = new FormData();
    formData.append('image', file, uniqueFilename);
    formData.append('appId', process.env.NEXT_PUBLIC_APPLICATION_ID);
    
    // Configure headers, including authentication if available
    const headers = {};
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    // Upload to our backend API, which will handle Azure storage
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BE_URL}/api/events/upload-image`, 
      formData,
      { headers }
    );
    
    // Return both the image URL and fallback URL from the server response
    return {
      imageUrl: response.data.imageUrl,
      fallbackUrl: response.data.fallbackUrl || '/TangoQuestion.jpg'
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
};
