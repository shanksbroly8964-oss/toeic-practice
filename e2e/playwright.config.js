const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  timeout: 45000,
  globalTimeout: 600000,
  expect: { timeout: 10000 },
  workers: 1,
  fullyParallel: false,
  use: {
    baseURL: 'http://127.0.0.1:8123',
    headless: true,
    screenshot: 'only-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 20000,
    viewport: { width: 1280, height: 800 },
  },
  webServer: {
    // Threaded server to avoid single-threaded head-of-line blocking that hung the previous run
    command: 'python -c "import http.server,socketserver; socketserver.ThreadingTCPServer.allow_reuse_address=True; httpd=socketserver.ThreadingTCPServer((\'127.0.0.1\',8123),http.server.SimpleHTTPRequestHandler); httpd.serve_forever()"',
    cwd: '..',
    url: 'http://127.0.0.1:8123/index.html',
    reuseExistingServer: false,
    timeout: 30000,
  },
  outputDir: 'test-results',
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
  reporter: [['list']],
});
