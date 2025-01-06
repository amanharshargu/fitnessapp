describe('Signup Modal', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.get('[data-test="login-button"]').click({ force: true })
    cy.get('[data-test="switch-to-signup"]').click()
  })

  it('displays signup form correctly', () => {
    cy.get('[data-test="form-title"]').should('contain', 'Sign Up')
    cy.get('[data-test="username-input"]').should('be.visible')
    cy.get('[data-test="email-input"]').should('be.visible')
    cy.get('[data-test="password-input"]').should('be.visible')
    cy.get('[data-test="signup-submit"]').should('be.visible')
  })

  it('validates empty fields', () => {
    cy.get('[data-test="signup-submit"]').click()
    cy.get('[data-test="username-error"]').should('contain', 'Username is required')
    cy.get('[data-test="email-error"]').should('contain', 'Email is required')
    cy.get('[data-test="password-error"]').should('contain', 'Password is required')
  })

  it('validates invalid email format', () => {
    cy.get('[data-test="email-input"]').type('invalid-email').blur()
    cy.get('[data-test="email-error"]').should('contain', 'Email is invalid')
  })

  it('validates password requirements', () => {
    cy.get('[data-test="password-input"]').type('weak').blur()
    cy.get('[data-test="password-error"]')
      .should('contain', 'Password must be at least 6 characters long')
  })

  it('handles successful signup', () => {
    cy.intercept('POST', '/auth/register', {
      statusCode: 200,
      body: { message: 'User registered successfully' }
    }).as('signupRequest')

    cy.get('[data-test="username-input"]').type('testuser')
    cy.get('[data-test="email-input"]').type('test@example.com')
    cy.get('[data-test="password-input"]').type('TestPass123')
    cy.get('[data-test="signup-submit"]').click()

    cy.wait('@signupRequest')
    cy.url().should('include', '/profile')
  })

  it('handles existing user error', () => {
    cy.intercept('POST', '/auth/register', {
      statusCode: 400,
      body: { message: 'User already exists' }
    }).as('signupRequest')

    cy.get('[data-test="username-input"]').type('existinguser')
    cy.get('[data-test="email-input"]').type('existing@example.com')
    cy.get('[data-test="password-input"]').type('TestPass123')
    cy.get('[data-test="signup-submit"]').click()

    cy.wait('@signupRequest')
    cy.get('[data-test="error-alert"]').should('contain', 'User already exists')
  })

  it('can switch back to login', () => {
    cy.get('[data-test="switch-to-login"]').click()
    cy.get('[data-test="form-title"]').should('contain', 'Login')
  })
})
