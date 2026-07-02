const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  timeout: 120000,
  expect: { timeout: 15000 },
  use: {
    baseURL: 'https://toeic-goku.web.app',
    headless: true,
    screenshot: 'only-on-failure',
    viewport: { width: 1280, height: 800 },
  },
  outputDir: 'test-results',
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
  reporter: [
    ['list'],
    ['html', { outputFolder: 'html-report' }],
  ],
});
