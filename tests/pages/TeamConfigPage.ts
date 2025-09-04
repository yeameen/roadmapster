import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class TeamConfigPage extends BasePage {
  private readonly teamConfigButton: Locator;
  private readonly teamModal: Locator;
  private readonly teamNameInput: Locator;
  private readonly addMemberButton: Locator;
  private readonly memberRows: Locator;
  private readonly oncallInput: Locator;
  private readonly bufferInput: Locator;
  private readonly saveButton: Locator;
  private readonly closeButton: Locator;
  private readonly exportButton: Locator;
  private readonly importButton: Locator;

  constructor(page: Page) {
    super(page);
    this.teamConfigButton = page.getByRole('button', { name: /team settings/i });
    this.teamModal = page.locator('.modal-content.team-configuration, .modal-content');
    this.teamNameInput = page.locator('input#teamName, input[value*="Team"]').first();
    this.addMemberButton = page.getByRole('button', { name: /add/i }).or(page.locator('button:has-text("Add")'));
    this.memberRows = page.locator('.member-item');
    this.oncallInput = page.locator('input[type="number"]').nth(1);
    this.bufferInput = page.locator('input[type="range"], input[type="number"]').last();
    this.saveButton = this.teamModal.locator('button').filter({ hasText: /save/i });
    this.closeButton = this.teamModal.locator('button').filter({ hasText: /close|cancel/i });
    this.exportButton = page.getByRole('button', { name: /export/i });
    this.importButton = page.getByRole('button', { name: /import/i });
  }

  /**
   * Open team configuration modal
   */
  async openTeamConfig() {
    await this.teamConfigButton.click();
    await this.waitForElement(this.teamModal);
  }

  /**
   * Close team configuration modal
   */
  async closeTeamConfig() {
    await this.closeButton.click();
    await this.teamModal.waitFor({ state: 'hidden' });
  }

  /**
   * Set team name
   */
  async setTeamName(name: string) {
    await this.teamNameInput.clear();
    await this.teamNameInput.fill(name);
  }

  /**
   * Add a team member
   */
  async addTeamMember(name: string, vacationDays: number = 0) {
    await this.addMemberButton.click();
    
    // Find the last (newly added) member row
    const memberCount = await this.memberRows.count();
    const newMemberRow = this.memberRows.nth(memberCount - 1);
    
    const nameInput = newMemberRow.locator('input[type="text"]').first();
    const vacationInput = newMemberRow.locator('input[type="number"]');
    
    await nameInput.fill(name);
    await vacationInput.clear();
    await vacationInput.fill(vacationDays.toString());
  }

  /**
   * Remove a team member
   */
  async removeTeamMember(name: string) {
    const memberRow = this.memberRows.filter({ hasText: name });
    const removeButton = memberRow.locator('button').filter({ hasText: /remove|delete|×/i });
    await removeButton.click();
  }

  /**
   * Update team member details
   */
  async updateTeamMember(oldName: string, newName: string, vacationDays?: number) {
    const memberRow = this.memberRows.filter({ hasText: oldName });
    const nameInput = memberRow.locator('input[type="text"]').first();
    const vacationInput = memberRow.locator('input[type="number"]');
    
    if (newName !== oldName) {
      await nameInput.clear();
      await nameInput.fill(newName);
    }
    
    if (vacationDays !== undefined) {
      await vacationInput.clear();
      await vacationInput.fill(vacationDays.toString());
    }
  }

  /**
   * Set oncall rotation days
   */
  async setOncallRotation(days: number) {
    await this.oncallInput.clear();
    await this.oncallInput.fill(days.toString());
  }

  /**
   * Set buffer percentage
   */
  async setBufferPercentage(percentage: number) {
    await this.bufferInput.clear();
    await this.bufferInput.fill(percentage.toString());
  }

  /**
   * Save team configuration
   */
  async saveTeamConfig() {
    await this.saveButton.click();
    await this.teamModal.waitFor({ state: 'hidden' });
  }

  /**
   * Get all team members
   */
  async getTeamMembers(): Promise<Array<{ name: string; vacationDays: number }>> {
    const members: Array<{ name: string; vacationDays: number }> = [];
    const count = await this.memberRows.count();
    
    for (let i = 0; i < count; i++) {
      const row = this.memberRows.nth(i);
      const nameInput = row.locator('input[type="text"]').first();
      const vacationInput = row.locator('input[type="number"]');
      
      const name = await nameInput.inputValue();
      const vacation = await vacationInput.inputValue();
      
      members.push({
        name,
        vacationDays: parseInt(vacation) || 0
      });
    }
    
    return members;
  }

  /**
   * Get team configuration
   */
  async getTeamConfig() {
    const teamName = await this.teamNameInput.inputValue();
    const members = await this.getTeamMembers();
    const oncallRotation = parseInt(await this.oncallInput.inputValue()) || 0;
    const bufferPercentage = parseInt(await this.bufferInput.inputValue()) || 0;
    
    return {
      name: teamName,
      members,
      oncallRotation,
      bufferPercentage
    };
  }

  /**
   * Configure complete team
   */
  async configureTeam(config: {
    name: string;
    members: Array<{ name: string; vacationDays: number }>;
    oncallRotation: number;
    bufferPercentage: number;
  }) {
    await this.openTeamConfig();
    
    await this.setTeamName(config.name);
    
    // Clear existing members
    while (await this.memberRows.count() > 0) {
      const firstMember = this.memberRows.first();
      const removeButton = firstMember.locator('button').filter({ hasText: /remove|delete|×/i });
      if (await removeButton.isVisible()) {
        await removeButton.click();
      } else {
        break; // Can't remove, probably the last member
      }
    }
    
    // Add new members
    for (const member of config.members) {
      await this.addTeamMember(member.name, member.vacationDays);
    }
    
    await this.setOncallRotation(config.oncallRotation);
    await this.setBufferPercentage(config.bufferPercentage);
    
    await this.saveTeamConfig();
  }

  /**
   * Export data
   */
  async exportData() {
    // Set up download promise before clicking
    const downloadPromise = this.page.waitForEvent('download');
    await this.exportButton.click();
    const download = await downloadPromise;
    return download;
  }

  /**
   * Import data
   */
  async importData(filePath: string) {
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
    
    // Handle any confirmation dialog
    const confirmButton = this.page.getByRole('button', { name: /confirm|import|yes/i });
    if (await confirmButton.isVisible({ timeout: 1000 })) {
      await confirmButton.click();
    }
  }

  /**
   * Get team capacity calculation
   */
  async getTeamCapacity(workingDays: number = 65) {
    const members = await this.getTeamMembers();
    const oncallRotation = parseInt(await this.oncallInput.inputValue()) || 0;
    const bufferPercentage = parseInt(await this.bufferInput.inputValue()) || 20;
    
    const totalVacationDays = members.reduce((sum, m) => sum + m.vacationDays, 0);
    const engineerCount = members.length;
    
    const baseCapacity = engineerCount * workingDays;
    const oncallDays = oncallRotation * (workingDays / 65);
    const bufferDays = (baseCapacity - totalVacationDays - oncallDays) * (bufferPercentage / 100);
    
    const availableCapacity = baseCapacity - totalVacationDays - oncallDays - bufferDays;
    
    return {
      baseCapacity,
      vacationDays: totalVacationDays,
      oncallDays,
      bufferDays,
      availableCapacity: Math.round(availableCapacity)
    };
  }
}