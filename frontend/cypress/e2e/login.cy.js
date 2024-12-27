describe('Login Modal', () => {
  beforeEach(() => {

    cy.visit('/', {
      onBeforeLoad(win) {

        const originalError = win.console.error
        win.console.error = (...args) => {
          if (!args[0]?.includes('webpack')) originalError(...args)
        }
      }
    })

    cy.get('body').then($body => {
      if ($body.find('#webpack-dev-server-client-overlay').length) {
        cy.removeOverlay()
      }
    })

    cy.get('.wisheat-header__btn.wisheat-header__btn--outline')
      .click({ force: true })
      .wait(2000)
  })

  it('should display login form with all elements', () => {

    cy.removeOverlay()



    cy.get('.modal-overlay').should('exist')
    cy.get('.card').should('exist')



    cy.get('input[name="email"]')
      .should('exist')
      .should('have.attr', 'type', 'email')



    cy.get('input[name="password"]')
      .should('exist')
      .should('have.attr', 'type', 'password')


    cy.get('button[type="submit"]')
      .should('exist')
      .contains('Login')
  })

  it('should show validation error for invalid email', () => {
    cy.removeOverlay()

    cy.get('input[name="email"]')
      .should('exist')
      .type('invalid-email', { force: true })

    cy.get('input[name="email"]').blur({ force: true })

    cy.get('.invalid-feedback')
      .should('exist')
      .should('contain', 'Email is invalid')
  })

  it('should toggle password visibility', () => {
    cy.removeOverlay()


    cy.get('input[name="password"]')
      .should('exist')
      .should('have.attr', 'type', 'password')

    cy.get('.password-toggle-btn')
      .should('exist')
      .click({ force: true })

    cy.get('input[name="password"]')
      .should('exist')
      .should('have.attr', 'type', 'text')
  })

  it('should handle forgot password flow', () => {
    cy.removeOverlay()

    cy.contains('Forgot password?')
      .should('exist')
      .click({ force: true })

    cy.get('h2').should('contain', 'Forgot Password')

    cy.get('#forgotPasswordEmail')
      .should('exist')
      .type('test@example.com', { force: true })

    cy.contains('button', 'Reset Password')
      .should('exist')
      .click({ force: true })

    cy.get('body').then($body => {
      if ($body.find('.alert-success').length) {
        cy.get('.alert-success').should('be.visible')
      } else if ($body.find('.alert-danger').length) {
        cy.get('.alert-danger').should('be.visible')
      }
    })

    cy.contains('Back to Login')
      .should('exist')
      .click({ force: true })

    cy.get('h2').should('contain', 'Login')
  })

  it('should validate email in forgot password form', () => {
    cy.removeOverlay()

    cy.contains('Forgot password?')
      .should('exist')
      .click({ force: true })

    cy.get('#forgotPasswordEmail')
      .should('exist')
      .type('invalid-email', { force: true })
      .blur({ force: true })

    cy.get('.invalid-feedback')
      .should('exist')
      .should('contain', 'Email is invalid')
  })

  it('should handle login attempts', () => {
    cy.removeOverlay()

    cy.get('input[name="email"]')
      .should('exist')
      .type('wrong@example.com', { force: true })

    cy.get('input[name="password"]')
      .should('exist')
      .type('wrongpassword', { force: true })

    cy.get('button[type="submit"]')
      .should('exist')
      .click({ force: true })

    cy.get('.alert-danger')
      .should('exist')
      .then(($el) => {
        const text = $el.text()
        expect(text).to.satisfy((msg) => {
          return msg.includes('User not found') ||
            msg.includes('Login failed') ||
            msg.includes('Invalid credentials')
        })
      })

    cy.get('input[name="email"]').clear({ force: true })
    cy.get('input[name="password"]').clear({ force: true })

    cy.get('input[name="email"]')
      .type('testUser@gmail.com', { force: true })
    cy.get('input[name="password"]')
      .type('Test@1234', { force: true })

    cy.get('button[type="submit"]')
      .click({ force: true })

    cy.url().should('include', '/dashboard', { timeout: 10000 })
      .then(() => {
        cy.get('.modal-overlay').should('not.exist')
      })
  })

  ///////////////OAuth Test/////////////

  describe('OAuth Login', () => {
    beforeEach(() => {
      cy.visit('/')
      cy.get('.wisheat-header__btn.wisheat-header__btn--outline')
        .click({ force: true })
      cy.wait(2000)
      cy.removeOverlay()
    })

    it('should display Google login button with correct styling and content', () => {
      cy.get('.google-login-btn')
        .should('exist')
        .should('be.visible')
        .should('not.be.disabled')
        .within(() => {
          cy.get('svg').should('exist')
          cy.contains('Sign in with Google')
            .should('be.visible')
            .should('have.css', 'padding-left', '4px')
        })
    })

    /* it('should handle successful OAuth callback', () => {
      // Set up authenticated state
      cy.loginByGoogleApi()

      // Try accessing protected route
      cy.visit('/dashboard')
      cy.url().should('include', '/dashboard')

      // Verify we're logged in
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.equal('fake-jwt-token')
      })
    }) */

    it('should handle OAuth errors gracefully', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('oauthError', 'Authentication failed')
      })

      cy.visit('/')

      cy.window().then((win) => {
        expect(win.localStorage.getItem('oauthError')).to.equal('Authentication failed')
      })

      cy.url().should('not.include', Cypress.env('dashboardPath'))

      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.not.exist
      })

      cy.window().then((win) => {
        win.localStorage.removeItem('oauthError')
      })
    })

    it('should maintain authentication state after successful OAuth login', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'fake-jwt-token')
      })

      cy.visit(Cypress.env('dashboardPath'))
      cy.url().should('include', Cypress.env('dashboardPath'))

      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.equal('fake-jwt-token')
      })

      cy.reload()
      cy.url().should('include', Cypress.env('dashboardPath'))
    })
  })
}) 