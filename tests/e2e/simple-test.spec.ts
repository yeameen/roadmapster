import { test, expect } from '../fixtures/test-base';

test.describe('Simple UI Test', () => {
  test('should load application and interact with basic elements', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the app title is visible
    await expect(page.locator('.app-title')).toContainText('Roadmapster');
    
    // Check that backlog section exists
    const backlog = page.locator('.backlog');
    await expect(backlog).toBeVisible();
    
    // Check that the Add Epic button exists
    const addEpicBtn = page.getByRole('button', { name: /add epic/i });
    await expect(addEpicBtn).toBeVisible();
    
    // Try clicking the Add Epic button
    await addEpicBtn.click();
    
    // Check that the modal appears
    const modal = page.locator('.modal-content');
    await expect(modal).toBeVisible();
    
    // Check that the form has the required fields
    await expect(page.locator('input#title')).toBeVisible();
    await expect(page.locator('select#size')).toBeVisible();
    await expect(page.locator('select#priority')).toBeVisible();
    
    // Close the modal
    const closeBtn = page.locator('.close-button');
    await closeBtn.click();
    
    // Check that modal is closed
    await expect(modal).not.toBeVisible();
  });
  
  test('should add a new epic', async ({ page, backlogPage }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get initial epic count
    const initialCount = await backlogPage.getEpicCount();
    
    // Add a new epic
    await backlogPage.addEpic({
      title: 'Test Epic',
      size: 'M',
      priority: 'P1',
      description: 'This is a test epic'
    });
    
    // Check that epic was added
    const newCount = await backlogPage.getEpicCount();
    expect(newCount).toBe(initialCount + 1);
    
    // Check that the epic is visible
    const epic = backlogPage.getEpicByTitle('Test Epic');
    await expect(epic).toBeVisible();
  });
});