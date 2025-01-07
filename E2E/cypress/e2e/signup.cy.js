describe('Signup Modal', () => {
  beforeEach(() => {

    cy.visit('/');
    cy.get('[data-test="login-button"]').click();
    cy.get('[data-test="modal-overlay"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-test="switch-to-signup"]').click();
    cy.get('[data-test="form-title"]').should('contain', 'Sign Up');
  });

  it('should display signup form correctly', () => {
    cy.get('[data-test="username-input"]').should('be.visible');
    cy.get('[data-test="email-input"]').should('be.visible');
    cy.get('[data-test="password-input"]').should('be.visible');
    cy.get('[data-test="signup-submit"]').should('be.visible');
  });

  it('should validate username field', () => {
    cy.get('[data-test="username-input"]').focus();
    cy.get('[data-test="username-input"]').blur();
    cy.get('[data-test="username-error"]').should('be.visible');
    cy.get('[data-test="username-error"]').should('contain', 'Username is required');

    cy.get('[data-test="username-input"]').type('ab');
    cy.get('[data-test="username-input"]').blur();
    cy.get('[data-test="username-error"]').should('be.visible');
    cy.get('[data-test="username-error"]').should('contain', 'Username must be at least 3 characters long');

    cy.get('[data-test="username-input"]').clear();
    cy.get('[data-test="username-input"]').type('validuser');
    cy.get('[data-test="username-input"]').blur();
    cy.get('[data-test="username-error"]').should('not.exist');
  });

  it('should validate email field', () => {
    cy.get('[data-test="email-input"]').focus();
    cy.get('[data-test="email-input"]').blur();
    cy.get('[data-test="email-error"]').should('be.visible');
    cy.get('[data-test="email-error"]').should('contain', 'Email is required');

    cy.get('[data-test="email-input"]').type('invalid-email');
    cy.get('[data-test="email-input"]').blur();
    cy.get('[data-test="email-error"]').should('be.visible');
    cy.get('[data-test="email-error"]').should('contain', 'Email is invalid');

    cy.get('[data-test="email-input"]').clear();
    cy.get('[data-test="email-input"]').type('valid@example.com');
    cy.get('[data-test="email-input"]').blur();
    cy.get('[data-test="email-error"]').should('not.exist');
  });

  it('should validate password field', () => {
    cy.get('[data-test="password-input"]').focus();
    cy.get('[data-test="password-input"]').blur();
    cy.get('[data-test="password-error"]').should('be.visible');
    cy.get('[data-test="password-error"]').should('contain', 'Password is required');

    cy.get('[data-test="password-input"]').type('weak');
    cy.get('[data-test="password-input"]').blur();
    cy.get('[data-test="password-error"]').should('be.visible');
    cy.get('[data-test="password-error"]').should('contain', 'Password must be at least 6 characters long');

    cy.get('[data-test="password-input"]').clear();
    cy.get('[data-test="password-input"]').type('password123');
    cy.get('[data-test="password-input"]').blur();
    cy.get('[data-test="password-error"]').should('be.visible');
    cy.get('[data-test="password-error"]').should('contain', 'Password must contain at least one uppercase letter, one lowercase letter, and one number');

    cy.get('[data-test="password-input"]').clear();
    cy.get('[data-test="password-input"]').type('ValidPass@123');
    cy.get('[data-test="password-input"]').blur();
    cy.get('[data-test="password-error"]').should('not.exist');
  });

  it('should toggle password visibility', () => {
    cy.get('[data-test="password-input"]').should('have.attr', 'type', 'password');
    
    cy.get('[data-test="toggle-password"]').click();
    cy.get('[data-test="password-input"]').should('have.attr', 'type', 'text');
    
    cy.get('[data-test="toggle-password"]').click();
    cy.get('[data-test="password-input"]').should('have.attr', 'type', 'password');
  });

  it('should handle successful signup', () => {
    cy.intercept('POST', '**/auth/register', {
      statusCode: 200,
      body: {
        message: 'User registered successfully',
        token: 'fake-jwt-token',
        user: {
          username: Cypress.env('testUsername'),
          email: Cypress.env('testEmail')
        }
      }
    }).as('signupRequest');

    cy.intercept('GET', '**/api/dashboard/user-details', {
      statusCode: 200,
      body: {
        username: Cypress.env('testUsername'),
        email: Cypress.env('testEmail')
      }
    }).as('userDetailsRequest');

    cy.get('[data-test="username-input"]').type(Cypress.env('testUsername'));
    cy.get('[data-test="email-input"]').type(Cypress.env('testEmail'));
    cy.get('[data-test="password-input"]').type(Cypress.env('testPassword'));
    cy.get('[data-test="signup-submit"]').click();

    // Wait for the signup request to complete
    cy.wait('@signupRequest').then((interception) => {
      // Verify we got the expected response
      expect(interception.response.statusCode).to.equal(200);
      
      // Check if token is present in response
      expect(interception.response.body).to.have.property('token');
      
      // Verify we're redirected to profile page
      cy.url().should('include', '/profile');
      
      // Wait for the user details request
      cy.wait('@userDetailsRequest');
      
      // Verify we stay on the profile page
      cy.url().should('include', '/profile');
    });
  });

  it('should handle existing user error', () => {
    cy.intercept('POST', '**/auth/register', {
      statusCode: 400,
      body: { message: 'User already exists' }
    }).as('signupRequest');

    cy.get('[data-test="username-input"]').type('existinguser');
    cy.get('[data-test="email-input"]').type('existing@example.com');
    cy.get('[data-test="password-input"]').type('ValidPass@123');
    cy.get('[data-test="signup-submit"]').click();

    cy.wait('@signupRequest');
    cy.get('[data-test="error-alert"]').should('be.visible');
    cy.get('[data-test="error-alert"]').should('contain', 'User already exists');
  });

  it('should switch back to login', () => {
    cy.get('[data-test="switch-to-login"]').click();
    cy.get('[data-test="form-title"]').should('contain', 'Login');
  });
});
