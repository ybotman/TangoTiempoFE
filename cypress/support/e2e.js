// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Import cypress-fail-fast to stop after 10 failures
import 'cypress-fail-fast';

// ============================================
// Global Test Setup - Prevent Welcome Modal
// ============================================
/**
 * Set localStorage flags BEFORE window loads to prevent welcome modal
 * This runs before each page visit, ensuring flags are set early
 *
 * The welcome modal (TIEMPO-329) appears for:
 * - Visit 1: First-time visitor (full welcome)
 * - Visit 2: Welcome back
 * - Visits 5, 10, 15, 20...: Signup prompt
 *
 * By setting visit_count to 3 and welcome_shown to true, we bypass all modals
 */
Cypress.on('window:before:load', (win) => {
  // Prevent welcome modal from appearing
  win.localStorage.setItem('welcome_shown', 'true');

  // Set visit count to 3 to avoid welcome back (2) and signup prompts (5, 10, 15...)
  win.localStorage.setItem('visit_count', '3');

  console.log('[Cypress Global Setup] localStorage flags set BEFORE window load to prevent welcome modal');
});

// Add screenshot references to test context for Mochawesome
// Capture screenshots on BOTH success and failure to check for false positives
afterEach(function() {
  if (this.currentTest) {
    const testName = this.currentTest.title;
    const state = this.currentTest.state; // 'passed' or 'failed'

    // Capture screenshot for both passed and failed tests
    if (state === 'passed') {
      cy.screenshot(`${testName} (passed)`, { capture: 'viewport' });
    }

    // For failed tests, screenshots are auto-captured, just add to context
    if (state === 'failed') {
      const { screenshots = [] } = this.currentTest;
      if (screenshots.length > 0) {
        this.currentTest.context = this.currentTest.context || [];
        screenshots.forEach((screenshot, index) => {
          const relativePath = screenshot.path.replace(/.*\/cypress\//, '');
          this.currentTest.context.push({
            title: index === 0 ? 'Screenshot' : `Screenshot (Retry ${index})`,
            value: relativePath
          });
        });
      }
    }
  }
});