import { test, expect } from '@playwright/test';

test.describe('Q3 2025 Final Test', () => {
  test('Complete Q3 2025 creation and test drag-and-drop', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    console.log('Step 1: Creating Q3 2025 quarter...');
    
    // Click "Create Quarter" button
    await page.locator('button:has-text("Create Quarter")').click();
    await page.waitForTimeout(1000);
    
    // The form should already have Q3 2025 filled in, just click Create Quarter button
    await page.locator('button:has-text("Create Quarter")').last().click(); // The button in the modal
    await page.waitForTimeout(2000);
    
    // Take screenshot after creating Q3
    await page.screenshot({ 
      path: 'screenshots/q3-final-01-after-creating-q3.png',
      fullPage: true 
    });
    
    console.log('Step 2: Verifying Q3 2025 exists...');
    
    // Check if Q3 2025 quarter is now visible
    const q3Quarter = page.locator('text=Q3 2025');
    await expect(q3Quarter).toBeVisible({ timeout: 5000 });
    
    console.log('Step 3: Testing drag-and-drop to Q3 2025...');
    
    // Find first epic in backlog
    const firstEpic = page.locator('.epic-card').first();
    await expect(firstEpic).toBeVisible();
    
    // Find Q3 2025 drop zone - look for the quarter container
    const q3Container = page.locator('[data-testid*="quarter-1"]').first(); // Assuming Q3 gets ID 2
    
    // If that doesn't work, try alternative selectors
    const q3DropZone = q3Container.or(
      page.locator('text=Q3 2025').locator('..').locator('..')
    ).or(
      page.locator('.quarter-view').last()
    );
    
    if (await firstEpic.count() > 0) {
      console.log('Found epic to drag');
      
      // Use Playwright's built-in drag and drop
      await firstEpic.dragTo(q3DropZone);
      await page.waitForTimeout(2000);
      
      // Take screenshot after drag attempt
      await page.screenshot({ 
        path: 'screenshots/q3-final-02-after-drag.png',
        fullPage: true 
      });
      
      // Alternative drag method if the first one doesn't work
      if (await page.locator('.epic-card').count() === await page.locator('.backlog .epic-card').count()) {
        console.log('Trying manual drag-and-drop...');
        
        const epicBox = await firstEpic.boundingBox();
        const dropZoneBox = await q3DropZone.boundingBox();
        
        if (epicBox && dropZoneBox) {
          await page.mouse.move(epicBox.x + epicBox.width / 2, epicBox.y + epicBox.height / 2);
          await page.mouse.down();
          await page.waitForTimeout(500);
          
          await page.mouse.move(dropZoneBox.x + dropZoneBox.width / 2, dropZoneBox.y + dropZoneBox.height / 2);
          await page.waitForTimeout(500);
          
          await page.mouse.up();
          await page.waitForTimeout(2000);
          
          // Take screenshot after manual drag
          await page.screenshot({ 
            path: 'screenshots/q3-final-03-after-manual-drag.png',
            fullPage: true 
          });
        }
      }
    }
    
    console.log('Step 4: Analyzing final state...');
    
    // Count epics in backlog vs quarters
    const backlogEpics = await page.locator('.backlog .epic-card').count();
    const totalEpics = await page.locator('.epic-card').count();
    
    console.log(`Backlog epics: ${backlogEpics}, Total epics: ${totalEpics}`);
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'screenshots/q3-final-04-final-state.png',
      fullPage: true 
    });
    
    // Check for JavaScript errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Console error: ${msg.text()}`);
      }
    });
    
    page.on('pageerror', error => {
      console.log(`Page error: ${error.message}`);
    });
  });
});