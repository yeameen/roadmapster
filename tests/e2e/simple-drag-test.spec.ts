import { test, expect } from '@playwright/test';

test('manual drag and drop test', async ({ page }) => {
  // Go to page
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Add an epic to backlog
  await page.getByRole('button', { name: /add epic/i }).click();
  await page.locator('input#title').fill('Drag Test Epic');
  await page.locator('select#size').selectOption('M');
  await page.locator('select#priority').selectOption('P1');
  await page.locator('.modal-content.epic-form button[type="submit"]').click();
  await page.waitForTimeout(500);
  
  // Create a quarter
  await page.getByRole('button', { name: /create quarter/i }).click();
  await page.locator('input[type="text"]').first().fill('Q1 2025');
  await page.locator('button[type="submit"]').last().click();
  await page.waitForTimeout(500);
  
  // Now try different drag approaches
  console.log('Testing drag and drop...');
  
  // Approach 1: Using Playwright's built-in drag
  const epic = page.locator('.epic-card').filter({ hasText: 'Drag Test Epic' });
  const quarter = page.locator('.quarter-container').filter({ hasText: 'Q1 2025' });
  
  // Try drag to quarter drop zone
  const dropZone = quarter.locator('.quarter-epics, .quarter-content').first();
  
  await epic.dragTo(dropZone);
  
  // Check if it worked
  await page.waitForTimeout(1000);
  
  // Check if epic is in quarter
  const epicsInQuarter = await quarter.locator('.epic-card').count();
  const epicsInBacklog = await page.locator('.backlog .epic-card').count();
  
  console.log(`Epics in quarter: ${epicsInQuarter}`);
  console.log(`Epics in backlog: ${epicsInBacklog}`);
  
  expect(epicsInQuarter).toBe(1);
  expect(epicsInBacklog).toBeLessThan(6); // Should be less than original count
});