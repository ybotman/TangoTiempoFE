import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here

      // Priority order: CLI args > process.env > cypress.env.json > default
      config.baseUrl = process.env.CYPRESS_BASE_URL || process.env.NEXT_PUBLIC_FE_URL || config.env.baseUrl || 'http://localhost:3001';
      config.env.apiUrl = process.env.NEXT_PUBLIC_BE_URL || config.env.apiUrl || 'http://localhost:3010';

      return config;
    },
    baseUrl: 'http://localhost:3001',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    chromeWebSecurity: false,
    retries: {
      runMode: 2,
      openMode: 0
    },
    // Mochawesome reporter configuration
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/reports',
      overwrite: false,
      html: false,
      json: true,
      timestamp: 'mmddyyyy_HHMMss'
    }
  },

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
});
