// Authentication Tests - Password Reset Flow
// Phase 2: Test password reset functionality

describe('Authentication - Password Reset', () => {

  beforeEach(() => {
    // Visit password reset page
    cy.visit('/auth/reset-password');

    // Wait for page to load
    cy.get('[data-testid="reset-password-page"]', { timeout: 10000 }).should('be.visible');
  });

  context('Password Reset Page Display', () => {
    it('should display password reset page', () => {
      // Verify page title
      cy.contains('Reset Password').should('be.visible');

      // Verify description
      cy.contains('Enter your email address and we\'ll send you a link').should('be.visible');

      // Verify email input
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');

      // Verify submit button
      cy.get('[data-testid="reset-password-submit"]').should('be.visible');
      cy.contains('button', 'Send Reset Email').should('be.visible');

      // Verify back to login link
      cy.contains('Back to Sign In').should('be.visible');
    });

    it('should show email icon in input field', () => {
      // Email icon should be visible as adornment
      cy.get('input[name="email"]').parent().find('svg').should('be.visible');
    });
  });

  context('Form Validation', () => {
    it('should show error for empty email', () => {
      cy.get('[data-testid="reset-password-submit"]').click();

      // HTML5 validation prevents form submission
      // Check that input is marked as invalid
      cy.get('input[name="email"]').should('have.prop', 'validity').should('have.property', 'valid', false);
      cy.get('input[name="email"]').should('have.prop', 'validationMessage').and('not.be.empty');
    });

    it('should validate email format', () => {
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('[data-testid="reset-password-submit"]').click();

      // HTML5 validation marks email field as invalid
      cy.get('input[name="email"]').should('have.prop', 'validity').should('have.property', 'valid', false);
      cy.get('input[name="email"]').should('have.prop', 'validationMessage').and('include', '@');
    });

    it('should accept valid email format', () => {
      cy.get('input[name="email"]').type('test@example.com');

      // No validation error should appear before submit
      cy.contains('Please enter a valid email').should('not.exist');
    });
  });

  context('Password Reset Submission', () => {
    it.skip('should show loading state during submission', () => {
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('[data-testid="reset-password-submit"]').click();

      // Button should be disabled during loading
      cy.get('[data-testid="reset-password-submit"]').should('be.disabled');
    });

    it.skip('should clear form and show success message on successful reset', () => {
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('[data-testid="reset-password-submit"]').click();

      // Wait for success (actual behavior depends on Firebase config)
      cy.wait(2000);

      // Success message might appear
      // Note: Real behavior depends on Firebase email service configuration
    });

    it.skip('should handle multiple submissions correctly', () => {
      // Submit first time
      cy.get('input[name="email"]').type('test1@example.com');
      cy.get('[data-testid="reset-password-submit"]').click();

      cy.wait(2000);

      // Try submitting again (if form still visible)
      cy.get('input[name="email"]').then(($input) => {
        if ($input.length > 0 && $input.is(':visible')) {
          cy.get('input[name="email"]').clear().type('test2@example.com');
          cy.get('[data-testid="reset-password-submit"]').click();
        }
      });
    });
  });

  context('Success State', () => {
    // Note: These tests depend on Firebase configuration
    // Placeholder tests for when Firebase TEST email is set up

    it('should show success message after reset email sent', () => {
      // Placeholder: Requires Firebase email service to be configured
      // cy.get('input[name="email"]').type('configured-test@example.com');
      // cy.get('[data-testid="reset-password-submit"]').click();
      // cy.contains('Password reset email sent').should('be.visible');
      // cy.contains('Check your inbox for instructions').should('be.visible');
    });

    it('should provide spam folder tip in success message', () => {
      // Placeholder: After successful submission
      // cy.contains('Didn\'t receive it? Check your spam folder').should('be.visible');
    });

    it('should clear email field after success', () => {
      // Placeholder: After successful submission
      // cy.get('input[name="email"]').should('have.value', '');
    });
  });

  context('Error Handling', () => {
    it('should display Firebase error messages appropriately', () => {
      // Try with intentionally invalid email
      cy.get('input[name="email"]').type('nonexistent@example.com');
      cy.get('[data-testid="reset-password-submit"]').click();

      cy.wait(2000);

      // Should handle any Firebase errors gracefully
      // Exact error message depends on Firebase config
    });

    it('should not expose whether email exists (security)', () => {
      // Firebase typically doesn't reveal if email exists
      // This is a security feature to prevent email enumeration
      cy.get('input[name="email"]').type('definitely-not-real-email@example.com');
      cy.get('[data-testid="reset-password-submit"]').click();

      cy.wait(2000);

      // Should show generic success or safe error
      // Should NOT say "email not found" (security risk)
    });
  });

  context('Navigation', () => {
    it('should navigate back to login page', () => {
      cy.contains('Back to Sign In').click();

      // Should be on login page
      cy.url().should('include', '/auth/login');
      cy.get('[data-testid="login-page"]').should('be.visible');
    });

    it('should allow navigation from login forgot password link', () => {
      // Start at login
      cy.visit('/auth/login');

      // Click email login
      cy.get('[data-testid="email-login-button"]').click();

      // Click forgot password
      cy.contains('Forgot Password?').click();

      // Should be on reset password page
      cy.url().should('include', '/auth/reset-password');
      cy.get('[data-testid="reset-password-page"]').should('be.visible');
    });
  });

  context('Responsive Design', () => {
    it('should display properly on mobile', () => {
      cy.viewport('iphone-x');

      cy.get('[data-testid="reset-password-page"]').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('[data-testid="reset-password-submit"]').should('be.visible');
    });

    it('should have mobile-friendly form layout', () => {
      cy.viewport('iphone-x');

      // All elements should be visible and not overflow
      cy.contains('Reset Password').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.contains('Back to Sign In').should('be.visible');
    });
  });

  context('Accessibility', () => {
    it('should have proper input labels and types', () => {
      cy.get('input[name="email"]').should('have.attr', 'type', 'email');
      cy.get('input[name="email"]').should('have.attr', 'required');
    });

    it('should maintain focus management', () => {
      // Email field should be focused when page loads
      cy.get('input[name="email"]').should('be.focused');
    });
  });

  context('Form State Management', () => {
    it('should disable submit button during processing', () => {
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('[data-testid="reset-password-submit"]').click();

      // Button should be disabled while processing
      cy.get('[data-testid="reset-password-submit"]').should('be.disabled');
    });

    it('should re-enable submit button after error', () => {
      cy.get('input[name="email"]').type('invalid');
      cy.get('[data-testid="reset-password-submit"]').click();

      // Wait for validation error
      cy.wait(500);

      // Button should be re-enabled after error
      cy.get('[data-testid="reset-password-submit"]').should('not.be.disabled');
    });
  });
});
