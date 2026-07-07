const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  timeout: 120000,
  expect: { timeout: 15000 },
  use: {
    baseURL: 'http://127.0.0.1:8123',
    headless: true,
    screenshot: 'only-on-failure',
    viewport: { width: 1280, height: 800 },
  },
  webServer: {
    command: 'python -m http.server 8123',
    cwd: '..',
    url: 'http://127.0.0.1:8123/index.html',
    reuseExistingServer: true,
    timeout: 60000,
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
