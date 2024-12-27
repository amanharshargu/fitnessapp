// Custom command for login
Cypress.Commands.add('login', (email, password) => {
  cy.get('#loginEmail').type(email)
  cy.get('#loginPassword').type(password)
  cy.get('[data-testid="login-submit"]').click()
})

// Custom command for checking if modal is visible
Cypress.Commands.add('modalIsVisible', () => {
  cy.get('.modal-overlay').should('be.visible')
})

// Custom command for simulating authenticated state
Cypress.Commands.add('loginByGoogleApi', () => {
  cy.log('Setting up authenticated state')
  
  // Set up authenticated state
  cy.window().then((win) => {
    win.localStorage.setItem('token', 'fake-jwt-token')
  })

  // Refresh page to apply auth state
  cy.reload()

  // Verify auth state
  cy.window().then((win) => {
    expect(win.localStorage.getItem('token')).to.equal('fake-jwt-token')
  })
}) 