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
import addContext from 'mochawesome-addcontext';

// Add screenshots to Mochawesome report context
afterEach(function() {
  if (this.currentTest && this.currentTest.state === 'failed') {
    // Get test title path for screenshot filename
    const titlePath = this.currentTest.titlePath();
    const testFile = Cypress.spec.name;

    // Cypress saves screenshots in format: specName/testTitle (failed).png
    // For retries: specName/testTitle (failed) (attempt N).png
    const screenshotBaseName = titlePath.slice(1).join(' -- ');

    // Add all potential screenshots (original + retries)
    const maxAttempts = 3; // Based on retries: { runMode: 2 } in config
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      let screenshotPath;
      if (attempt === 1) {
        screenshotPath = `screenshots/${testFile}/${screenshotBaseName} (failed).png`;
      } else {
        screenshotPath = `screenshots/${testFile}/${screenshotBaseName} (failed) (attempt ${attempt}).png`;
      }

      // Add screenshot link to Mochawesome context
      addContext(this, {
        title: attempt === 1 ? 'Screenshot (First Attempt)' : `Screenshot (Retry Attempt ${attempt})`,
        value: screenshotPath
      });
    }
  }
});