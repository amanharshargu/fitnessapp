const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3001',
    env: {
      apiUrl: 'http://localhost:3000',
      dashboardPath: '/dashboard',
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
      googleRefreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      googleEmail: process.env.GOOGLE_USER_EMAIL
    },
    setupNodeEvents(on, config) {
      config.env = {
        ...config.env,
        ...process.env
      }
      return config
    },
  },
}) 