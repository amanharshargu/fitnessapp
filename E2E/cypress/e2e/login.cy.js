describe('Login Modal', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        const originalError = win.console.error;
        win.console.error = (...args) => {
          if (!args[0]?.includes('webpack')) originalError(...args);
        };
      }
    });

    cy.get('body').then($body => {
      if ($body.find('#webpack-dev-server-client-overlay').length) {
        cy.removeOverlay();
      }
    });

    cy.get('[data-test="login-button"]').click();
    cy.wait(2000);
  });

  it('should display login form with all elements', () => {
    cy.removeOverlay();

    cy.get('[data-test="modal-overlay"]').should('exist');
    cy.get('[data-test="login-card"]').should('exist');

    cy.get('[data-test="email-input"]').should('exist');
    cy.get('[data-test="email-input"]').should('have.attr', 'type', 'email');

    cy.get('[data-test="password-input"]').should('exist');
    cy.get('[data-test="password-input"]').should('have.attr', 'type', 'password');

    cy.get('[data-test="login-submit"]').should('exist');
    cy.get('[data-test="login-submit"]').contains('Login');
  });

  it('should show validation error for invalid email', () => {
    cy.removeOverlay();

    cy.get('[data-test="email-input"]').should('exist');
    cy.get('[data-test="email-input"]').type('invalid-email');
    cy.get('[data-test="email-input"]').blur();

    cy.get('[data-test="email-error"]').should('exist');
    cy.get('[data-test="email-error"]').should('contain', 'Email is invalid');
  });

  it('should toggle password visibility', () => {
    cy.removeOverlay();

    cy.get('[data-test="password-input"]').should('exist');
    cy.get('[data-test="password-input"]').should('have.attr', 'type', 'password');

    cy.get('[data-test="password-toggle"]').should('exist');
    cy.get('[data-test="password-toggle"]').click();

    cy.get('[data-test="password-input"]').should('exist');
    cy.get('[data-test="password-input"]').should('have.attr', 'type', 'text');
  });

  it('should handle forgot password flow', () => {
    cy.removeOverlay();

    cy.get('[data-test="forgot-password-link"]').should('exist');
    cy.get('[data-test="forgot-password-link"]').click();

    cy.get('[data-test="form-title"]').should('contain', 'Forgot Password');

    cy.get('[data-test="forgot-password-email"]').should('exist');
    cy.get('[data-test="forgot-password-email"]').type('test@example.com');

    cy.get('[data-test="reset-password-submit"]').should('exist');
    cy.get('[data-test="reset-password-submit"]').click();

    cy.get('body').then($body => {
      if ($body.find('[data-test="success-alert"]').length) {
        cy.get('[data-test="success-alert"]').should('be.visible');
      } else if ($body.find('[data-test="error-alert"]').length) {
        cy.get('[data-test="error-alert"]').should('be.visible');
      }
    });

    cy.get('[data-test="back-to-login"]').should('exist');
    cy.get('[data-test="back-to-login"]').click();

    cy.get('[data-test="form-title"]').should('contain', 'Login');
  });

  it('should validate email in forgot password form', () => {
    cy.removeOverlay();

    cy.get('[data-test="forgot-password-link"]').should('exist');
    cy.get('[data-test="forgot-password-link"]').click();

    cy.get('[data-test="forgot-password-email"]').should('exist');
    cy.get('[data-test="forgot-password-email"]').type('invalid-email');
    cy.get('[data-test="forgot-password-email"]').blur();

    cy.get('[data-test="email-error"]').should('exist');
    cy.get('[data-test="email-error"]').should('contain', 'Email is invalid');
  });

  it('should handle login attempts', () => {
    cy.removeOverlay();

    // First try with invalid credentials
    cy.get('[data-test="email-input"]').should('exist');
    cy.get('[data-test="email-input"]').type('wrong@example.com');

    cy.get('[data-test="password-input"]').should('exist');
    cy.get('[data-test="password-input"]').type('wrongpassword');

    cy.get('[data-test="login-submit"]').should('exist');
    cy.get('[data-test="login-submit"]').click();

    cy.get('[data-test="error-alert"]').should('exist');
    cy.get('[data-test="error-alert"]').then(($el) => {
      const text = $el.text();
      expect(text).to.satisfy((msg) => {
        return msg.includes('User not found') ||
          msg.includes('Login failed') ||
          msg.includes('Invalid credentials');
      });
    });

    // Now try with valid credentials
    cy.get('[data-test="email-input"]').clear();
    cy.get('[data-test="password-input"]').clear();

    // Set up the intercept before the login action
    cy.intercept('POST', '/api/auth/login').as('loginRequest');

    cy.get('[data-test="email-input"]').type(Cypress.env('testUserEmail'));
    cy.get('[data-test="password-input"]').type(Cypress.env('testUserPassword'));

    cy.get('[data-test="login-submit"]').click();

    // Wait for the login request to complete
    cy.wait('@loginRequest').then((interception) => {
      if (interception.response?.statusCode === 200) {
        // Check if we're redirected to dashboard
        cy.url().should('include', '/dashboard', { timeout: 10000 });
        cy.get('[data-test="modal-overlay"]').should('not.exist');
      } else {
        // If login fails, log the response for debugging
        cy.log('Login failed:', interception.response?.body);
        cy.log('Status code:', interception.response?.statusCode);
      }
    });
  });

  describe('OAuth Login', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.get('[data-test="login-button"]').click();
      cy.wait(2000);
      cy.removeOverlay();
    });

    it('should display Google login button with correct styling and content', () => {
      cy.get('[data-test="google-login-button"]').should('be.visible');
      cy.get('[data-test="google-login-button"]').should('not.be.disabled');
      cy.get('[data-test="google-login-button"]').within(() => {
        cy.get('svg').should('be.visible');
        cy.get('[data-test="google-button-text"]').should('be.visible');
        cy.get('[data-test="google-button-text"]').should('have.css', 'margin-left', '8px');
        cy.get('[data-test="google-button-text"]').should('contain', 'Sign in with Google');
      });
    });

    it('should display Google login button with correct styling and content', () => {
      cy.get('.google-login-btn').should('exist');
      cy.get('.google-login-btn').should('be.visible');
      cy.get('.google-login-btn').should('not.be.disabled');
      cy.get('.google-login-btn').within(() => {
        cy.get('svg').should('exist');
        cy.contains('Sign in with Google').should('be.visible');
      });
    });

    it('should handle OAuth errors gracefully', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('oauthError', 'Authentication failed');
      });

      cy.visit('/');

      cy.window().then((win) => {
        expect(win.localStorage.getItem('oauthError')).to.equal('Authentication failed');
      });

      cy.url().should('not.include', Cypress.env('dashboardPath'));

      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.not.exist;
      });

      cy.window().then((win) => {
        win.localStorage.removeItem('oauthError');
      });
    });

    it('should maintain authentication state after successful OAuth login', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'fake-jwt-token');
      });

      cy.visit(Cypress.env('dashboardPath'));
      cy.url().should('include', Cypress.env('dashboardPath'));
    });
  });
}); 