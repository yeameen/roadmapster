import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class QuartersPage extends BasePage {
  private readonly quartersPanel: Locator;
  private readonly addQuarterButton: Locator;
  private readonly quarterContainers: Locator;
  private readonly quarterForm: Locator;
  private readonly quarterNameInput: Locator;
  private readonly workingDaysInput: Locator;
  private readonly saveQuarterButton: Locator;
  private readonly capacityBars: Locator;

  constructor(page: Page) {
    super(page);
    this.quartersPanel = page.locator('.quarters-panel');
    this.addQuarterButton = page.getByRole('button', { name: /create quarter/i });
    this.quarterContainers = page.locator('.quarter-container');
    this.quarterForm = page.locator('.modal-content.quarter-form, .modal-content');
    this.quarterNameInput = page.locator('input#name, input[placeholder*="quarter" i]').first();
    this.workingDaysInput = page.locator('input#workingDays, input[type="number"]').first();
    this.saveQuarterButton = this.quarterForm.locator('button').filter({ hasText: /save|create/i });
    this.capacityBars = page.locator('.capacity-bar');
  }

  /**
   * Add a new quarter
   */
  async addQuarter(name: string, workingDays: number = 65) {
    await this.addQuarterButton.click();
    await this.waitForElement(this.quarterForm);
    
    await this.quarterNameInput.fill(name);
    await this.workingDaysInput.clear();
    await this.workingDaysInput.fill(workingDays.toString());
    
    await this.saveQuarterButton.click();
    await this.quarterForm.waitFor({ state: 'hidden' });
  }

  /**
   * Get quarter by name
   */
  getQuarterByName(name: string): Locator {
    return this.quarterContainers.filter({ hasText: name });
  }

  /**
   * Toggle quarter collapse state
   */
  async toggleQuarter(name: string) {
    const quarter = this.getQuarterByName(name);
    const toggleButton = quarter.locator('.quarter-header button, [aria-label*="toggle" i]');
    await toggleButton.click();
  }

  /**
   * Get capacity information for a quarter
   */
  async getQuarterCapacity(name: string) {
    const quarter = this.getQuarterByName(name);
    const capacityText = quarter.locator('.capacity-text, [class*="capacity"]');
    const capacityBar = quarter.locator('.capacity-bar');
    
    const text = await capacityText.textContent() || '';
    const usedMatch = text.match(/(\d+)\s*\/\s*(\d+)/);
    
    let capacityClass = '';
    if (await capacityBar.isVisible()) {
      const className = await capacityBar.getAttribute('class') || '';
      if (className.includes('danger') || className.includes('red')) {
        capacityClass = 'danger';
      } else if (className.includes('warning') || className.includes('orange')) {
        capacityClass = 'warning';
      } else if (className.includes('safe') || className.includes('green')) {
        capacityClass = 'safe';
      }
    }
    
    return {
      used: usedMatch ? parseInt(usedMatch[1]) : 0,
      total: usedMatch ? parseInt(usedMatch[2]) : 0,
      percentage: usedMatch ? (parseInt(usedMatch[1]) / parseInt(usedMatch[2])) * 100 : 0,
      status: capacityClass
    };
  }

  /**
   * Get epics in a quarter
   */
  async getEpicsInQuarter(quarterName: string): Promise<string[]> {
    const quarter = this.getQuarterByName(quarterName);
    const epics = quarter.locator('.epic-card');
    const titles: string[] = [];
    const count = await epics.count();
    
    for (let i = 0; i < count; i++) {
      const title = await epics.nth(i).locator('.epic-title, h3, h4').textContent();
      if (title) titles.push(title);
    }
    
    return titles;
  }

  /**
   * Drop epic in quarter (complete drag operation)
   */
  async dropInQuarter(quarterName: string) {
    const quarter = this.getQuarterByName(quarterName);
    const dropZone = quarter.locator('.drop-zone, .quarter-epics, .quarter-content');
    const box = await dropZone.boundingBox();
    
    if (!box) throw new Error(`Quarter "${quarterName}" drop zone not found`);
    
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await this.page.mouse.up();
  }

  /**
   * Drag and drop epic to quarter
   */
  async dragEpicToQuarter(epicTitle: string, quarterName: string) {
    // Start drag from backlog or current location
    const epic = this.page.locator('.epic-card').filter({ hasText: epicTitle });
    const epicBox = await epic.boundingBox();
    if (!epicBox) throw new Error(`Epic "${epicTitle}" not found`);
    
    // Start drag
    await this.page.mouse.move(epicBox.x + epicBox.width / 2, epicBox.y + epicBox.height / 2);
    await this.page.mouse.down();
    
    // Move to quarter drop zone
    const quarter = this.getQuarterByName(quarterName);
    const dropZone = quarter.locator('.drop-zone, .quarter-epics, .quarter-content');
    const dropBox = await dropZone.boundingBox();
    if (!dropBox) throw new Error(`Quarter "${quarterName}" drop zone not found`);
    
    await this.page.mouse.move(dropBox.x + dropBox.width / 2, dropBox.y + dropBox.height / 2, { steps: 5 });
    await this.page.mouse.up();
  }

  /**
   * Remove epic from quarter
   */
  async removeEpicFromQuarter(epicTitle: string, quarterName: string) {
    const quarter = this.getQuarterByName(quarterName);
    const epic = quarter.locator('.epic-card').filter({ hasText: epicTitle });
    
    // Try different removal methods
    const removeButton = epic.locator('.remove-button, button[aria-label*="remove" i]');
    if (await removeButton.isVisible()) {
      await removeButton.click();
    } else {
      // If no remove button, try dragging back to backlog
      const epicBox = await epic.boundingBox();
      if (epicBox) {
        await this.page.mouse.move(epicBox.x + epicBox.width / 2, epicBox.y + epicBox.height / 2);
        await this.page.mouse.down();
        
        const backlog = this.page.locator('.backlog');
        const backlogBox = await backlog.boundingBox();
        if (backlogBox) {
          await this.page.mouse.move(backlogBox.x + backlogBox.width / 2, backlogBox.y + backlogBox.height / 2, { steps: 5 });
          await this.page.mouse.up();
        }
      }
    }
  }

  /**
   * Delete a quarter
   */
  async deleteQuarter(name: string) {
    const quarter = this.getQuarterByName(name);
    const deleteButton = quarter.locator('.delete-quarter, button[aria-label*="delete" i]');
    await deleteButton.click();
    
    // Handle confirmation
    const confirmButton = this.page.getByRole('button', { name: /confirm|yes|delete/i });
    if (await confirmButton.isVisible({ timeout: 1000 })) {
      await confirmButton.click();
    }
  }

  /**
   * Get all quarter names
   */
  async getAllQuarterNames(): Promise<string[]> {
    const names: string[] = [];
    const count = await this.quarterContainers.count();
    
    for (let i = 0; i < count; i++) {
      const header = this.quarterContainers.nth(i).locator('.quarter-header h2, .quarter-title');
      const name = await header.textContent();
      if (name) names.push(name.trim());
    }
    
    return names;
  }

  /**
   * Check if quarter is collapsed
   */
  async isQuarterCollapsed(name: string): Promise<boolean> {
    const quarter = this.getQuarterByName(name);
    const content = quarter.locator('.quarter-content, .quarter-epics');
    return !(await content.isVisible());
  }

  /**
   * Get quarter statistics
   */
  async getQuarterStats(name: string) {
    const epics = await this.getEpicsInQuarter(name);
    const capacity = await this.getQuarterCapacity(name);
    
    return {
      epicCount: epics.length,
      epics,
      capacity,
      isCollapsed: await this.isQuarterCollapsed(name)
    };
  }
}