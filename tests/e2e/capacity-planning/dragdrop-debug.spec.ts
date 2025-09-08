import { test, expect, Page } from '@playwright/test';

/**
 * UAT Test Suite: Roadmapster Drag-and-Drop Investigation
 * Focus: Q3 2025 drag-and-drop functionality issues
 */

test.describe.skip('Roadmapster Drag-and-Drop Investigation (legacy debug spec - skipped)', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'screenshots/01-initial-load.png',
      fullPage: true 
    });
  });

  test('Test Case 1: Q3 2025 Selection and Display', async () => {
    console.log('Testing Q3 2025 selection and display...');
    
    // Check if quarter selector exists
    const quarterSelector = page.locator('[data-testid="quarter-selector"], select[name*="quarter"], .quarter-selector');
    await expect(quarterSelector.first()).toBeVisible({ timeout: 10000 });
    
    // Take screenshot of quarter selector
    await page.screenshot({ 
      path: 'screenshots/02-quarter-selector.png',
      fullPage: true 
    });
    
    // Find all available quarter options
    const quarterOptions = await page.locator('select option, .quarter-option').allTextContents();
    console.log('Available quarter options:', quarterOptions);
    
    // Look for Q3 2025 option
    const hasQ3Option = quarterOptions.some(option => 
      option.includes('Q3') && option.includes('2025')
    );
    console.log('Q3 2025 available:', hasQ3Option);
    
    // Try different selectors to find Q3 2025
    const q3Selectors = [
      'option[value*="Q3-2025"]',
      'option[value*="2025-Q3"]',
      'option:has-text("Q3 2025")',
      'option:has-text("2025 Q3")',
      'option:has-text("Jul - Sep 2025")',
      '[data-quarter="Q3-2025"]',
      '[data-value="Q3-2025"]'
    ];
    
    let q3Option = null;
    for (const selector of q3Selectors) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        q3Option = element.first();
        console.log(`Found Q3 2025 using selector: ${selector}`);
        break;
      }
    }
    
    if (q3Option) {
      // Select Q3 2025
      await q3Option.click();
      await page.waitForTimeout(2000); // Wait for UI to update
      
      // Take screenshot after Q3 selection
      await page.screenshot({ 
        path: 'screenshots/03-q3-selected.png',
        fullPage: true 
      });
      
      // Verify grid updates to show Q3 2025
      const gridHeaders = await page.locator('.week-header, .month-header, [data-testid*="week"], [data-testid*="month"]').allTextContents();
      console.log('Grid headers after Q3 selection:', gridHeaders);
      
      // Check for Q3 months (July, August, September)
      const hasQ3Months = gridHeaders.some(header => 
        ['Jul', 'Aug', 'Sep', 'July', 'August', 'September'].some(month => 
          header.includes(month)
        )
      );
      console.log('Q3 months visible in grid:', hasQ3Months);
      
    } else {
      console.log('Q3 2025 option not found in quarter selector');
      // Take screenshot showing available options
      await page.screenshot({ 
        path: 'screenshots/03-q3-not-found.png',
        fullPage: true 
      });
    }
  });

  test('Test Case 2: Grid Cell Analysis for Q3 2025', async () => {
    console.log('Analyzing Q3 2025 grid cells...');
    
    // First, try to select Q3 2025
    const quarterSelector = page.locator('select, .quarter-selector').first();
    
    // Try to find and select Q3 2025
    const q3Option = page.locator('option:has-text("Q3"), option:has-text("2025")').first();
    if (await q3Option.count() > 0) {
      await q3Option.click();
      await page.waitForTimeout(2000);
    }
    
    // Analyze grid structure
    const gridCells = page.locator('.grid-cell, .week-cell, .day-cell, [data-testid*="cell"], [data-week], [data-day]');
    const cellCount = await gridCells.count();
    console.log(`Total grid cells found: ${cellCount}`);
    
    // Check for droppable attributes on first few cells
    for (let i = 0; i < Math.min(5, cellCount); i++) {
      const cell = gridCells.nth(i);
      const attributes = await cell.evaluate((el) => {
        const attrs: Record<string, string> = {};
        Array.from(el.attributes).forEach(attr => {
          attrs[attr.name] = attr.value;
        });
        return attrs;
      });
      console.log(`Cell ${i} attributes:`, attributes);
    }
    
    // Check for drop zone indicators
    const dropZones = page.locator('[data-drop-zone], .drop-zone, .droppable');
    const dropZoneCount = await dropZones.count();
    console.log(`Drop zones found: ${dropZoneCount}`);
    
    // Take screenshot of grid
    await page.screenshot({ 
      path: 'screenshots/04-q3-grid-analysis.png',
      fullPage: true 
    });
  });

  test('Test Case 3: Epic Creation and Drag Test to Q3 2025', async () => {
    console.log('Testing epic creation and drag to Q3 2025...');
    
    // Try to select Q3 2025 first
    await page.waitForTimeout(1000);
    
    // Look for epic creation button or existing epics
    const createEpicBtn = page.locator('button:has-text("Create"), button:has-text("Add Epic"), [data-testid="create-epic"]');
    const existingEpics = page.locator('.epic, .epic-card, [data-testid*="epic"]');
    
    let epicElement;
    
    if (await createEpicBtn.count() > 0) {
      console.log('Creating new epic...');
      await createEpicBtn.first().click();
      await page.waitForTimeout(1000);
      
      // Fill epic form if it appears
      const nameInput = page.locator('input[name="name"], input[placeholder*="name"], input[placeholder*="title"]');
      if (await nameInput.count() > 0) {
        await nameInput.fill('Test Epic for Q3 2025');
      }
      
      const sizeSelect = page.locator('select[name="size"], select[name="priority"]');
      if (await sizeSelect.count() > 0) {
        await sizeSelect.first().selectOption('M');
      }
      
      const saveBtn = page.locator('button:has-text("Save"), button:has-text("Create"), button[type="submit"]');
      if (await saveBtn.count() > 0) {
        await saveBtn.click();
        await page.waitForTimeout(1000);
      }
      
      epicElement = page.locator('.epic, .epic-card').last();
    } else if (await existingEpics.count() > 0) {
      console.log('Using existing epic...');
      epicElement = existingEpics.first();
    }
    
    if (epicElement && await epicElement.count() > 0) {
      // Take screenshot before drag
      await page.screenshot({ 
        path: 'screenshots/05-before-drag.png',
        fullPage: true 
      });
      
      // Try to drag epic to Q3 2025 grid
      const gridCell = page.locator('.grid-cell, .week-cell, [data-testid*="cell"]').first();
      
      if (await gridCell.count() > 0) {
        console.log('Attempting drag and drop...');
        
        // Get bounding boxes
        const epicBox = await epicElement.boundingBox();
        const cellBox = await gridCell.boundingBox();
        
        if (epicBox && cellBox) {
          // Perform drag and drop
          await page.mouse.move(epicBox.x + epicBox.width / 2, epicBox.y + epicBox.height / 2);
          await page.mouse.down();
          await page.waitForTimeout(500);
          
          await page.mouse.move(cellBox.x + cellBox.width / 2, cellBox.y + cellBox.height / 2);
          await page.waitForTimeout(500);
          
          await page.mouse.up();
          await page.waitForTimeout(1000);
          
          // Take screenshot after drag attempt
          await page.screenshot({ 
            path: 'screenshots/06-after-drag-attempt.png',
            fullPage: true 
          });
        }
      }
    }
  });

  test('Test Case 4: Compare Q2 2025 vs Q3 2025 Behavior', async () => {
    console.log('Comparing Q2 2025 vs Q3 2025 behavior...');
    
    // Test Q2 2025 first
    const quarterSelector = page.locator('select, .quarter-selector').first();
    
    // Select Q2 2025
    const q2Option = page.locator('option:has-text("Q2"), option:has-text("2025")').first();
    if (await q2Option.count() > 0) {
      await q2Option.click();
      await page.waitForTimeout(2000);
      
      // Take screenshot of Q2
      await page.screenshot({ 
        path: 'screenshots/07-q2-2025-view.png',
        fullPage: true 
      });
      
      // Analyze Q2 grid cells
      const q2GridCells = page.locator('.grid-cell, .week-cell, [data-testid*="cell"]');
      const q2CellCount = await q2GridCells.count();
      console.log(`Q2 2025 grid cells: ${q2CellCount}`);
      
      // Check droppable attributes in Q2
      if (q2CellCount > 0) {
        const q2FirstCell = q2GridCells.first();
        const q2Attributes = await q2FirstCell.evaluate((el) => {
          const attrs: Record<string, string> = {};
          Array.from(el.attributes).forEach(attr => {
            attrs[attr.name] = attr.value;
          });
          return attrs;
        });
        console.log('Q2 first cell attributes:', q2Attributes);
      }
    }
    
    // Now test Q3 2025
    const q3Option = page.locator('option:has-text("Q3"), option:has-text("2025")').first();
    if (await q3Option.count() > 0) {
      await q3Option.click();
      await page.waitForTimeout(2000);
      
      // Take screenshot of Q3
      await page.screenshot({ 
        path: 'screenshots/08-q3-2025-view.png',
        fullPage: true 
      });
      
      // Analyze Q3 grid cells
      const q3GridCells = page.locator('.grid-cell, .week-cell, [data-testid*="cell"]');
      const q3CellCount = await q3GridCells.count();
      console.log(`Q3 2025 grid cells: ${q3CellCount}`);
      
      // Check droppable attributes in Q3
      if (q3CellCount > 0) {
        const q3FirstCell = q3GridCells.first();
        const q3Attributes = await q3FirstCell.evaluate((el) => {
          const attrs: Record<string, string> = {};
          Array.from(el.attributes).forEach(attr => {
            attrs[attr.name] = attr.value;
          });
          return attrs;
        });
        console.log('Q3 first cell attributes:', q3Attributes);
      }
    }
  });

  test('Test Case 5: Console Error Detection and DOM Investigation', async () => {
    console.log('Monitoring console errors and investigating DOM...');
    
    // Listen for console messages
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // Listen for page errors
    const pageErrors: string[] = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });
    
    // Try to select Q3 2025 and monitor for errors
    await page.waitForTimeout(1000);
    
    const quarterSelector = page.locator('select, .quarter-selector').first();
    const q3Option = page.locator('option:has-text("Q3"), option:has-text("2025")').first();
    
    if (await q3Option.count() > 0) {
      await q3Option.click();
      await page.waitForTimeout(3000);
    }
    
    // Check DOM structure
    const domStructure = await page.evaluate(() => {
      const structure: any = {
        quarterSelector: null,
        gridContainer: null,
        epicsContainer: null,
        dropZones: []
      };
      
      // Find quarter selector
      const quarterEl = document.querySelector('select, .quarter-selector');
      if (quarterEl) {
        structure.quarterSelector = {
          tagName: quarterEl.tagName,
          className: quarterEl.className,
          id: quarterEl.id
        };
      }
      
      // Find grid container
      const gridEl = document.querySelector('.grid, .quarter-grid, [data-testid*="grid"]');
      if (gridEl) {
        structure.gridContainer = {
          tagName: gridEl.tagName,
          className: gridEl.className,
          childCount: gridEl.children.length
        };
      }
      
      // Find epics container
      const epicsEl = document.querySelector('.backlog, .epics, [data-testid*="epic"]');
      if (epicsEl) {
        structure.epicsContainer = {
          tagName: epicsEl.tagName,
          className: epicsEl.className,
          childCount: epicsEl.children.length
        };
      }
      
      // Find all drop zones
      const dropZoneEls = document.querySelectorAll('[data-drop-zone], .drop-zone, .droppable');
      dropZoneEls.forEach((el, index) => {
        structure.dropZones.push({
          index,
          tagName: el.tagName,
          className: el.className,
          attributes: Array.from(el.attributes).map(attr => `${attr.name}="${attr.value}"`).join(' ')
        });
      });
      
      return structure;
    });
    
    console.log('DOM Structure:', JSON.stringify(domStructure, null, 2));
    console.log('Console messages:', consoleMessages);
    console.log('Page errors:', pageErrors);
    
    // Take final comprehensive screenshot
    await page.screenshot({ 
      path: 'screenshots/09-final-investigation.png',
      fullPage: true 
    });
  });

  test('Test Case 6: Drag-and-Drop Event Investigation', async () => {
    console.log('Investigating drag-and-drop event handlers...');
    
    // Inject JavaScript to monitor drag events
    await page.addInitScript(() => {
      const originalAddEventListener = EventTarget.prototype.addEventListener;
      const eventLog: any[] = [];
      
      EventTarget.prototype.addEventListener = function(type: string, listener: any, options?: any) {
        if (type.includes('drag') || type.includes('drop')) {
          eventLog.push({
            type,
            target: this.constructor.name,
            className: (this as any).className || '',
            id: (this as any).id || ''
          });
        }
        return originalAddEventListener.call(this, type, listener, options);
      };
      
      (window as any).getDragEventLog = () => eventLog;
    });
    
    // Reload page to apply the script
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Try to select Q3 2025
    await page.waitForTimeout(2000);
    
    // Get drag event log
    const dragEventLog = await page.evaluate(() => (window as any).getDragEventLog());
    console.log('Drag event handlers registered:', dragEventLog);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'screenshots/10-drag-event-investigation.png',
      fullPage: true 
    });
  });
});
