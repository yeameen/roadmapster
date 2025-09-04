import { Page, Locator } from '@playwright/test';

/**
 * Base Page class that all other page objects extend
 * Contains common functionality shared across all pages
 */
export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL path
   */
  async goto(path: string = '/') {
    await this.page.goto(path);
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get element by test id attribute
   */
  getByTestId(testId: string): Locator {
    return this.page.locator(`[data-testid="${testId}"]`);
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator: Locator) {
    await locator.waitFor({ state: 'visible' });
  }

  /**
   * Take a screenshot for debugging
   */
  async screenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  /**
   * Get text content of an element
   */
  async getTextContent(locator: Locator): Promise<string> {
    return await locator.textContent() || '';
  }

  /**
   * Check if element is visible
   */
  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  /**
   * Get count of elements matching locator
   */
  async getCount(locator: Locator): Promise<number> {
    return await locator.count();
  }

  /**
   * Clear localStorage
   */
  async clearLocalStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }

  /**
   * Set localStorage item
   */
  async setLocalStorageItem(key: string, value: any) {
    await this.page.evaluate(({ key, value }) => {
      localStorage.setItem(key, JSON.stringify(value));
    }, { key, value });
  }

  /**
   * Get localStorage item
   */
  async getLocalStorageItem(key: string) {
    return await this.page.evaluate((key) => {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }, key);
  }
}