import { test, expect, type Page } from '@playwright/test';

test.describe('UAT: Q3 2025 Drag and Drop Functionality', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      console.log(`🖥️  BROWSER: ${msg.text()}`);
    });
    
    // Clear localStorage to ensure fresh start
    await page.goto('http://localhost:3001');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('Complete Q3 2025 Drag and Drop UAT Test', async () => {
    console.log('\n=== UAT TEST CASE 1: Clear Browser Data ===');
    
    // Step 1: Verify fresh start
    await page.goto('http://localhost:3001');
    await page.waitForSelector('.quarters-panel', { timeout: 10000 });
    
    // Take initial screenshot
    await page.screenshot({ 
      path: '/Users/yeameen/src/personal/roadmapster/screenshots/uat-01-initial-load.png',
      fullPage: true 
    });
    
    // Verify only Q2 2025 exists initially
    const initialQuarters = await page.locator('.quarter-container').count();
    console.log(`✓ Initial quarters count: ${initialQuarters}`);
    expect(initialQuarters).toBe(1);
    
    const q2Quarter = await page.locator('.quarter-title').first().textContent();
    console.log(`✓ Default quarter found: ${q2Quarter}`);
    expect(q2Quarter).toBe('Q2 2025');
    
    console.log('\n=== UAT TEST CASE 2: Create Q3 2025 Quarter ===');
    
    // Step 2: Create Q3 2025 quarter
    await page.click('.add-quarter-button');
    await page.waitForSelector('.modal-content');
    
    // Clear the default name and enter Q3 2025
    await page.fill('#name', '');
    await page.fill('#name', 'Q3 2025');
    
    // Keep defaults - verify they're correct
    const workingDays = await page.inputValue('#workingDays');
    const status = await page.selectOption('#status', { label: 'Planning' });
    console.log(`✓ Working days: ${workingDays}, Status: Planning`);
    
    // Take screenshot of form
    await page.screenshot({ 
      path: '/Users/yeameen/src/personal/roadmapster/screenshots/uat-02-q3-form.png',
      fullPage: true 
    });
    
    // Create the quarter
    await page.click('.save-button');
    await page.waitForSelector('.modal-content', { state: 'detached' });
    
    // Verify Q3 2025 is created
    await page.waitForSelector('.quarter-container:nth-child(2)');
    const quarters = await page.locator('.quarter-container').count();
    console.log(`✓ Quarters count after creation: ${quarters}`);
    expect(quarters).toBe(2);
    
    // Verify the new quarter name
    const q3Quarter = await page.locator('.quarter-title').nth(1).textContent();
    console.log(`✓ New quarter created: ${q3Quarter}`);
    expect(q3Quarter).toBe('Q3 2025');
    
    // Take screenshot after creation
    await page.screenshot({ 
      path: '/Users/yeameen/src/personal/roadmapster/screenshots/uat-03-after-q3-creation.png',
      fullPage: true 
    });

    console.log('\n=== UAT TEST CASE 3: Test Drag and Drop to Q3 2025 ===');
    
    // Step 3: Create a new epic in backlog
    await page.click('.add-epic-button');
    await page.waitForSelector('.modal-content');
    
    await page.fill('#title', 'Test Epic for Q3');
    await page.selectOption('#size', 'M');
    await page.selectOption('#priority', 'P1');
    
    await page.click('.save-button');
    await page.waitForSelector('.modal-content', { state: 'detached' });
    
    // Verify epic was created in backlog
    const backlogEpics = await page.locator('.epics-list .epic-card').count();
    console.log(`✓ Epics in backlog: ${backlogEpics}`);
    
    // Take screenshot before drag
    await page.screenshot({ 
      path: '/Users/yeameen/src/personal/roadmapster/screenshots/uat-04-before-drag.png',
      fullPage: true 
    });
    
    // Step 4: Drag the epic to Q3 2025
    const epicCard = page.locator('.epics-list .epic-card').last();
    const q3QuarterDropZone = page.locator('.quarter-container').nth(1).locator('.quarter-content');
    
    // Perform drag and drop
    console.log('🎯 Performing drag and drop...');
    await epicCard.dragTo(q3QuarterDropZone);
    
    // Wait for the drag operation to complete
    await page.waitForTimeout(1000);
    
    // Take screenshot after drag
    await page.screenshot({ 
      path: '/Users/yeameen/src/personal/roadmapster/screenshots/uat-05-after-drag.png',
      fullPage: true 
    });
    
    // Verify epic moved to Q3 2025
    const q3Epics = await page.locator('.quarter-container').nth(1).locator('.quarter-epics .epic-card').count();
    const remainingBacklogEpics = await page.locator('.epics-list .epic-card').count();
    
    console.log(`✓ Epics in Q3 2025: ${q3Epics}`);
    console.log(`✓ Remaining backlog epics: ${remainingBacklogEpics}`);
    
    // Verify the epic is now in Q3 2025
    if (q3Epics === 1) {
      console.log('✅ SUCCESS: Epic successfully moved to Q3 2025');
      
      // Verify epic content
      const epicTitle = await page.locator('.quarter-container').nth(1).locator('.quarter-epics .epic-card .epic-title').textContent();
      console.log(`✓ Epic title in Q3: ${epicTitle}`);
      expect(epicTitle).toBe('Test Epic for Q3');
      
    } else {
      console.log('❌ FAILURE: Epic did not move to Q3 2025');
      
      // Check if epic is still in backlog
      if (remainingBacklogEpics === backlogEpics) {
        console.log('❌ Epic remained in backlog - drag and drop failed');
      }
    }

    console.log('\n=== UAT TEST CASE 4: Test Multiple Operations ===');
    
    // Step 5: Test additional drag operations
    
    // Create another epic
    await page.click('.add-epic-button');
    await page.waitForSelector('.modal-content');
    
    await page.fill('#title', 'Second Test Epic');
    await page.selectOption('#size', 'S');
    await page.selectOption('#priority', 'P2');
    
    await page.click('.save-button');
    await page.waitForSelector('.modal-content', { state: 'detached' });
    
    // Drag second epic to Q3 2025
    const secondEpic = page.locator('.epics-list .epic-card').last();
    await secondEpic.dragTo(q3QuarterDropZone);
    await page.waitForTimeout(1000);
    
    const q3EpicsAfterSecond = await page.locator('.quarter-container').nth(1).locator('.quarter-epics .epic-card').count();
    console.log(`✓ Epics in Q3 2025 after second drag: ${q3EpicsAfterSecond}`);
    
    // Try moving an epic from Q3 back to backlog
    const firstQ3Epic = page.locator('.quarter-container').nth(1).locator('.quarter-epics .epic-card').first();
    const backlogDropZone = page.locator('.backlog-content');
    
    await firstQ3Epic.dragTo(backlogDropZone);
    await page.waitForTimeout(1000);
    
    const finalBacklogEpics = await page.locator('.epics-list .epic-card').count();
    const finalQ3Epics = await page.locator('.quarter-container').nth(1).locator('.quarter-epics .epic-card').count();
    
    console.log(`✓ Final backlog epics: ${finalBacklogEpics}`);
    console.log(`✓ Final Q3 2025 epics: ${finalQ3Epics}`);
    
    // Take final state screenshot
    await page.screenshot({ 
      path: '/Users/yeameen/src/personal/roadmapster/screenshots/uat-06-final-state.png',
      fullPage: true 
    });

    console.log('\n=== UAT TEST CASE 5: Verify Persistence ===');
    
    // Step 6: Test persistence
    await page.reload();
    await page.waitForSelector('.quarters-panel');
    
    // Verify data persisted after refresh
    const persistedQuarters = await page.locator('.quarter-container').count();
    const persistedQ3Epics = await page.locator('.quarter-container').nth(1).locator('.quarter-epics .epic-card').count();
    const persistedBacklogEpics = await page.locator('.epics-list .epic-card').count();
    
    console.log(`✓ Persisted quarters: ${persistedQuarters}`);
    console.log(`✓ Persisted Q3 epics: ${persistedQ3Epics}`);  
    console.log(`✓ Persisted backlog epics: ${persistedBacklogEpics}`);
    
    // Take final screenshot
    await page.screenshot({ 
      path: '/Users/yeameen/src/personal/roadmapster/screenshots/uat-07-after-refresh.png',
      fullPage: true 
    });
    
    console.log('\n=== UAT TEST SUMMARY ===');
    console.log(`✓ Q3 2025 quarter creation: ${quarters === 2 ? 'PASS' : 'FAIL'}`);
    console.log(`✓ Drag and drop to Q3 2025: ${q3Epics >= 1 ? 'PASS' : 'FAIL'}`);
    console.log(`✓ Multiple operations: ${q3EpicsAfterSecond >= 1 ? 'PASS' : 'FAIL'}`);
    console.log(`✓ Data persistence: ${persistedQuarters === 2 ? 'PASS' : 'FAIL'}`);
    
    // Overall test result
    const overallPass = quarters === 2 && q3Epics >= 1 && persistedQuarters === 2;
    console.log(`\n🎯 OVERALL RESULT: ${overallPass ? 'PASS ✅' : 'FAIL ❌'}`);
    
    expect(overallPass).toBe(true);
  });
});