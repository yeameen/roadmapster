import { test, expect } from '@playwright/test';

test.describe.skip('Create Q3 2025 and Test Drag-and-Drop (legacy debug spec - skipped)', () => {
  test('Create Q3 2025 quarter and test drag-and-drop functionality', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'screenshots/q3-test-01-initial.png',
      fullPage: true 
    });
    
    console.log('Step 1: Creating Q3 2025 quarter...');
    
    // Click "Create Quarter" button
    await page.locator('button:has-text("Create Quarter")').click();
    await page.waitForTimeout(1000);
    
    // Take screenshot of quarter form
    await page.screenshot({ 
      path: 'screenshots/q3-test-02-quarter-form.png',
      fullPage: true 
    });
    
    // Fill in Q3 2025 details
    const nameInput = page.locator('input[name="name"], input[placeholder*="name"]').first();
    await nameInput.fill('Q3 2025');
    
    const workingDaysInput = page.locator('input[name="workingDays"], input[type="number"]').first();
    if (await workingDaysInput.count() > 0) {
      await workingDaysInput.fill('65');
    }
    
    // Save the quarter
    const saveButton = page.locator('button:has-text("Create Epic")'); // This should be "Save" or "Create"
    if (await saveButton.count() > 0) {
      await saveButton.click();
    } else {
      // Try alternative selectors
      await page.locator('button[type="submit"], .save-button, .primary-button').first().click();
    }
    
    await page.waitForTimeout(2000);
    
    // Take screenshot after creating Q3
    await page.screenshot({ 
      path: 'screenshots/q3-test-03-after-creating-q3.png',
      fullPage: true 
    });
    
    console.log('Step 2: Testing drag-and-drop to Q3 2025...');
    
    // Find an epic in the backlog to drag
    const epic = page.locator('.epic-card, .epic, [data-testid*="epic"]').first();
    
    // Find Q3 2025 drop zone
    const q3DropZone = page.locator('[data-testid*="quarter"], .quarter-grid, .quarter-drop-zone').last(); // Assuming Q3 is the last one
    
    if (await epic.count() > 0 && await q3DropZone.count() > 0) {
      // Get bounding boxes
      const epicBox = await epic.boundingBox();
      const dropZoneBox = await q3DropZone.boundingBox();
      
      if (epicBox && dropZoneBox) {
        console.log('Performing drag-and-drop...');
        
        // Perform drag and drop
        await page.mouse.move(epicBox.x + epicBox.width / 2, epicBox.y + epicBox.height / 2);
        await page.mouse.down();
        await page.waitForTimeout(500);
        
        await page.mouse.move(dropZoneBox.x + dropZoneBox.width / 2, dropZoneBox.y + dropZoneBox.height / 2);
        await page.waitForTimeout(500);
        
        await page.mouse.up();
        await page.waitForTimeout(1000);
        
        // Take screenshot after drag attempt
        await page.screenshot({ 
          path: 'screenshots/q3-test-04-after-drag-attempt.png',
          fullPage: true 
        });
      }
    }
    
    console.log('Step 3: Analyzing final state...');
    
    // Check if the epic was successfully moved to Q3
    const q3Epics = page.locator('.quarter-grid .epic, [data-testid*="quarter"] .epic').last();
    const epicCount = await q3Epics.count();
    
    console.log(`Epics found in Q3 2025: ${epicCount}`);
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'screenshots/q3-test-05-final-state.png',
      fullPage: true 
    });
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Console error: ${msg.text()}`);
      }
    });
  });
});
