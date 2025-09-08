import { test, expect } from '../fixtures/test-base';

test.describe('Team Member Persistence', () => {
  test.use({ 
    setupDefaultTeam: false,
    clearAllData: true 
  });

  test('should persist team members after adding them', async ({ page, teamConfigPage }) => {
    // Create initial team through the welcome flow
    await page.goto('/');
    
    // Should see welcome screen since no team exists
    await expect(page.locator('text="Welcome to Roadmapster!"')).toBeVisible({ timeout: 10000 });
    
    // Click Create Your Team button
    await page.click('button:has-text("Create Your Team")');
    
    // Wait for modal
    await page.waitForSelector('.modal-content', { timeout: 5000 });
    
    // Fill team name
    const teamNameInput = page.locator('input#team-name, [data-testid="team-name-input"]');
    await teamNameInput.fill('Test Team for Members');
    
    // Check if member input is visible and add members
    const memberNameInput = page.locator('input[placeholder="Member name"]');
    const addMemberButton = page.locator('button:has-text("Add Member")');
    
    // Add first member
    console.log('Adding first member...');
    await memberNameInput.fill('Alice Johnson');
    await addMemberButton.click();
    await page.waitForTimeout(500);
    
    // Add second member
    console.log('Adding second member...');
    await memberNameInput.fill('Bob Smith');
    await addMemberButton.click();
    await page.waitForTimeout(500);
    
    // Add third member
    console.log('Adding third member...');
    await memberNameInput.fill('Carol Davis');
    await addMemberButton.click();
    await page.waitForTimeout(500);
    
    // Take screenshot before saving
    await page.screenshot({ path: 'before-save-team.png' });
    
    // Save team configuration
    const saveButton = page.locator('button:has-text("Create Team"), button:has-text("Save Configuration")');
    await saveButton.click();
    
    // Wait for modal to close
    await page.waitForSelector('.modal-content', { state: 'hidden', timeout: 5000 });
    
    // Team should be created and visible
    await expect(page.locator('.team-info')).toBeVisible({ timeout: 5000 });
    
    // Wait a bit for data to persist
    await page.waitForTimeout(1000);
    
    // Refresh the page to ensure data persists
    await page.reload();
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Team info should still be visible after refresh
    await expect(page.locator('.team-info')).toBeVisible({ timeout: 5000 });
    
    // Open team configuration to check members
    await teamConfigPage.openTeamConfig();
    
    // Take screenshot of reopened config
    await page.screenshot({ path: 'after-reload-team-config.png' });
    
    // Check if members are visible
    const memberItems = page.locator('.team-member-item');
    const memberCount = await memberItems.count();
    
    console.log('Total members found after reload:', memberCount);
    
    // Log each member found
    const foundMembers = [];
    for (let i = 0; i < memberCount; i++) {
      const memberText = await memberItems.nth(i).textContent();
      console.log(`Member ${i + 1}:`, memberText);
      foundMembers.push(memberText);
    }
    
    // Check for specific members
    const aliceVisible = foundMembers.some(m => m?.includes('Alice Johnson'));
    const bobVisible = foundMembers.some(m => m?.includes('Bob Smith'));
    const carolVisible = foundMembers.some(m => m?.includes('Carol Davis'));
    
    console.log('Alice visible:', aliceVisible);
    console.log('Bob visible:', bobVisible);
    console.log('Carol visible:', carolVisible);
    
    // At least some members should be visible
    expect(memberCount).toBeGreaterThan(0);
    expect(aliceVisible || bobVisible || carolVisible).toBeTruthy();
    
    // Close config
    await teamConfigPage.closeTeamConfig();
  });

  test('should update team members correctly', async ({ page, teamConfigPage }) => {
    // Create initial team
    await page.goto('/');
    
    // Should see welcome screen
    await expect(page.locator('text="Welcome to Roadmapster!"')).toBeVisible({ timeout: 10000 });
    
    // Create team with one member
    await page.click('button:has-text("Create Your Team")');
    await page.waitForSelector('.modal-content', { timeout: 5000 });
    
    const teamNameInput = page.locator('input#team-name, [data-testid="team-name-input"]');
    await teamNameInput.fill('Update Test Team');
    
    // Add initial member
    const memberNameInput = page.locator('input[placeholder="Member name"]');
    const addMemberButton = page.locator('button:has-text("Add Member")');
    
    await memberNameInput.fill('Initial Member');
    await addMemberButton.click();
    await page.waitForTimeout(500);
    
    // Save team
    const saveButton = page.locator('button:has-text("Create Team")');
    await saveButton.click();
    await page.waitForSelector('.modal-content', { state: 'hidden', timeout: 5000 });
    
    // Reopen config to add more members
    await teamConfigPage.openTeamConfig();
    
    // Add another member
    await memberNameInput.fill('Added Later Member');
    await addMemberButton.click();
    await page.waitForTimeout(500);
    
    // Save changes
    const updateButton = page.locator('button:has-text("Save Configuration")');
    await updateButton.click();
    await page.waitForSelector('.modal-content', { state: 'hidden', timeout: 5000 });
    
    // Reopen to verify
    await teamConfigPage.openTeamConfig();
    
    const memberItems = page.locator('.team-member-item');
    const memberCount = await memberItems.count();
    
    console.log('Members after update:', memberCount);
    
    // Should have at least 2 members now
    expect(memberCount).toBeGreaterThanOrEqual(2);
    
    await teamConfigPage.closeTeamConfig();
  });
});