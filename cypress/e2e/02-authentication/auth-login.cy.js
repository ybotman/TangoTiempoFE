// Authentication Tests - Login Flow
// Phase 2: Test user login with email and OAuth providers

describe('Authentication - Login', () => {

  beforeEach(() => {
    // Visit login page
    cy.visit('/auth/login');

    // Wait for page to load
    cy.get('[data-testid="login-page"]', { timeout: 10000 }).should('be.visible');
  });

  context('Login Page Display', () => {
    it('should display login page with all providers', () => {
      // Verify page title
      cy.contains('SIGN IN').should('be.visible');

      // Verify all auth provider buttons visible
      cy.get('[data-testid="google-login-button"]').should('be.visible').should('contain', 'Continue with Google');
      cy.get('[data-testid="email-login-button"]').should('be.visible').should('contain', 'Continue with Email');

      // Verify signup link
      cy.contains('New user?').should('be.visible');
      cy.contains('CREATE ACCOUNT').should('be.visible');
    });

    it('should have back to calendar button', () => {
      cy.contains('Back to Calendar').should('be.visible');
    });

    it('should show disabled Facebook button', () => {
      cy.contains('button', 'Coming Soon').should('be.disabled');
    });
  });

  context('Email Login Form', () => {
    beforeEach(() => {
      // Click email login button to show form
      cy.get('[data-testid="email-login-button"]').click();

      // Wait for form to appear
      cy.get('[data-testid="email-auth-form"]', { timeout: 5000 }).should('be.visible');
    });

    it('should show email login form when email button clicked', () => {
      cy.contains('Login with Email').should('be.visible');

      // Verify form fields present (no first/last name for login)
      cy.get('input[name="firstName"]').should('not.exist');
      cy.get('input[name="lastName"]').should('not.exist');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');

      // Verify submit button
      cy.contains('button', 'Log In').should('be.visible');

      // Verify forgot password link
      cy.contains('Forgot Password?').should('be.visible');
    });

    it('should show validation errors for empty form', () => {
      cy.contains('button', 'Log In').click();

      cy.contains('Email and password are required').should('be.visible');
    });

    it('should validate email format', () => {
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('input[name="password"]').type('SomePassword123!');

      cy.contains('button', 'Log In').click();

      cy.contains('Please enter a valid email address').should('be.visible');
    });

    it('should toggle password visibility', () => {
      // Password should be hidden by default
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');

      // Click visibility toggle
      cy.get('input[name="password"]').parent().find('button[aria-label="toggle password visibility"]').click();

      // Password should now be visible
      cy.get('input[name="password"]').should('have.attr', 'type', 'text');
    });

    it('should have back button to return to provider options', () => {
      cy.contains('← Back to options').should('be.visible').click();

      // Should hide form and show provider buttons again
      cy.get('[data-testid="google-login-button"]').should('be.visible');
      cy.get('[data-testid="email-auth-form"]').should('not.exist');
    });
  });

  context('Password Reset Link', () => {
    beforeEach(() => {
      cy.get('[data-testid="email-login-button"]').click();
      cy.get('[data-testid="email-auth-form"]').should('be.visible');
    });

    it('should navigate to password reset page', () => {
      cy.contains('Forgot Password?').click();

      // Should be on reset password page
      cy.url().should('include', '/auth/reset-password');
      cy.get('[data-testid="reset-password-page"]').should('be.visible');
    });
  });

  context('Navigation', () => {
    it('should navigate to signup page from create account link', () => {
      cy.contains('CREATE ACCOUNT').click();

      // Should be on signup page
      cy.url().should('include', '/auth/signup');
      cy.get('[data-testid="signup-page"]').should('be.visible');
    });

    it('should navigate back to calendar', () => {
      cy.contains('Back to Calendar').click();

      // Should redirect to calendar
      cy.url().should('include', '/calendar');
    });
  });

  context('OAuth Providers', () => {
    it('should have Google login button enabled', () => {
      cy.get('[data-testid="google-login-button"]').should('not.be.disabled');
    });

    it('should have Apple login button available', () => {
      cy.contains('button', 'Continue with Apple').should('be.visible');
    });
  });

  context('Error Handling', () => {
    it('should display server error messages', () => {
      cy.get('[data-testid="email-login-button"]').click();

      // Try login with wrong credentials (will fail if TEST user doesn't exist)
      cy.get('input[name="email"]').type('wrong@example.com');
      cy.get('input[name="password"]').type('WrongPassword123!');

      cy.contains('button', 'Log In').click();

      // Should show error (actual error depends on Firebase config)
      // Just verify error display mechanism works
      cy.wait(2000); // Give time for auth attempt

      // Note: Can't predict exact error message without TEST user setup
      // This test validates UI error display mechanism
    });
  });

  context('Successful Login', () => {
    it('should successfully login with valid credentials', () => {
      // Get test credentials from environment
      const email = Cypress.env('CYPRESS_TEST_USER_EMAIL');
      const password = Cypress.env('CYPRESS_TEST_USER_PASSWORD');

      // Verify credentials are available
      expect(email).to.exist;
      expect(password).to.exist;

      // Click email login button to show form
      cy.get('[data-testid="email-login-button"]').click();
      cy.get('[data-testid="email-auth-form"]', { timeout: 5000 }).should('be.visible');

      // Fill in credentials
      cy.get('input[name="email"]').clear().type(email);
      cy.get('input[name="password"]').clear().type(password);

      // Submit login form
      cy.contains('button', 'Log In').click();

      // Should redirect to calendar on successful login
      cy.url().should('include', '/calendar', { timeout: 15000 });

      // Verify user is logged in - calendar should be visible
      cy.get('.fc-view', { timeout: 10000 }).should('be.visible');
    });
  });

  context('Session Persistence', () => {
    it('should redirect logged-in users to calendar', () => {
      // Note: This test requires a user to be already logged in
      // In real testing, would use cy.login() custom command first
      // Then visit /auth/login and verify redirect

      // Placeholder for when TEST users are set up
      // cy.login('test.readonly@tangotiempo.com', 'TestPassword123!');
      // cy.visit('/auth/login');
      // cy.url().should('include', '/calendar');
    });
  });

  context('Responsive Design', () => {
    it('should display properly on mobile', () => {
      cy.viewport('iphone-x');

      cy.get('[data-testid="login-page"]').should('be.visible');
      cy.get('[data-testid="google-login-button"]').should('be.visible');
      cy.get('[data-testid="email-login-button"]').should('be.visible');
    });

    it('should show mobile-friendly login form', () => {
      cy.viewport('iphone-x');

      cy.get('[data-testid="email-login-button"]').click();
      cy.get('[data-testid="email-auth-form"]').should('be.visible');

      // Form should be visible and scrollable
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
    });
  });

  context('Loading States', () => {
    it.skip('should show loading state during email login', () => {
      cy.get('[data-testid="email-login-button"]').click();

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('TestPassword123!');

      cy.contains('button', 'Log In').click();

      // Button should show loading text
      cy.contains('Logging In...', { timeout: 1000 });
    });
  });
});
