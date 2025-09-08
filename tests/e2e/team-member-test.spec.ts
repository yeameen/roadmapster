import { test, expect } from '@playwright/test';

test.describe('Team Member Management', () => {
  test('should create team and add members', async ({ page }) => {
    // Generate unique email for this test
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    // Navigate to login page
    await page.goto('http://localhost:3000/login');
    
    // Click email login button
    await page.click('[data-testid="email-login-button"]');
    
    // Sign up with new account
    await page.fill('[data-testid="email-input"]', testEmail);
    await page.fill('[data-testid="password-input"]', testPassword);
    
    // Click sign up button
    const signUpButton = page.locator('button:has-text("Sign Up")');
    await signUpButton.click();
    
    // Wait for navigation
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    
    // Should see welcome screen
    await expect(page.locator('text="Welcome to Roadmapster!"')).toBeVisible();
    
    // Click Create Your Team button
    await page.click('button:has-text("Create Your Team")');
    
    // Wait for modal
    await page.waitForSelector('.modal-content', { timeout: 5000 });
    
    // Fill team name
    const teamNameInput = page.locator('input#team-name, [data-testid="team-name-input"]');
    await teamNameInput.fill('Test Team with Members');
    
    // Try to add a team member
    const memberNameInput = page.locator('input[placeholder="Member name"]');
    if (await memberNameInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      console.log('Found member name input, adding member...');
      await memberNameInput.fill('Alice Johnson');
      
      // Click Add Member button
      const addMemberButton = page.locator('button:has-text("Add Member")');
      await addMemberButton.click();
      
      // Wait a bit for the member to be added to the UI
      await page.waitForTimeout(500);
      
      // Check if member appears in the list
      const memberInList = page.locator('text="Alice Johnson"');
      if (await memberInList.isVisible({ timeout: 1000 }).catch(() => false)) {
        console.log('Member added to UI successfully');
      } else {
        console.log('Member not visible in UI after adding');
      }
      
      // Add another member
      await memberNameInput.fill('Bob Smith');
      await addMemberButton.click();
      await page.waitForTimeout(500);
    }
    
    // Save team configuration
    const saveButton = page.locator('button:has-text("Create Team"), button:has-text("Save Configuration")');
    await saveButton.click();
    
    // Wait for modal to close
    await page.waitForSelector('.modal-content', { state: 'hidden', timeout: 5000 });
    
    // Team should be created and visible
    await expect(page.locator('.team-info')).toBeVisible();
    
    // Open team configuration again to check if members persisted
    const configButton = page.locator('button[aria-label="Team Configuration"], button:has-text("⚙️")');
    await configButton.click();
    
    // Wait for modal to open
    await page.waitForSelector('.modal-content', { timeout: 5000 });
    
    // Check if members are visible
    const aliceMember = page.locator('.team-member-item:has-text("Alice Johnson")');
    const bobMember = page.locator('.team-member-item:has-text("Bob Smith")');
    
    // Log what we find
    const aliceVisible = await aliceMember.isVisible({ timeout: 2000 }).catch(() => false);
    const bobVisible = await bobMember.isVisible({ timeout: 2000 }).catch(() => false);
    
    console.log('Alice visible after reopening:', aliceVisible);
    console.log('Bob visible after reopening:', bobVisible);
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'team-config-modal.png', fullPage: false });
    
    // Check the actual member count
    const memberItems = page.locator('.team-member-item');
    const memberCount = await memberItems.count();
    console.log('Total members found:', memberCount);
    
    // Log each member found
    for (let i = 0; i < memberCount; i++) {
      const memberText = await memberItems.nth(i).textContent();
      console.log(`Member ${i + 1}:`, memberText);
    }
    
    // Expectations
    expect(aliceVisible || bobVisible).toBeTruthy();
  });
});