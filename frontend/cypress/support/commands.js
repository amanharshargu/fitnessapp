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