describe('Signup Modal', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('[data-test="login-button"]').click();
    cy.get('[data-test="switch-to-signup"]').click();
  });

  it('should display signup form correctly', () => {
    // Check form title and elements
    cy.get('[data-test="form-title"]').should('contain', 'Sign Up');
    cy.get('[data-test="username-input"]').should('be.visible');
    cy.get('[data-test="email-input"]').should('be.visible');
    cy.get('[data-test="password-input"]').should('be.visible');
    cy.get('[data-test="signup-submit"]').should('be.visible');
  });

  it('should validate username field', () => {
    // Empty username
    cy.get('[data-test="username-input"]').focus();
    cy.get('[data-test="username-input"]').blur();
    cy.get('[data-test="username-error"]').should('be.visible');
    cy.get('[data-test="username-error"]').should('contain', 'Username is required');

    // Short username
    cy.get('[data-test="username-input"]').type('ab');
    cy.get('[data-test="username-input"]').blur();
    cy.get('[data-test="username-error"]').should('be.visible');
    cy.get('[data-test="username-error"]').should('contain', 'Username must be at least 3 characters long');

    // Valid username
    cy.get('[data-test="username-input"]').clear();
    cy.get('[data-test="username-input"]').type('validuser');
    cy.get('[data-test="username-input"]').blur();
    cy.get('[data-test="username-error"]').should('not.exist');
  });

  it('should validate email field', () => {
    // Empty email
    cy.get('[data-test="email-input"]').focus();
    cy.get('[data-test="email-input"]').blur();
    cy.get('[data-test="email-error"]').should('be.visible');
    cy.get('[data-test="email-error"]').should('contain', 'Email is required');

    // Invalid email format
    cy.get('[data-test="email-input"]').type('invalid-email');
    cy.get('[data-test="email-input"]').blur();
    cy.get('[data-test="email-error"]').should('be.visible');
    cy.get('[data-test="email-error"]').should('contain', 'Email is invalid');

    // Valid email
    cy.get('[data-test="email-input"]').clear();
    cy.get('[data-test="email-input"]').type('valid@example.com');
    cy.get('[data-test="email-input"]').blur();
    cy.get('[data-test="email-error"]').should('not.exist');
  });

  it('should validate password field', () => {
    // Empty password
    cy.get('[data-test="password-input"]').focus();
    cy.get('[data-test="password-input"]').blur();
    cy.get('[data-test="password-error"]').should('be.visible');
    cy.get('[data-test="password-error"]').should('contain', 'Password is required');

    // Short password
    cy.get('[data-test="password-input"]').type('weak');
    cy.get('[data-test="password-input"]').blur();
    cy.get('[data-test="password-error"]').should('be.visible');
    cy.get('[data-test="password-error"]').should('contain', 'Password must be at least 6 characters long');

    // Password without required characters
    cy.get('[data-test="password-input"]').clear();
    cy.get('[data-test="password-input"]').type('password123');
    cy.get('[data-test="password-input"]').blur();
    cy.get('[data-test="password-error"]').should('be.visible');
    cy.get('[data-test="password-error"]').should('contain', 'Password must contain at least one uppercase letter, one lowercase letter, and one number');

    // Valid password
    cy.get('[data-test="password-input"]').clear();
    cy.get('[data-test="password-input"]').type('ValidPass123');
    cy.get('[data-test="password-input"]').blur();
    cy.get('[data-test="password-error"]').should('not.exist');
  });

  it('should toggle password visibility', () => {
    // Initial state - password hidden
    cy.get('[data-test="password-input"]').should('have.attr', 'type', 'password');
    
    // Toggle visibility on
    cy.get('[data-test="toggle-password"]').click();
    cy.get('[data-test="password-input"]').should('have.attr', 'type', 'text');
    
    // Toggle visibility off
    cy.get('[data-test="toggle-password"]').click();
    cy.get('[data-test="password-input"]').should('have.attr', 'type', 'password');
  });

  it('should handle successful signup', () => {
    // Mock successful signup response
    cy.intercept('POST', '**/auth/register', {
      statusCode: 200,
      body: { message: 'User registered successfully' }
    }).as('signupRequest');

    // Fill form with valid data
    cy.get('[data-test="username-input"]').type('testuser');
    cy.get('[data-test="email-input"]').type('test@example.com');
    cy.get('[data-test="password-input"]').type('ValidPass123');
    cy.get('[data-test="signup-submit"]').click();

    // Verify request and response
    cy.wait('@signupRequest');
    cy.url().should('include', '/profile');
  });

  it('should handle existing user error', () => {
    // Mock error response for existing user
    cy.intercept('POST', '**/auth/register', {
      statusCode: 400,
      body: { message: 'User already exists' }
    }).as('signupRequest');

    // Fill form with existing user data
    cy.get('[data-test="username-input"]').type('existinguser');
    cy.get('[data-test="email-input"]').type('existing@example.com');
    cy.get('[data-test="password-input"]').type('ValidPass123');
    cy.get('[data-test="signup-submit"]').click();

    // Verify error message
    cy.wait('@signupRequest');
    cy.get('[data-test="error-alert"]').should('be.visible');
    cy.get('[data-test="error-alert"]').should('contain', 'User already exists');
  });

  it('should switch back to login', () => {
    cy.get('[data-test="switch-to-login"]').click();
    cy.get('[data-test="form-title"]').should('contain', 'Login');
  });
});
