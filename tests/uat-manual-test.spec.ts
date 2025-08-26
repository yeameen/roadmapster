import { test, expect, type Page } from '@playwright/test';

test.describe('Manual UAT: Q3 2025 Drag and Drop Investigation', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Enable console logging to see drag/drop debug output
    page.on('console', msg => {
      console.log(`🖥️  BROWSER: ${msg.text()}`);
    });
    
    // Clear localStorage for fresh start
    await page.goto('http://localhost:3001');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('Manual UAT: Quarter creation and drag-drop investigation', async () => {
    console.log('\n=== STEP 1: Initial State ===');
    await page.goto('http://localhost:3001');
    await page.waitForSelector('.quarters-panel', { timeout: 10000 });
    
    // Take initial screenshot
    await page.screenshot({ 
      path: '/Users/yeameen/src/personal/roadmapster/screenshots/uat-manual-01-initial.png',
      fullPage: true 
    });
    
    console.log('\n=== STEP 2: Create Q3 2025 ===');
    await page.click('.add-quarter-button');
    await page.waitForSelector('.modal-content');
    
    // Enter Q3 2025
    await page.fill('#name', '');
    await page.fill('#name', 'Q3 2025');
    
    // Take screenshot of quarter form
    await page.screenshot({ 
      path: '/Users/yeameen/src/personal/roadmapster/screenshots/uat-manual-02-form.png',
      fullPage: true 
    });
    
    await page.click('.save-button');
    await page.waitForSelector('.modal-content', { state: 'detached' });
    
    // Wait for Q3 to appear and take screenshot
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: '/Users/yeameen/src/personal/roadmapster/screenshots/uat-manual-03-q3-created.png',
      fullPage: true 
    });
    
    // Log the quarters that are available
    const quarterTitles = await page.locator('.quarter-title').allTextContents();
    console.log('✓ Available quarters:', quarterTitles);
    
    console.log('\n=== STEP 3: Investigate Drop Zones ===');
    
    // Get drop zone information
    const dropZones = await page.locator('[data-droppable-id]').count();
    console.log(`✓ Found ${dropZones} droppable zones`);
    
    // Get quarter drop zone IDs 
    const quarterDropIds = await page.locator('[data-droppable-id^="quarter-"]').allInnerTexts();
    console.log('✓ Quarter drop zone IDs:', quarterDropIds);
    
    console.log('\n=== STEP 4: Create Epic and Attempt Drag ===');
    
    // Add epic to backlog first
    await page.click('.add-epic-button');
    await page.waitForSelector('.modal-content');
    
    await page.fill('#title', 'UAT Test Epic');
    await page.selectOption('#size', 'M');
    await page.selectOption('#priority', 'P1');
    
    await page.click('.save-button');
    await page.waitForSelector('.modal-content', { state: 'detached' });
    
    // Take screenshot showing epic created
    await page.screenshot({ 
      path: '/Users/yeameen/src/personal/roadmapster/screenshots/uat-manual-04-epic-created.png',
      fullPage: true 
    });
    
    console.log('\n=== STEP 5: Manual Drag Test ===');
    
    // Let's pause here so we can manually inspect the elements
    console.log('🔍 Pausing for manual inspection...');
    
    // Log the current epic count in backlog
    const backlogCount = await page.locator('.epics-list .epic-card').count();
    console.log(`✓ Epics in backlog: ${backlogCount}`);
    
    // Log the epic IDs available for dragging
    const epicElements = await page.locator('.epics-list .epic-card').all();
    for (let i = 0; i < epicElements.length; i++) {
      const epicId = await epicElements[i].getAttribute('id');
      const epicText = await epicElements[i].locator('.epic-title').textContent();
      console.log(`✓ Epic ${i}: ID=${epicId}, Title=${epicText}`);
    }
    
    // Check Q2 2025 quarter drop zone
    const q2Quarter = page.locator('.quarter-container').nth(0).locator('.quarter-content');
    const q2DropId = await q2Quarter.getAttribute('data-droppable-id') || 'not found';
    console.log(`✓ Q2 2025 drop zone ID: ${q2DropId}`);
    
    // Check Q3 2025 quarter drop zone  
    const q3Quarter = page.locator('.quarter-container').nth(1).locator('.quarter-content');
    const q3DropId = await q3Quarter.getAttribute('data-droppable-id') || 'not found';
    console.log(`✓ Q3 2025 drop zone ID: ${q3DropId}`);
    
    console.log('\n=== ATTEMPTING DRAG TO Q3 2025 ===');
    
    // Try to drag the last epic to Q3 2025
    const lastEpic = page.locator('.epics-list .epic-card').last();
    
    // Use more specific targeting for drop zone
    const q3DropZone = page.locator('.quarter-container').nth(1);
    
    console.log('🎯 Starting drag operation...');
    
    // Perform the drag with more precision
    await lastEpic.hover();
    await page.mouse.down();
    await q3DropZone.hover();  
    await page.mouse.up();
    
    // Wait and take screenshot
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: '/Users/yeameen/src/personal/roadmapster/screenshots/uat-manual-05-after-drag.png',
      fullPage: true 
    });
    
    // Check results
    const finalBacklogCount = await page.locator('.epics-list .epic-card').count();
    const q3EpicCount = await page.locator('.quarter-container').nth(1).locator('.quarter-epics .epic-card').count();
    
    console.log(`✓ Final backlog count: ${finalBacklogCount}`);
    console.log(`✓ Q3 2025 epic count: ${q3EpicCount}`);
    
    if (q3EpicCount > 0) {
      console.log('✅ SUCCESS: Drag and drop worked!');
      const epicTitle = await page.locator('.quarter-container').nth(1).locator('.quarter-epics .epic-card .epic-title').first().textContent();
      console.log(`✓ Epic in Q3 2025: ${epicTitle}`);
    } else {
      console.log('❌ FAILURE: Drag and drop did not work');
    }
    
    console.log('\n=== FINAL STATE ANALYSIS ===');
    
    // Final screenshot
    await page.screenshot({ 
      path: '/Users/yeameen/src/personal/roadmapster/screenshots/uat-manual-06-final.png',
      fullPage: true 
    });
    
    // Test persistence
    await page.reload();
    await page.waitForSelector('.quarters-panel');
    
    const persistedQuarters = await page.locator('.quarter-container').count();
    const persistedQ3Epics = await page.locator('.quarter-container').nth(1).locator('.quarter-epics .epic-card').count();
    
    console.log(`✓ Persisted quarters: ${persistedQuarters}`);
    console.log(`✓ Persisted Q3 epics: ${persistedQ3Epics}`);
    
    console.log('\n🎯 UAT TEST COMPLETE');
  });
});