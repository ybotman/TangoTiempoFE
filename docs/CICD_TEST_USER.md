# CI/CD Test User Configuration

**JIRA Ticket:** TIEMPO-299
**Date Created:** October 1, 2025

---

## Test Account Details

**Email:** `griffon.dater0g@icloud.com`
**Display Name:** CI/CD Test Admin
**Role:** Admin
**Environments:** **TEST ONLY** (NOT in PROD)

---

## Purpose

This account is used for **automated E2E testing** in GitHub Actions workflows. It enables:

- Authentication flow testing (login, logout, session management)
- Admin-level feature testing
- Role-based access control validation
- End-to-end user journey testing

---

## Environment Usage

| Environment | Usage | Notes |
|-------------|-------|-------|
| **LOCAL** | ❌ No | Not configured for local development |
| **TEST** | ✅ Yes | Primary environment for CI/CD testing |
| **PROD** | ❌ **NO** | **Never use in production** |

---

## Security Notes

1. **Password Storage:**
   - Password stored in GitHub Secrets: `CICD_TEST_PASSWORD`
   - Never commit password to repository
   - Rotate password quarterly

2. **Access Control:**
   - Account has Admin role in TEST environment only
   - Should be disabled or removed from PROD Firebase Auth
   - Monitor login attempts for unusual activity

3. **Cypress Fixture:**
   - Added to `cypress/fixtures/test-users.json` as `cicdAdmin`
   - Password placeholder: `NEEDS_PASSWORD` (actual password from GitHub Secrets)

---

## GitHub Actions Configuration

### Using the Test User

In GitHub Actions workflows, reference this user via environment variables:

```yaml
env:
  CYPRESS_TEST_USER_EMAIL: ${{ secrets.CICD_TEST_EMAIL }}
  CYPRESS_TEST_USER_PASSWORD: ${{ secrets.CICD_TEST_PASSWORD }}
```

### Required GitHub Secrets

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `CICD_TEST_EMAIL` | `griffon.dater0g@icloud.com` | Test user email |
| `CICD_TEST_PASSWORD` | `[secure password]` | Test user password |

---

## Cypress Test Usage

### Example: Login Test

```javascript
// Use the CI/CD admin user for authenticated tests
cy.fixture('test-users').then((users) => {
  const cicdUser = users.cicdAdmin;

  cy.visit('/auth/login');
  cy.get('[data-testid="email-login-button"]').click();
  cy.get('input[name="email"]').type(Cypress.env('TEST_USER_EMAIL'));
  cy.get('input[name="password"]').type(Cypress.env('TEST_USER_PASSWORD'));
  cy.get('button[type="submit"]').click();

  // Verify successful login
  cy.url().should('include', '/calendar');
});
```

---

## Maintenance

### Password Rotation

Rotate password every **3 months** or immediately if:
- Suspicious login activity detected
- Team member with access leaves
- Security audit recommends it

### Account Review

- **Monthly:** Verify account exists only in TEST environment
- **Quarterly:** Review login history in Firebase Auth
- **Annually:** Confirm account is still needed

---

## Troubleshooting

### Test Failures Due to Authentication

1. Verify account exists in TEST Firebase Auth
2. Check GitHub Secrets are correctly set
3. Confirm password hasn't expired
4. Verify account has Admin role in TEST

### Account Locked or Disabled

1. Check Firebase Auth console for account status
2. Review recent login attempts
3. Re-enable account if locked due to failed attempts
4. Update password if needed

---

## Related Documentation

- [TIEMPO-299](https://hdtsllc.atlassian.net/browse/TIEMPO-299) - E2E Cypress Testing Framework
- [TIEMPO-303](https://hdtsllc.atlassian.net/browse/TIEMPO-303) - Test Results Dashboard
- [Cypress Authentication Tests](../cypress/e2e/02-authentication/)
- [GitHub Actions Workflows](../.github/workflows/)

---

**Last Updated:** October 1, 2025
**Maintained By:** Development Team
