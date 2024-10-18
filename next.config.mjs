/** @type {import('next').NextConfig} */
const nextConfig = {
  // Define public environment variables
  //   env: {
  //       TangoTiempoBE_URL: process.env.NEXT_PUBLIC_BE_URL,
  //   },

  // Webpack configuration for custom logging
  webpack: (config, { buildId, dev, isServer }) => {
    // Log the public environment variables
    console.log('NEXT_PUBLIC_BE_URL:', process.env.NEXT_PUBLIC_BE_URL);

    // Log build-specific information
    console.log('Build ID:', buildId);
    console.log('Development Mode:', dev);
    console.log('Server Build:', isServer);

    // Check for missing environment variables and log a warning
    if (!process.env.NEXT_PUBLIC_BE_URL) {
      console.warn('Warning: TangoTiempoBE_URL is not defined!');
    }

    // Return the modified config
    return config;
  },

  // Image configuration to allow external images
  images: {
    domains: ['bostontangocalendar.com'], // Allow images from this domain
  },

  // Any other Next.js configurations can be added here
  reactStrictMode: true, // Example of enabling strict mode
};

export default nextConfig;
