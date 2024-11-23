module.exports = {
  timeout: 30000,
  exit: true,
  recursive: true,
  require: ['dotenv/config'],
  reporter: 'spec',
  file: ['test/setup.js'],
  spec: [
    'test/basic.test.js',
    'test/controllers/**/*.test.js'
  ],
  slow: 5000,
  retries: 1,
  checkLeaks: true,
  forbidOnly: process.env.CI === 'true',
  color: true
}; 