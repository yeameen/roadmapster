import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: [['html'], ['list'], ['json', { outputFile: 'test-results/results.json' }]],
  
  // Global setup and teardown
  globalSetup: require.resolve('./tests/config/global-setup'),
  globalTeardown: require.resolve('./tests/config/global-teardown'),
  
  // Test timeout
  timeout: 30 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15 * 1000,
    
    // Viewport size
    viewport: { width: 1280, height: 720 },
    
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
    
    // Collect trace for better debugging
    launchOptions: {
      slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
    },
  },

  projects: [
    {
      name: 'Desktop Chrome',
      use: { 
        ...devices['Desktop Chrome'],
        // Store authenticated state for faster test execution
        storageState: process.env.STORAGE_STATE_PATH,
      },
    },
    {
      name: 'Desktop Firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
  
  // Only run specific projects in CI
  ...(process.env.CI && {
    projects: [
      {
        name: 'Desktop Chrome',
        use: { ...devices['Desktop Chrome'] },
      },
    ],
  }),

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  
  // Output folder for test artifacts
  outputDir: 'test-results',
});