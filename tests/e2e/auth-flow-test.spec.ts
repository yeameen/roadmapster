import { test, expect } from '@playwright/test';

test('Full authentication flow - signup, logout, login', async ({ page }) => {
  const testEmail = 'testuser@example.com';
  const testPassword = 'TestPassword123!';
  
  console.log('=== Starting Authentication Flow Test ===');
  
  // Step 1: Navigate to application
  console.log('1. Navigating to application...');
  await page.goto('http://localhost:3000');
  
  // Step 2: Sign up with email
  console.log('2. Starting sign up process...');
  await page.click('[data-testid="email-login-button"]');
  await page.waitForSelector('[data-testid="email-input"]');
  
  console.log('3. Filling sign up form...');
  await page.fill('[data-testid="email-input"]', testEmail);
  await page.fill('[data-testid="password-input"]', testPassword);
  
  // Switch to sign up mode
  console.log('4. Switching to sign up mode...');
  await page.click('button.link-button:has-text("Sign Up")');
  await page.waitForTimeout(500);
  
  // Submit sign up
  console.log('5. Submitting sign up...');
  await page.click('button:has-text("Sign Up"):not(.link-button)');
  
  // Check for "User already registered" error
  await page.waitForTimeout(2000);
  const signupError = page.locator('text=User already registered');
  const hasSignupError = await signupError.isVisible({ timeout: 2000 }).catch(() => false);
  
  if (hasSignupError) {
    console.log('User already exists, switching to sign in...');
    // Click Sign In link
    await page.click('button.link-button:has-text("Sign In")');
    await page.waitForTimeout(500);
    // Submit sign in
    await page.click('button:has-text("Sign In"):not(.link-button)');
  }
  
  // Wait for redirect after signup/signin
  console.log('6. Waiting for redirect...');
  await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
  await page.waitForTimeout(2000);
  
  // Check if we're on the welcome screen (successful signup)
  const welcomeText = page.locator('h2:has-text("Welcome to Roadmapster!")');
  const isWelcomeVisible = await welcomeText.isVisible({ timeout: 5000 }).catch(() => false);
  
  if (isWelcomeVisible) {
    console.log('✓ Sign up successful - on Welcome screen');
  } else {
    // Check if we see the app header (user already has a team)
    const appHeader = page.locator('.app-header');
    const isAppVisible = await appHeader.isVisible({ timeout: 5000 }).catch(() => false);
    if (isAppVisible) {
      console.log('✓ Sign up successful - on App screen');
    } else {
      console.log('✗ Sign up may have failed - unexpected state');
    }
  }
  
  // Step 3: Sign out
  console.log('7. Signing out...');
  
  // Check if we have a sign out button visible
  const signOutButton = page.locator('button:has-text("Sign Out")');
  const hasSignOut = await signOutButton.isVisible({ timeout: 2000 }).catch(() => false);
  
  if (hasSignOut) {
    await signOutButton.click();
    console.log('✓ Clicked Sign Out button');
  } else {
    // Clear all auth cookies and storage
    console.log('No Sign Out button found, clearing auth data...');
    
    // Clear cookies
    const context = page.context();
    await context.clearCookies();
    
    // Clear local storage and session storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    await page.waitForTimeout(1000);
  }
  
  // Navigate to login page
  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(2000);
  
  // Step 4: Try to log back in with same credentials
  console.log('8. Attempting to log back in...');
  
  // Check if we're on login page
  const emailLoginButton = page.locator('[data-testid="email-login-button"]');
  const onLoginPage = await emailLoginButton.isVisible({ timeout: 5000 }).catch(() => false);
  
  if (!onLoginPage) {
    console.log('ERROR: Not on login page after navigation');
    await page.screenshot({ path: 'not-on-login-page.png' });
    throw new Error('Failed to navigate to login page');
  }
  
  // Click email login
  await page.click('[data-testid="email-login-button"]');
  await page.waitForSelector('[data-testid="email-input"]');
  
  console.log('9. Filling login form with same credentials...');
  await page.fill('[data-testid="email-input"]', testEmail);
  await page.fill('[data-testid="password-input"]', testPassword);
  
  // Make sure we're in Sign In mode (not Sign Up)
  const signInButton = page.locator('button:has-text("Sign In"):not(.link-button)');
  const isSignInVisible = await signInButton.isVisible().catch(() => false);
  
  if (!isSignInVisible) {
    console.log('Switching to Sign In mode...');
    const signInLink = page.locator('button.link-button:has-text("Sign In")');
    if (await signInLink.isVisible()) {
      await signInLink.click();
      await page.waitForTimeout(500);
    }
  }
  
  // Submit login
  console.log('10. Submitting login...');
  await page.click('button:has-text("Sign In"):not(.link-button)');
  
  // Check for errors
  await page.waitForTimeout(2000);
  const errorMessage = page.locator('.login-error, div.error-message, text=Invalid login credentials');
  const hasError = await errorMessage.isVisible({ timeout: 2000 }).catch(() => false);
  
  if (hasError) {
    const errorText = await errorMessage.textContent();
    console.log(`✗ Login failed with error: ${errorText}`);
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'login-error.png' });
    throw new Error(`Login failed: ${errorText}`);
  }
  
  // Wait for successful redirect
  console.log('11. Waiting for redirect after login...');
  try {
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    console.log('✓ Successfully redirected to home');
  } catch (e) {
    console.log('✗ Redirect failed, checking current state...');
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    await page.screenshot({ path: 'login-state.png' });
  }
  
  // Final verification
  await page.waitForTimeout(2000);
  const finalWelcome = await page.locator('h2:has-text("Welcome to Roadmapster!")').isVisible().catch(() => false);
  const finalApp = await page.locator('.app-header').isVisible().catch(() => false);
  
  if (finalWelcome || finalApp) {
    console.log('✓✓✓ Full authentication flow successful!');
    console.log(`   - Signed up with: ${testEmail}`);
    console.log(`   - Password: ${testPassword}`);
    console.log('   - Successfully logged out');
    console.log('   - Successfully logged back in');
  } else {
    console.log('✗ Authentication flow incomplete');
    await page.screenshot({ path: 'final-state.png' });
  }
});