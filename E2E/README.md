# E2E Testing with Cypress

This directory contains end-to-end tests using Cypress for the WishEat application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Copy `cypress.env.example.json` to `cypress.env.json`
   - Fill in your test credentials in `cypress.env.json`
   ```bash
   cp cypress.env.example.json cypress.env.json
   ```

   **Important**: Never commit `cypress.env.json` to version control as it contains sensitive information.

3. Required environment variables:
   - `googleEmail`: The email address of your test Google account
   - `googleClientId`: Your Google OAuth client ID
   - `googleClientSecret`: Your Google OAuth client secret
   - `googleRefreshToken`: Your Google OAuth refresh token
   - `dashboardPath`: The path to the dashboard page (default: "/dashboard")

## Running Tests

```bash
# Open Cypress Test Runner
npm run cypress:open

# Run tests in headless mode
npm run cypress:run

# Run tests with frontend and backend servers
npm run cypress:deploy

# Run tests in headless mode with servers
npm run cypress:deployAndRun
```

## Test Structure

- `e2e/`: Contains all test files
  - `login.cy.js`: Tests for login functionality including OAuth
- `support/`: Contains support files
  - `commands.js`: Custom Cypress commands
  - `e2e.js`: Configuration and global setup

## Best Practices

1. Use data-test attributes for element selection
2. Keep sensitive data in `cypress.env.json`
3. Use custom commands for common operations
4. Handle asynchronous operations properly 