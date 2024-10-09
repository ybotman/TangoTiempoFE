import { BlobServiceClient } from '@azure/storage-blob';

// Function to upload a file to Azure Blob Storage
export const uploadToBlob = async (file) => {
  // Use your Azure Storage connection string
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    '<Your Azure Blob Storage Connection String>'
  );
  const containerClient = blobServiceClient.getContainerClient('events-images'); // Name of your container

  // Create the container if it doesn't already exist
  await containerClient.createIfNotExists();

  // Create a block blob client
  const blobClient = containerClient.getBlockBlobClient(file.name); // You can also include a folder structure in the name

  // Upload the file
  await blobClient.uploadBrowserFile(file); // Upload the file from the browser

  // Return the URL of the uploaded blob
  return blobClient.url; // This URL can be saved to MongoDB for later access
};
