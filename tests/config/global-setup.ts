import { FullConfig } from '@playwright/test';

/**
 * Global setup that runs once before all tests
 * Following Playwright 1.55.0 best practices
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Roadmapster Integration Tests');
  console.log(`📁 Running tests from: ${config.rootDir}`);
  console.log(`🌐 Base URL: ${config.use?.baseURL || 'http://localhost:3000'}`);
  console.log(`💻 Workers: ${config.workers}`);
  
  // Set environment variables for test execution
  process.env.TEST_ENV = process.env.TEST_ENV || 'local';
  process.env.BASE_URL = config.use?.baseURL || 'http://localhost:3000';
  
  // Log test environment
  console.log(`🏷️  Environment: ${process.env.TEST_ENV}`);
  
  // You can add any one-time setup here like:
  // - Database seeding
  // - API token generation
  // - Test user creation
  
  // For CI environments, you might want to wait for the app to be ready
  if (process.env.CI) {
    console.log('⏳ Waiting for application to be ready in CI environment...');
    // Add health check logic here if needed
  }
  
  console.log('✅ Global setup completed\n');
}

export default globalSetup;