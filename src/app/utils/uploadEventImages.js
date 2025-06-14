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
    
    // Log upload attempt details
    console.log('Attempting image upload:', {
      url: `${process.env.NEXT_PUBLIC_BE_URL}/api/events/upload-image`,
      hasAuthToken: !!authToken,
      authTokenPreview: authToken ? `${authToken.substring(0, 20)}...` : 'none',
      appId: process.env.NEXT_PUBLIC_APPLICATION_ID,
      fileName: uniqueFilename,
      fileSize: file.size,
      fileType: file.type
    });
    
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
    console.error('Upload error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        headers: error.config?.headers,
        appId: process.env.NEXT_PUBLIC_APPLICATION_ID,
        hasAuthToken: !!authToken
      }
    });
    
    // Log the actual error message from backend
    if (error.response?.data) {
      console.error('Backend error response:', JSON.stringify(error.response.data, null, 2));
    }
    
    // Provide more specific error messages
    if (error.response?.status === 403) {
      throw new Error('Authentication failed. Please try logging out and back in.');
    } else if (error.response?.status === 401) {
      throw new Error('Not authorized. Please check your login status.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to upload image. Please try again.');
    }
  }
};
