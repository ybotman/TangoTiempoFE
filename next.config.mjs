/** @type {import('next').NextConfig} */
const nextConfig = {
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
      console.warn('Warning: NEXT_PUBLIC_BE_URL is not defined!');
    }

    // Return the modified config
    return config;
  },

  // Updated image configuration to allow external images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bostontangocalendar.com',
      },
    ],
  },

  // Add rewrites to route API calls to the backend server
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3010/api/:path*', // Proxy to your Express backend
      },
    ];
  },

  // Enable React strict mode
  reactStrictMode: true,
};

export default nextConfig;
