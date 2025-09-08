import { test, expect } from '@playwright/test';

test.describe('Team Configuration UAT Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Wait for the application to load
    await page.waitForSelector('.app-header');
  });

  test('Complete Team Configuration UAT Scenario', async ({ page }) => {
    // Test Case 1: Navigate to application and verify initial state
    await test.step('Verify application loads successfully', async () => {
      await expect(page.locator('.app-title')).toHaveText('Roadmapster');
      await expect(page.locator('button:has-text("Team Settings")')).toBeVisible();
    });

    // Test Case 2: Click on Team Settings button
    await test.step('Click Team Settings button and verify modal opens', async () => {
      await page.click('button:has-text("Team Settings")');
      
      // Verify modal opened
      await expect(page.locator('.modal-overlay')).toBeVisible();
      await expect(page.locator('h2:has-text("Team Configuration")')).toBeVisible();
    });

    // Test Case 3: Examine initial team configuration values
    await test.step('Verify initial team configuration values', async () => {
      // Check team name field (note: this is actually Quarter name based on the code)
      const teamNameInput = page.locator('[data-testid="team-name-input"]');
      await expect(teamNameInput).toHaveValue('Engineering Team');
      
      // Check working days
      const workingDaysInput = page.locator('[data-testid="working-days-input"]');
      await expect(workingDaysInput).toHaveValue('65');
      
      // Check buffer percentage
      const bufferInput = page.locator('[data-testid="buffer-percentage-input"]');
      await expect(bufferInput).toHaveValue('20');
      
      // Check oncall per sprint
      const oncallInput = page.locator('[data-testid="oncall-per-sprint-input"]');
      await expect(oncallInput).toHaveValue('1');
      
      // Check sprints in quarter
      const sprintsInput = page.locator('[data-testid="sprints-in-quarter-input"]');
      await expect(sprintsInput).toHaveValue('6');
      
      // Verify initial team members
      await expect(page.locator('.member-item')).toHaveCount(4);
      const memberNames = await page.locator('.member-name').allTextContents();
      expect(memberNames).toEqual(['Alice', 'Bob', 'Carol', 'Dan']);
    });

    // Test Case 4: Change team name (actually quarter name in the UI)
    await test.step('Change team name to "Engineering Team Alpha"', async () => {
      const teamNameInput = page.locator('[data-testid="team-name-input"]');
      await teamNameInput.fill('Engineering Team Alpha');
      await expect(teamNameInput).toHaveValue('Engineering Team Alpha');
    });

    // Test Case 5: Remove all existing team members
    await test.step('Remove all existing team members', async () => {
      // Get all remove buttons and click them
      const removeButtons = page.locator('.member-item .remove-member');
      const count = await removeButtons.count();
      
      for (let i = count - 1; i >= 0; i--) {
        await removeButtons.nth(i).click();
      }
      
      // Verify all members are removed
      await expect(page.locator('.member-item')).toHaveCount(0);
    });

    // Test Case 6: Add Alice Johnson with 5 vacation days
    await test.step('Add Alice Johnson with 5 vacation days', async () => {
      const nameInput = page.locator('.add-member input[type="text"]');
      await nameInput.fill('Alice Johnson');
      await page.click('.add-member .add-button');
      
      // Verify member was added
      await expect(page.locator('.member-item')).toHaveCount(1);
      await expect(page.locator('.member-name').first()).toHaveText('Alice Johnson');
      
      // Set vacation days
      const vacationInput = page.locator('.member-item .vacation-input').first();
      await vacationInput.fill('5');
      await expect(vacationInput).toHaveValue('5');
    });

    // Test Case 7: Add Bob Smith with 10 vacation days
    await test.step('Add Bob Smith with 10 vacation days', async () => {
      const nameInput = page.locator('.add-member input[type="text"]');
      await nameInput.fill('Bob Smith');
      await page.click('.add-member .add-button');
      
      // Verify member was added
      await expect(page.locator('.member-item')).toHaveCount(2);
      await expect(page.locator('.member-name').nth(1)).toHaveText('Bob Smith');
      
      // Set vacation days
      const vacationInput = page.locator('.member-item .vacation-input').nth(1);
      await vacationInput.fill('10');
      await expect(vacationInput).toHaveValue('10');
    });

    // Test Case 8: Add Carol Williams with 3 vacation days
    await test.step('Add Carol Williams with 3 vacation days', async () => {
      const nameInput = page.locator('.add-member input[type="text"]');
      await nameInput.fill('Carol Williams');
      await page.click('.add-member .add-button');
      
      // Verify member was added
      await expect(page.locator('.member-item')).toHaveCount(3);
      await expect(page.locator('.member-name').nth(2)).toHaveText('Carol Williams');
      
      // Set vacation days
      const vacationInput = page.locator('.member-item .vacation-input').nth(2);
      await vacationInput.fill('3');
      await expect(vacationInput).toHaveValue('3');
    });

    // Test Case 9: Set oncall rotation to 15
    await test.step('Set oncall per sprint to 15', async () => {
      const oncallInput = page.locator('[data-testid="oncall-per-sprint-input"]');
      await oncallInput.fill('15');
      await expect(oncallInput).toHaveValue('15');
    });

    // Test Case 10: Set buffer percentage to 25
    await test.step('Set buffer percentage to 25', async () => {
      const bufferInput = page.locator('[data-testid="buffer-percentage-input"]');
      await bufferInput.fill('25');
      await expect(bufferInput).toHaveValue('25');
    });

    // Test Case 11: Save the configuration
    await test.step('Save the configuration', async () => {
      await page.click('button:has-text("Save Configuration")');
      
      // Verify modal is closed
      await expect(page.locator('.modal-overlay')).not.toBeVisible();
    });

    // Test Case 12: Reload the page
    await test.step('Reload the page to test persistence', async () => {
      await page.reload();
      await page.waitForSelector('.app-header');
    });

    // Test Case 13: Open Team Settings again and verify all values
    await test.step('Verify all saved values persist after reload', async () => {
      // Open team settings modal again
      await page.click('button:has-text("Team Settings")');
      await expect(page.locator('.modal-overlay')).toBeVisible();
      
      // Verify all saved values
      const teamNameInput = page.locator('[data-testid="team-name-input"]');
      await expect(teamNameInput).toHaveValue('Engineering Team Alpha');
      
      const bufferInput = page.locator('[data-testid="buffer-percentage-input"]');
      await expect(bufferInput).toHaveValue('25');
      
      const oncallInput = page.locator('[data-testid="oncall-per-sprint-input"]');
      await expect(oncallInput).toHaveValue('15');
      
      // Verify team members
      await expect(page.locator('.member-item')).toHaveCount(3);
      
      const memberNames = await page.locator('.member-name').allTextContents();
      expect(memberNames).toEqual(['Alice Johnson', 'Bob Smith', 'Carol Williams']);
      
      // Verify vacation days
      const vacationInputs = page.locator('.member-item .vacation-input');
      await expect(vacationInputs.nth(0)).toHaveValue('5');
      await expect(vacationInputs.nth(1)).toHaveValue('10');
      await expect(vacationInputs.nth(2)).toHaveValue('3');
    });
  });

  test('Edge Cases and Error Scenarios', async ({ page }) => {
    // Test empty team member name
    await test.step('Test adding empty team member name', async () => {
      await page.click('button:has-text("Team Settings")');
      
      const nameInput = page.locator('.add-member input[type="text"]');
      await nameInput.fill('   '); // Just spaces
      await page.click('.add-member .add-button');
      
      // Should not add empty member
      await expect(page.locator('.member-item')).toHaveCount(4); // Still original members
    });

    // Test negative vacation days
    await test.step('Test negative vacation days validation', async () => {
      const vacationInput = page.locator('.member-item .vacation-input').first();
      await vacationInput.fill('-5');
      
      // Should be constrained by min="0" attribute
      const value = await vacationInput.inputValue();
      expect(parseInt(value)).toBeGreaterThanOrEqual(0);
    });

    // Test excessive vacation days
    await test.step('Test excessive vacation days', async () => {
      const vacationInput = page.locator('.member-item .vacation-input').first();
      const workingDays = await page.locator('[data-testid="working-days-input"]').inputValue();
      const maxDays = parseInt(workingDays) + 10; // Exceed working days
      
      await vacationInput.fill(maxDays.toString());
      // The form should accept this but the application logic should handle validation
    });

    // Test buffer percentage limits
    await test.step('Test buffer percentage boundary values', async () => {
      const bufferInput = page.locator('[data-testid="buffer-percentage-input"]');
      
      // Test 0%
      await bufferInput.fill('0');
      await expect(bufferInput).toHaveValue('0');
      
      // Test 100%
      await bufferInput.fill('100');
      await expect(bufferInput).toHaveValue('100');
      
      // Test over 100% (should be constrained by max="100")
      await bufferInput.fill('150');
      const value = await bufferInput.inputValue();
      expect(parseInt(value)).toBeLessThanOrEqual(100);
    });
  });

  test('UI Responsiveness and Usability', async ({ page }) => {
    await test.step('Test modal close functionality', async () => {
      // Open modal
      await page.click('button:has-text("Team Settings")');
      await expect(page.locator('.modal-overlay')).toBeVisible();
      
      // Test close button
      await page.click('.close-button');
      await expect(page.locator('.modal-overlay')).not.toBeVisible();
      
      // Test cancel button
      await page.click('button:has-text("Team Settings")');
      await expect(page.locator('.modal-overlay')).toBeVisible();
      await page.click('button:has-text("Cancel")');
      await expect(page.locator('.modal-overlay')).not.toBeVisible();
    });

    await test.step('Test keyboard navigation', async () => {
      await page.click('button:has-text("Team Settings")');
      
      // Test Enter key for adding member
      const nameInput = page.locator('.add-member input[type="text"]');
      await nameInput.fill('Test Member');
      await nameInput.press('Enter');
      
      // Should add member
      const members = page.locator('.member-item');
      await expect(members).toHaveCount(5); // 4 original + 1 new
    });

    await test.step('Test form field interactions', async () => {
      // Test that all form fields are focusable and editable
      const formFields = [
        '[data-testid="team-name-input"]',
        '[data-testid="working-days-input"]',
        '[data-testid="buffer-percentage-input"]',
        '[data-testid="oncall-per-sprint-input"]',
        '[data-testid="sprints-in-quarter-input"]'
      ];
      
      for (const field of formFields) {
        await page.focus(field);
        await expect(page.locator(field)).toBeFocused();
      }
    });
  });
});