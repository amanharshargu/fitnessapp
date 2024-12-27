const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3001',
    env: {
      apiUrl: 'http://localhost:3000',
      googleOAuthPath: '/auth/google',
      googleCallbackPath: '/auth/google/callback',
      dashboardPath: '/dashboard',
      loginPath: '/login',
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
      googleRefreshToken: process.env.GOOGLE_REFRESH_TOKEN
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
}) 