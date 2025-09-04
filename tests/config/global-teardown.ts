import { FullConfig } from '@playwright/test';

/**
 * Global teardown that runs once after all tests
 * Following Playwright 1.55.0 best practices
 */
async function globalTeardown(config: FullConfig) {
  console.log('\n🏁 Finishing Roadmapster Integration Tests');
  
  // Clean up any resources created during tests
  // This could include:
  // - Removing test data from databases
  // - Closing connections
  // - Cleaning up temporary files
  // - Generating final reports
  
  if (process.env.CI) {
    console.log('📊 Test execution completed in CI environment');
    // You could upload artifacts or send notifications here
  }
  
  // Log test summary if available
  const testInfo = {
    environment: process.env.TEST_ENV || 'local',
    baseUrl: process.env.BASE_URL || config.use?.baseURL,
    timestamp: new Date().toISOString()
  };
  
  console.log('📋 Test Summary:', testInfo);
  console.log('✅ Global teardown completed');
}

export default globalTeardown;