// src/hooks/useImages.js
// Migration: Quinn - 2026-01-22 - Now uses apiUrlResolver for BE/AF switching

import { useState, useEffect, useCallback } from 'react';
import { BlobServiceClient } from '@azure/storage-blob';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';

export const useImages = (organizerId) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const accountName = 'tangotiempoimages';
  const containerName = 'organizer-images';

  // Fetch images from the container using SAS token
  const fetchImages = useCallback(async () => {
    if (!organizerId) return;

    const organizerFolder = `${organizerId}/`;
    setLoading(true);
    try {
      // Request SAS token from backend
      const response = await axios.post(`${getApiBaseUrl()}/api/organizers/generate-sas-token`);
      const { sasToken } = response.data;

      if (!sasToken) {
        throw new Error('Failed to retrieve SAS token');
      }

      // Create BlobServiceClient with SAS token
      const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net?${sasToken}`);

      const containerClient = blobServiceClient.getContainerClient(containerName);

      const blobs = [];
      const iterator = containerClient.listBlobsFlat({
        prefix: organizerFolder,
      });

      for await (const blob of iterator) {
        const blobClient = containerClient.getBlobClient(blob.name);
        const url = blobClient.url; // Blobs are public; no SAS token needed
        blobs.push({ name: blob.name, url });
      }
      setImages(blobs);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  }, [organizerId]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Upload image using SAS token
  const uploadImage = async (file) => {
    setLoading(true);
    try {
      // Request SAS token from backend
      const response = await axios.post(`${getApiBaseUrl()}/api/organizers/generate-sas-token`);
      const { sasToken } = response.data;

      if (!sasToken) {
        throw new Error('Failed to retrieve SAS token');
      }

      // Create BlobServiceClient with SAS token
      const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net?${sasToken}`);

      const containerClient = blobServiceClient.getContainerClient(containerName);

      const blobName = `${organizerId}/${uuidv4()}-${file.name}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.uploadData(file, {
        blobHTTPHeaders: { blobContentType: file.type },
      });

      // Get the URL of the uploaded blob
      // const imageUrl = blockBlobClient.url; // Since blobs are public, we can use this URL
// TIEMPO-276: Security cleanup - removed logging
      await fetchImages();
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setLoading(false);
    }
  };

  return { images, uploadImage, loading };
};
