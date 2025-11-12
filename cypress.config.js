import { defineConfig } from "cypress";
import cypressFailFast from 'cypress-fail-fast/plugin.js';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Install fail-fast plugin - stops after 10 failures
      cypressFailFast(on, config);

      // Priority order: CLI args > process.env > cypress.env.json > default
      config.baseUrl = process.env.CYPRESS_BASE_URL || process.env.NEXT_PUBLIC_FE_URL || config.env.baseUrl || 'http://localhost:3001';
      config.env.apiUrl = process.env.NEXT_PUBLIC_BE_URL || config.env.apiUrl || 'http://localhost:3010';

      // Test user credentials (can be overridden by environment variables)
      config.env.testUserEmail = process.env.CYPRESS_TEST_USER_EMAIL || config.env.testUserEmail || 'griffon.dater0g@icloud.com';
      config.env.testUserPassword = process.env.CYPRESS_TEST_USER_PASSWORD || config.env.testUserPassword || 'ENT!fmy9xwn!dqp8hzm';

      return config;
    },
    env: {
      FAIL_FAST_STRATEGY: 'run',  // Stop entire test run, not just current spec
      FAIL_FAST_BAIL: 9999,       // Temporarily disabled to see all failures
      // Test credentials for non-production environments (DEVL/TEST)
      testUserEmail: 'griffon.dater0g@icloud.com',
      testUserPassword: 'ENT!fmy9xwn!dqp8hzm'
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
