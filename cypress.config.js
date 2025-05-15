import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      
      // Priority order: process.env > cypress.env.json > default value
      config.baseUrl = process.env.NEXT_PUBLIC_FE_URL || config.env.baseUrl || 'http://localhost:3003';
      config.env.apiUrl = process.env.NEXT_PUBLIC_BE_URL || config.env.apiUrl || 'http://localhost:3010';
      
      return config;
    },
  },

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
});
