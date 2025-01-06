// Webpack overlay removal command
Cypress.Commands.add("removeOverlay", () => {
  Cypress.$("#webpack-dev-server-client-overlay").remove();
});

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

// Custom command for checking if modal is hidden
Cypress.Commands.add('modalIsHidden', () => {
  cy.get('.modal-overlay').should('not.exist')
})

// Custom command for checking error messages
Cypress.Commands.add('checkErrorMessage', (message) => {
  cy.get('[data-testid="error-message"]').should('contain', message)
})

// Custom command for checking success messages
Cypress.Commands.add('checkSuccessMessage', (message) => {
  cy.get('[data-testid="success-message"]').should('contain', message)
})

// Custom command for checking if user is logged in
Cypress.Commands.add('isLoggedIn', () => {
  cy.window().its('localStorage').invoke('getItem', 'token').should('exist')
})

// Custom command for checking if user is logged out
Cypress.Commands.add('isLoggedOut', () => {
  cy.window().its('localStorage').invoke('getItem', 'token').should('not.exist')
})

// Custom command for logging out
Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    win.localStorage.clear()
  })
  cy.visit('/')
})

// Custom command for checking navigation
Cypress.Commands.add('checkNavigation', (path) => {
  cy.url().should('include', path)
}) 