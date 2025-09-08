import { test, expect } from '../../fixtures/test-base';

/**
 * Epic form validation tests (required fields)
 */

test.describe('Epic Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should require title before creating an epic', async ({ page, backlogPage }) => {
    // Open epic form without using factory helper (we need empty form)
    await page.getByRole('button', { name: /add epic/i }).click();
    const modal = page.locator('.modal-content.epic-form');
    await expect(modal).toBeVisible();

    // Attempt to submit with empty required title
    await modal.locator('button[type="submit"]').click();

    // Form should not close; title should be invalid
    const titleInput = modal.locator('#title');
    await expect(modal).toBeVisible();
    const isValid = await titleInput.evaluate((el) => (el as HTMLInputElement).checkValidity());
    expect(isValid).toBeFalsy();

    // Fill valid data and submit
    await titleInput.fill(`Validated Epic ${Date.now()}`);
    await modal.locator('#size').selectOption('M');
    await modal.locator('#priority').selectOption('P1');
    await modal.locator('button[type="submit"]').click();

    // Modal should close and epic should appear somewhere on the board (initially backlog)
    await expect(modal).toBeHidden();
    const titles = await backlogPage.getAllEpicTitles();
    expect(titles.join(' ')).toMatch(/Validated Epic/);
  });
});

