import { Page } from '@playwright/test';

export async function loginAsTestUser(page: Page) {
  // Navigate to login page
  await page.goto('/login');
  
  // Click on email login button
  await page.click('[data-testid="email-login-button"]');
  
  // Create a test user or sign in
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'testpass123';
  
  // Fill in email and password
  await page.fill('[data-testid="email-input"]', testEmail);
  await page.fill('[data-testid="password-input"]', testPassword);
  
  // Check if we need to sign up first
  const signUpButton = page.locator('button:has-text("Sign Up")');
  if (await signUpButton.isVisible()) {
    // We're in sign-in mode, switch to sign-up
    await page.click('button:has-text("Sign Up")');
  }
  
  // Submit the form
  await page.click('[data-testid="submit-button"]');
  
  // Wait for navigation to complete
  await page.waitForURL('/', { timeout: 10000 });
  
  // Wait for the app to load
  await page.waitForSelector('.app-title', { timeout: 10000 });
  
  return { email: testEmail, password: testPassword };
}

export async function createAuthenticatedContext(page: Page) {
  // For reusable authentication across tests
  const testEmail = 'test@roadmapster.com';
  const testPassword = 'Test123456!';
  
  // Navigate to login
  await page.goto('/login');
  
  // Click email login
  await page.click('[data-testid="email-login-button"]');
  
  // Fill in credentials
  await page.fill('[data-testid="email-input"]', testEmail);
  await page.fill('[data-testid="password-input"]', testPassword);
  
  // First, check if we need to sign up by looking for the "Don't have an account?" text
  const signUpToggle = page.locator('text="Don\'t have an account?"');
  
  if (await signUpToggle.isVisible()) {
    // We're in sign-in mode, let's try to sign in first
    await page.click('[data-testid="submit-button"]');
    
    // Wait a bit to see if we get an error
    await page.waitForTimeout(1000);
    
    // Check if we got an error (user doesn't exist)
    const errorElement = page.locator('.login-error');
    if (await errorElement.isVisible()) {
      // User doesn't exist, switch to sign up
      await page.click('button:has-text("Sign Up")');
      
      // Fill credentials again (they should still be there, but just in case)
      await page.fill('[data-testid="email-input"]', testEmail);
      await page.fill('[data-testid="password-input"]', testPassword);
      
      // Sign up
      await page.click('[data-testid="submit-button"]');
    }
  } else {
    // We're already in sign-up mode, just submit
    await page.click('[data-testid="submit-button"]');
  }
  
  // Wait for navigation to complete
  await page.waitForLoadState('networkidle');
  
  // Check if we're on the welcome screen (no team yet)
  const welcomeText = page.locator('text="Welcome to Roadmapster!"');
  if (await welcomeText.isVisible({ timeout: 2000 }).catch(() => false)) {
    // We need to create a team
    await page.click('button:has-text("Create Your Team")');
    
    // Wait for modal to appear
    await page.waitForSelector('.modal-content', { timeout: 5000 });
    
    // Fill in team details
    const teamNameInput = page.locator('input#team-name, [data-testid="team-name-input"]');
    await teamNameInput.fill('Test Team');
    
    // Add a team member
    const memberNameInput = page.locator('input[placeholder="Member name"]');
    if (await memberNameInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await memberNameInput.fill('Test User');
      const addMemberButton = page.locator('button:has-text("Add Member")');
      await addMemberButton.click();
    }
    
    // Save team configuration - the button text changes based on create vs update
    const saveButton = page.locator('button:has-text("Create Team"), button:has-text("Save Configuration")');
    await saveButton.click();
    
    // Wait for modal to close
    await page.waitForSelector('.modal-content', { state: 'hidden', timeout: 5000 });
  }
  
  // Wait for the main app to load
  await page.waitForSelector('.app-title', { timeout: 10000 });
}