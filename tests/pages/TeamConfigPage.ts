import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class TeamConfigPage extends BasePage {
  private readonly teamConfigButton: Locator;
  private readonly teamModal: Locator;
  private readonly teamNameInput: Locator;
  private readonly addMemberButton: Locator;
  private readonly addMemberNameInput: Locator;
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
    this.teamModal = page.locator('.modal-content').filter({ hasText: 'Team Configuration' });
    // Use data-testid for more reliable test selectors
    this.teamNameInput = page.getByTestId('team-name-input');
    this.addMemberButton = this.teamModal.getByRole('button', { name: /add member/i });
    this.addMemberNameInput = this.teamModal.locator('.add-member input[type="text"]');
    this.memberRows = page.locator('.member-item');
    this.oncallInput = page.getByTestId('oncall-overhead-input');
    this.bufferInput = page.getByTestId('buffer-percentage-input');
    this.saveButton = this.teamModal.getByRole('button', { name: /save configuration|save/i });
    this.closeButton = this.teamModal.getByRole('button', { name: /cancel|close/i });
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
    // Triple-click to select all text, then type the new value
    await this.teamNameInput.click({ clickCount: 3 });
    await this.teamNameInput.fill(name);
  }

  /**
   * Add a team member
   */
  async addTeamMember(name: string, vacationDays: number = 0) {
    // Fill the add-member input then click Add Member
    await this.addMemberNameInput.fill(name);
    await this.addMemberButton.click();

    // Update the newly added member's vacation days
    const row = this.memberRows.filter({ hasText: name }).first();
    const vacationInput = row.locator('.vacation-input');
    await vacationInput.clear();
    await vacationInput.fill(vacationDays.toString());
  }

  /**
   * Remove a team member
   */
  async removeTeamMember(name: string) {
    const memberRow = this.memberRows.filter({ hasText: name });
    const removeButton = memberRow.locator('button.remove-member');
    await removeButton.click();
  }

  /**
   * Update team member details
   */
  async updateTeamMember(oldName: string, newName: string, vacationDays?: number) {
    const memberRow = this.memberRows.filter({ hasText: oldName });
    const nameLabel = memberRow.locator('.member-name');
    if (newName !== oldName) {
      // There is no inline name input; remove and re-add member with new name
      await this.removeTeamMember(oldName);
      await this.addTeamMember(newName, vacationDays ?? 0);
      return;
    }
    if (vacationDays !== undefined) {
      const vacationInput = memberRow.locator('.vacation-input');
      await vacationInput.clear();
      await vacationInput.fill(vacationDays.toString());
    }
  }

  /**
   * Set oncall overhead (persons)
   */
  async setOncallRotation(persons: number) {
    await this.oncallInput.clear();
    await this.oncallInput.fill(persons.toString());
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
    // Ensure the members section is visible
    await this.page.waitForSelector('.member-item', { state: 'visible', timeout: 5000 }).catch(() => {
      // If no members visible, return empty array
      return [];
    });
    
    const members: Array<{ name: string; vacationDays: number }> = [];
    const count = await this.memberRows.count();
    
    for (let i = 0; i < count; i++) {
      const row = this.memberRows.nth(i);
      // Wait for the specific row to be visible
      await row.waitFor({ state: 'visible', timeout: 5000 });
      
      const nameText = (await row.locator('.member-name').textContent()) || '';
      const vacationVal = await row.locator('.vacation-input').inputValue();
      members.push({ name: nameText.trim(), vacationDays: parseInt(vacationVal) || 0 });
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

    // Remove all current members using the more reliable method
    const existingMembers = await this.getTeamMembers();
    for (const member of existingMembers) {
      await this.removeTeamMember(member.name);
    }

    // Add new members
    for (const member of config.members) {
      await this.addTeamMember(member.name, member.vacationDays);
    }

    await this.setOncallRotation(config.oncallRotation);
    await this.setBufferPercentage(config.bufferPercentage);
    // Keep sprints as default unless later extended; could expose config if needed

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
    // Ensure modal is open to read current values
    const wasOpen = await this.teamModal.isVisible();
    if (!wasOpen) {
      await this.openTeamConfig();
    }
    const members = await this.getTeamMembers();
    const oncallPerSprint = parseInt(await this.oncallInput.inputValue()) || 0;
    const sprints = 6; // Default sprints per quarter
    const bufferPercentage = parseInt(await this.bufferInput.inputValue()) || 20;

    // Base capacity is members * working days (before vacation deduction)
    const baseCapacity = members.length * workingDays;
    const totalVacationDays = members.reduce((sum, m) => sum + (m.vacationDays || 0), 0);
    const capacityAfterVacation = baseCapacity - totalVacationDays;
    const oncallDays = Math.min(capacityAfterVacation, sprints * oncallPerSprint * 10);
    const capacityAfterOncall = Math.max(0, capacityAfterVacation - oncallDays);
    const bufferDays = Math.round(capacityAfterOncall * (bufferPercentage / 100));
    const availableCapacity = Math.max(0, capacityAfterOncall - bufferDays);

    const result = {
      baseCapacity,
      vacationDays: totalVacationDays,
      oncallDays,
      bufferDays,
      availableCapacity: Math.round(availableCapacity)
    };
    // Only close if it wasn't open before
    if (!wasOpen) {
      await this.closeTeamConfig();
    }
    return result;
  }
}
