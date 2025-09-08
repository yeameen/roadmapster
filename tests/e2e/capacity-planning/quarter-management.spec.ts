import { test, expect } from '../../fixtures/test-base';

/**
 * Quarter lifecycle (status) and collapse/summary tests
 * Aligned with current UI: edit quarter status via menu; border-left color reflects state
 */

test.describe('Quarter Lifecycle and Collapse', () => {
  test.beforeEach(async ({ page }) => {
    // Clear all localStorage data before each test for isolation
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should change quarter status and reflect UI color', async ({ page, quartersPage }) => {
    // Create a quarter
    const qName = 'Lifecycle Q';
    await quartersPage.addQuarter(qName, 65);

    const quarter = quartersPage.getQuarterByName(qName);
    const header = quarter.locator('.quarter-header');

    // Helper to read computed border-left color
    const getBorderColor = async () => await header.evaluate((el) => getComputedStyle(el).borderLeftColor);

    // Planning (default) should be blue-ish
    const planningColor = await getBorderColor();
    expect(planningColor).toMatch(/rgb\(59,\s*130,\s*246\)/); // #3b82f6

    // Edit to Active (green)
    await quarter.locator('.menu-button').click();
    await quarter.locator('.menu-dropdown >> text=Edit Quarter').click();
    await page.locator('#status').selectOption('active');
    await page.locator('button:has-text("Update Quarter"), button:has-text("Save")').last().click();
    await expect(page.locator('.modal-content')).toBeHidden({ timeout: 3000 });

    const activeColor = await getBorderColor();
    expect(activeColor).toMatch(/rgb\(16,\s*185,\s*129\)/); // #10b981

    // Edit to Completed (gray)
    await quarter.locator('.menu-button').click();
    await quarter.locator('.menu-dropdown >> text=Edit Quarter').click();
    await page.locator('#status').selectOption('completed');
    await page.locator('button:has-text("Update Quarter"), button:has-text("Save")').last().click();
    await expect(page.locator('.modal-content')).toBeHidden({ timeout: 3000 });

    const completedColor = await getBorderColor();
    expect(completedColor).toMatch(/rgb\(107,\s*114,\s*128\)/); // #6b7280
  });

  test('should show epic count in header and persist collapse state', async ({ page, backlogPage, quartersPage, testDataFactory }) => {
    const qName = 'Summary Q';
    await quartersPage.addQuarter(qName, 65);

    // Add two unique epics and drag to the quarter
    const e1 = testDataFactory.generateEpic({ title: `E1-${Date.now()}` });
    const e2 = testDataFactory.generateEpic({ title: `E2-${Date.now()}` });
    await backlogPage.addEpic(e1);
    await backlogPage.addEpic(e2);
    await quartersPage.dragEpicToQuarter(e1.title, qName);
    await quartersPage.dragEpicToQuarter(e2.title, qName);

    const quarter = quartersPage.getQuarterByName(qName);

    // Header should show (2 epics)
    const countText = await quarter.locator('.quarter-epic-count').textContent();
    expect(countText).toMatch(/\(2 epics\)/);

    // Collapse and verify content hidden but header persists
    await quarter.locator('.collapse-button').click();
    const content = quarter.locator('.quarter-content, .quarter-epics');
    await expect(content).toBeHidden();

    const countTextCollapsed = await quarter.locator('.quarter-epic-count').textContent();
    expect(countTextCollapsed).toMatch(/\(2 epics\)/);

    // Expand again and verify epics visible
    await quarter.locator('.collapse-button').click();
    await expect(content).toBeVisible();
    const epics = await quartersPage.getEpicsInQuarter(qName);
    expect(epics).toEqual(expect.arrayContaining([e1.title, e2.title]));
  });
});

