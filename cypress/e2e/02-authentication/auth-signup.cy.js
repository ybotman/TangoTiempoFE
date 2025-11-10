// Authentication Tests - Signup Flow
// Phase 2: Test user registration with email and OAuth providers

describe('Authentication - Signup', () => {

  beforeEach(() => {
    // Visit signup page
    cy.visit('/auth/signup');

    // Wait for page to load
    cy.get('[data-testid="signup-page"]', { timeout: 10000 }).should('be.visible');
  });

  context('Signup Page Display', () => {
    it.skip('should display signup page with all providers', () => {
      // Verify page title
      cy.contains('SIGN UP').should('be.visible');

      // Verify all auth provider buttons visible
      cy.get('[data-testid="google-signup-button"]').should('be.visible').should('contain', 'Continue with Google');
      cy.get('[data-testid="email-signup-button"]').should('be.visible').should('contain', 'Continue with Email');

      // Verify login link
      cy.contains('Already have an account?').should('be.visible');
      cy.contains('SIGN IN').should('be.visible');
    });

    it.skip('should have back to calendar button', () => {
      cy.contains('Back to Calendar').should('be.visible');
    });

    it.skip('should show disabled Facebook button with coming soon', () => {
      cy.contains('button', 'Coming Soon').should('be.disabled');
    });
  });

  context('Email Signup Form', () => {
    beforeEach(() => {
      // Click email signup button to show form
      cy.get('[data-testid="email-signup-button"]').click();

      // Wait for form to appear
      cy.get('[data-testid="email-auth-form"]', { timeout: 5000 }).should('be.visible');
    });

    it.skip('should show email signup form when email button clicked', () => {
      cy.contains('Create an Account').should('be.visible');

      // Verify all form fields present
      cy.get('input[name="firstName"]').should('be.visible');
      cy.get('input[name="lastName"]').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('input[name="confirmPassword"]').should('be.visible');

      // Verify submit button
      cy.contains('button', 'Sign Up').should('be.visible');
    });

    it.skip('should show validation errors for empty form submission', () => {
      // Try to submit empty form
      cy.contains('button', 'Sign Up').click();

      // Should show error
      cy.contains('Email and password are required').should('be.visible');
    });

    it.skip('should validate email format', () => {
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('input[name="password"]').type('TestPass123!');
      cy.get('input[name="confirmPassword"]').type('TestPass123!');

      cy.contains('button', 'Sign Up').click();

      cy.contains('Please enter a valid email address').should('be.visible');
    });

    it.skip('should validate password requirements', () => {
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('weak');  // Too short, no number
      cy.get('input[name="confirmPassword"]').type('weak');

      cy.contains('button', 'Sign Up').click();

      cy.contains('Password must be at least 8 characters').should('be.visible');
    });

    it.skip('should validate password confirmation match', () => {
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('TestPass123!');
      cy.get('input[name="confirmPassword"]').type('DifferentPass123!');

      cy.contains('button', 'Sign Up').click();

      cy.contains('Passwords do not match').should('be.visible');
    });

    it.skip('should require first and last name', () => {
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('TestPass123!');
      cy.get('input[name="confirmPassword"]').type('TestPass123!');

      cy.contains('button', 'Sign Up').click();

      cy.contains('First name and last name are required').should('be.visible');
    });

    it.skip('should toggle password visibility', () => {
      // Password should be hidden by default
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');

      // Click visibility toggle
      cy.get('input[name="password"]').parent().find('button[aria-label="toggle password visibility"]').click();

      // Password should now be visible
      cy.get('input[name="password"]').should('have.attr', 'type', 'text');
    });

    it.skip('should have back button to return to provider options', () => {
      cy.contains('← Back to options').should('be.visible').click();

      // Should hide form and show provider buttons again
      cy.get('[data-testid="google-signup-button"]').should('be.visible');
      cy.get('[data-testid="email-auth-form"]').should('not.exist');
    });
  });

  context('Navigation', () => {
    it.skip('should navigate to login page from signup link', () => {
      cy.contains('SIGN IN').click();

      // Should be on login page
      cy.url().should('include', '/auth/login');
      cy.get('[data-testid="login-page"]').should('be.visible');
    });

    it.skip('should navigate back to calendar', () => {
      cy.contains('Back to Calendar').click();

      // Should redirect to calendar
      cy.url().should('include', '/calendar');
    });
  });

  context('OAuth Providers', () => {
    it.skip('should attempt Google signup when button clicked', () => {
      // Note: Can't fully test OAuth flow in E2E (requires external popup)
      // But can verify button triggers action
      cy.get('[data-testid="google-signup-button"]').should('not.be.disabled');

      // Clicking will trigger Firebase OAuth popup (external)
      // In real environment this would open Google login
    });
  });

  context('Responsive Design', () => {
    it.skip('should display properly on mobile', () => {
      cy.viewport('iphone-x');

      cy.get('[data-testid="signup-page"]').should('be.visible');
      cy.get('[data-testid="google-signup-button"]').should('be.visible');
      cy.get('[data-testid="email-signup-button"]').should('be.visible');
    });

    it.skip('should show mobile-friendly form', () => {
      cy.viewport('iphone-x');

      cy.get('[data-testid="email-signup-button"]').click();
      cy.get('[data-testid="email-auth-form"]').should('be.visible');

      // Form should be scrollable and visible
      cy.get('input[name="firstName"]').should('be.visible');
    });
  });
});
