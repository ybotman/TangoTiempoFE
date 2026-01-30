// Resolve API backend: AF (Azure Functions) or BE (Express) based on feature flag
const afEnabled = process.env.NEXT_PUBLIC_AF_ENABLED === 'true';
const apiBackendUrl = afEnabled
  ? (process.env.NEXT_PUBLIC_AF_URL || 'http://localhost:7071')
  : (process.env.NEXT_PUBLIC_BE_URL || 'http://localhost:3010');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Webpack configuration for custom logging
  webpack: (config, { buildId, dev, isServer }) => {
    // Log the public environment variables
    console.log('API Backend:', afEnabled ? 'Azure Functions' : 'Express BE');
    console.log('API URL:', apiBackendUrl);

    // Log build-specific information
    console.log('Build ID:', buildId);
    console.log('Development Mode:', dev);
    console.log('Server Build:', isServer);

    // Return the modified config
    return config;
  },

  // Updated image configuration to allow external images including Azure Blob Storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bostontangocalendar.com',
      },
      {
        protocol: 'https',
        hostname: 'tangotiempoimages.blob.core.windows.net',
      },
      {
        protocol: 'https',
        hostname: 'tangotiempoimagesprod.blob.core.windows.net',
      },
      {
      protocol: 'https',
      hostname: 'i0.wp.com',
      },
            {
      protocol: 'https',
      hostname: 'tangotiempo-com.vercel.app',
    },
    ],
  },
  // Proxy /api/* calls to the active backend (AF or BE based on NEXT_PUBLIC_AF_ENABLED)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiBackendUrl}/api/:path*`,
      },
    ];
  },

  // Enable React strict mode
  reactStrictMode: true,
};

export default nextConfig;
