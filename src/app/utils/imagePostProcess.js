// src/utils/imagePostProcess.js

export const imagePostProcess = async (file) => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        let orientation = 'square';
        if (width > height) orientation = 'landscape';
        else if (height > width) orientation = 'portrait';

        // Clean up
        URL.revokeObjectURL(objectUrl);

        resolve({
          fileSize: file.size,
          resolution: { width, height },
          orientation,
          isMobileFriendly: width >= 320 && height >= 480,
        });
      };
      img.onerror = (error) => {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      };
      img.src = objectUrl;
    } catch (error) {
      reject(error);
    }
  });
};
