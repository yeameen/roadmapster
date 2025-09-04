import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class BacklogPage extends BasePage {
  private readonly backlogContainer: Locator;
  private readonly addEpicButton: Locator;
  private readonly epicCards: Locator;
  private readonly epicForm: Locator;
  private readonly titleInput: Locator;
  private readonly descriptionInput: Locator;
  private readonly sizeSelect: Locator;
  private readonly prioritySelect: Locator;
  private readonly ownerInput: Locator;
  private readonly saveButton: Locator;
  private readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.backlogContainer = page.locator('.backlog');
    this.addEpicButton = page.getByRole('button', { name: /add epic/i });
    this.epicCards = page.locator('.epic-card');
    this.epicForm = page.locator('.modal-content.epic-form');
    this.titleInput = page.locator('input#title, input[placeholder="Epic title"]');
    this.descriptionInput = page.locator('textarea#description, textarea[placeholder="Epic description"]');
    this.sizeSelect = page.locator('select#size').first();
    this.prioritySelect = page.locator('select#priority').first();
    this.ownerInput = page.locator('input#owner, input[placeholder="Owner name"]');
    this.saveButton = page.locator('.modal-content.epic-form button[type="submit"], .modal-content.epic-form button:has-text("Create Epic")');
    this.cancelButton = page.locator('.close-button, button:has-text("Cancel")');
  }

  /**
   * Add a new epic to the backlog
   */
  async addEpic(data: {
    title: string;
    description?: string;
    size: 'XS' | 'S' | 'M' | 'L' | 'XL';
    priority: 'P0' | 'P1' | 'P2' | 'P3';
    owner?: string;
  }) {
    await this.addEpicButton.click();
    await this.waitForElement(this.epicForm);
    
    await this.titleInput.fill(data.title);
    
    if (data.description) {
      await this.descriptionInput.fill(data.description);
    }
    
    await this.sizeSelect.selectOption(data.size);
    await this.prioritySelect.selectOption(data.priority);
    
    if (data.owner) {
      await this.ownerInput.fill(data.owner);
    }
    
    await this.saveButton.click();
    await this.epicForm.waitFor({ state: 'hidden' });
  }

  /**
   * Get count of epics in backlog
   */
  async getEpicCount(): Promise<number> {
    return await this.epicCards.count();
  }

  /**
   * Get epic by title
   */
  getEpicByTitle(title: string): Locator {
    return this.epicCards.filter({ hasText: title });
  }

  /**
   * Edit an existing epic
   */
  async editEpic(title: string, newData: Partial<{
    title: string;
    description: string;
    size: string;
    priority: string;
    owner: string;
  }>) {
    const epic = this.getEpicByTitle(title);
    await epic.click();
    await this.waitForElement(this.epicForm);
    
    if (newData.title) {
      await this.titleInput.clear();
      await this.titleInput.fill(newData.title);
    }
    
    if (newData.description) {
      await this.descriptionInput.clear();
      await this.descriptionInput.fill(newData.description);
    }
    
    if (newData.size) {
      await this.sizeSelect.selectOption(newData.size);
    }
    
    if (newData.priority) {
      await this.prioritySelect.selectOption(newData.priority);
    }
    
    if (newData.owner) {
      await this.ownerInput.clear();
      await this.ownerInput.fill(newData.owner);
    }
    
    await this.saveButton.click();
  }

  /**
   * Delete an epic from backlog
   */
  async deleteEpic(title: string) {
    const epic = this.getEpicByTitle(title);
    const deleteButton = epic.locator('.delete-button, button[aria-label*="delete"]');
    await deleteButton.click();
    // Handle confirmation if needed
    const confirmButton = this.page.getByRole('button', { name: /confirm|yes|delete/i });
    if (await confirmButton.isVisible({ timeout: 1000 })) {
      await confirmButton.click();
    }
  }

  /**
   * Get all epic titles in backlog
   */
  async getAllEpicTitles(): Promise<string[]> {
    const titles: string[] = [];
    const count = await this.epicCards.count();
    
    for (let i = 0; i < count; i++) {
      const title = await this.epicCards.nth(i).locator('.epic-title, h3, h4').textContent();
      if (title) titles.push(title);
    }
    
    return titles;
  }

  /**
   * Check if backlog is empty
   */
  async isEmpty(): Promise<boolean> {
    return (await this.getEpicCount()) === 0;
  }

  /**
   * Get epic details
   */
  async getEpicDetails(title: string) {
    const epic = this.getEpicByTitle(title);
    const sizeElement = epic.locator('.epic-size, [class*="size"]');
    const priorityElement = epic.locator('.epic-priority, [class*="priority"]');
    const ownerElement = epic.locator('.epic-owner, [class*="owner"]');
    
    return {
      title,
      size: await sizeElement.textContent(),
      priority: await priorityElement.textContent(),
      owner: await ownerElement.textContent()
    };
  }

  /**
   * Drag epic to prepare for drop
   */
  async startDragEpic(title: string) {
    const epic = this.getEpicByTitle(title);
    const box = await epic.boundingBox();
    if (!box) throw new Error(`Epic "${title}" not found`);
    
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await this.page.mouse.down();
  }

  /**
   * Search epics in backlog
   */
  async searchEpics(searchTerm: string) {
    const searchInput = this.page.locator('input[placeholder*="search" i]');
    await searchInput.fill(searchTerm);
    await this.page.keyboard.press('Enter');
  }

  /**
   * Clear search
   */
  async clearSearch() {
    const searchInput = this.page.locator('input[placeholder*="search" i]');
    await searchInput.clear();
    await this.page.keyboard.press('Enter');
  }
}