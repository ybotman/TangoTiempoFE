// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Define public environment variables
    env: {
        AZ_TANGO_API_URL: process.env.NEXT_PUBLIC_AZ_TANGO_API_URL,
    },

    // Webpack configuration for custom logging
    webpack: (config, { buildId, dev, isServer }) => {
        // Log the public environment variables
        console.log('AZ_TANGO_API_URL:', process.env.NEXT_PUBLIC_AZ_TANGO_API_URL);

        // Log build-specific information
        console.log('Build ID:', buildId);
        console.log('Development Mode:', dev);
        console.log('Server Build:', isServer);

        // Check for missing environment variables and log a warning
        if (!process.env.NEXT_PUBLIC_AZ_TANGO_API_URL) {
            console.warn('Warning: AZ_TANGO_API_URL is not defined!');
        }

        // Return the modified config
        return config;
    },

    // Any other Next.js configurations can be added here
    reactStrictMode: true, // Example of enabling strict mode
};

export default nextConfig;