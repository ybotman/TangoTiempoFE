/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.SITE_URL || 'https://www.tangotiempo.com', // Make sure this matches your site URL
  generateRobotsTxt: true, // Generates a robots.txt file
  sitemapSize: 7000, // Adjust according to your needs
  exclude: [],
  robotsTxtOptions: {
    additionalSitemaps: ['https://www.tangotiempo.com/sitemap-0.xml'],
  },
};

module.exports = config;
