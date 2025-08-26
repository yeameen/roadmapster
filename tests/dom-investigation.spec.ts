import { test, expect } from '@playwright/test';

test.describe('DOM Investigation for Q2 vs Q3 Drag-Drop', () => {
  test('Compare DOM structure and drag-drop attributes between Q2 2025 and Q3 2025', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    console.log('Step 1: Analyzing initial state (Q2 2025 only)...');
    
    // Analyze Q2 2025 drop zone
    const q2DropZone = page.locator('[data-rbd-droppable-id*="quarter"], [data-testid*="quarter"]').first();
    const q2DropZoneAttributes = await q2DropZone.evaluate((el) => {
      if (!el) return {};
      const attrs: Record<string, string> = {};
      Array.from(el.attributes).forEach(attr => {
        attrs[attr.name] = attr.value;
      });
      return attrs;
    });
    
    console.log('Q2 Drop Zone Attributes:', q2DropZoneAttributes);
    
    // Check if Q2 has the correct dnd-kit droppable attributes
    const q2DroppableElements = await page.locator('[data-rbd-droppable-id], [data-dnd-kit-droppable]').count();
    console.log('Q2 Droppable elements found:', q2DroppableElements);
    
    console.log('Step 2: Creating Q3 2025...');
    
    // Create Q3 2025
    await page.locator('button:has-text("Create Quarter")').click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Create Quarter")').last().click();
    await page.waitForTimeout(2000);
    
    console.log('Step 3: Analyzing Q3 2025 after creation...');
    
    // Find all quarter elements
    const allQuarters = page.locator('.quarter-container, .quarter-view, [class*="quarter"]');
    const quarterCount = await allQuarters.count();
    console.log('Total quarters found:', quarterCount);
    
    // Get all elements with quarter-related IDs
    const quarterElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('[id*="quarter"], [data-rbd-droppable-id*="quarter"]'));
      return elements.map((el, index) => ({
        index,
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        droppableId: el.getAttribute('data-rbd-droppable-id'),
        textContent: el.textContent?.substring(0, 50) || ''
      }));
    });
    
    console.log('Quarter elements with IDs:', quarterElements);
    
    console.log('Step 4: Testing drag-drop to both quarters...');
    
    // Test drag to Q2 2025 first
    const firstEpic = page.locator('.epic-card').first();
    const q2Quarter = allQuarters.first();
    
    console.log('Testing drag to Q2 2025...');
    await firstEpic.dragTo(q2Quarter);
    await page.waitForTimeout(2000);
    
    const backlogEpicsAfterQ2 = await page.locator('.backlog .epic-card').count();
    console.log('Epics remaining in backlog after Q2 drag:', backlogEpicsAfterQ2);
    
    // Test drag to Q3 2025
    if (backlogEpicsAfterQ2 > 0) {
      const secondEpic = page.locator('.backlog .epic-card').first();
      const q3Quarter = allQuarters.last();
      
      console.log('Testing drag to Q3 2025...');
      await secondEpic.dragTo(q3Quarter);
      await page.waitForTimeout(2000);
      
      const backlogEpicsAfterQ3 = await page.locator('.backlog .epic-card').count();
      console.log('Epics remaining in backlog after Q3 drag:', backlogEpicsAfterQ3);
    }
    
    console.log('Step 5: Examining React/DndKit specific attributes...');
    
    // Look for dnd-kit specific attributes
    const dndKitDroppables = await page.evaluate(() => {
      const droppables = Array.from(document.querySelectorAll('[data-rbd-droppable-id], [role="button"]'));
      return droppables.map((el, index) => {
        const rect = el.getBoundingClientRect();
        return {
          index,
          className: el.className,
          droppableId: el.getAttribute('data-rbd-droppable-id'),
          role: el.getAttribute('role'),
          ariaLabel: el.getAttribute('aria-label'),
          isVisible: rect.width > 0 && rect.height > 0,
          textContent: el.textContent?.substring(0, 30) || ''
        };
      });
    });
    
    console.log('DndKit droppable elements:', dndKitDroppables);
    
    // Check console for any React/DndKit errors
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.text().includes('dnd') || msg.text().includes('drag')) {
        consoleMessages.push(`${msg.type()}: ${msg.text()}`);
      }
    });
    
    console.log('Drag-related console messages:', consoleMessages);
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'screenshots/dom-investigation-final.png',
      fullPage: true 
    });
  });
});