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

// Custom command for Google OAuth login
Cypress.Commands.add('loginByGoogleApi', () => {
  cy.log('Logging in with Google')

  // Verify required environment variables
  const clientId = Cypress.env('googleClientId')
  const clientSecret = Cypress.env('googleClientSecret')
  const refreshToken = Cypress.env('googleRefreshToken')

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Missing required Google OAuth credentials. Please set googleClientId, googleClientSecret, and googleRefreshToken in cypress.env.json'
    )
  }

  const options = {
    method: 'POST',
    url: 'https://www.googleapis.com/oauth2/v4/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: true,
    body: {
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken
    },
    failOnStatusCode: false
  }

  // First, try to get the access token
  cy.request(options).then((tokenResponse) => {
    if (tokenResponse.status !== 200) {
      throw new Error(`Failed to get access token: ${JSON.stringify(tokenResponse.body)}`)
    }

    const { access_token, id_token } = tokenResponse.body

    // Then, get the user info
    cy.request({
      method: 'GET',
      url: 'https://www.googleapis.com/oauth2/v3/userinfo',
      headers: { Authorization: `Bearer ${access_token}` },
      failOnStatusCode: false
    }).then((userResponse) => {
      if (userResponse.status !== 200) {
        throw new Error(`Failed to get user info: ${JSON.stringify(userResponse.body)}`)
      }

      // Set up authentication state
      cy.window().then((win) => {
        win.localStorage.setItem('token', id_token)
        win.localStorage.setItem('user', JSON.stringify({
          email: userResponse.body.email,
          given_name: userResponse.body.given_name,
          family_name: userResponse.body.family_name,
          picture: userResponse.body.picture
        }))
      })

      // Visit dashboard directly
      cy.visit('/dashboard')

      // Verify we're on dashboard
      cy.url().should('include', '/dashboard')
    })
  })
}) 