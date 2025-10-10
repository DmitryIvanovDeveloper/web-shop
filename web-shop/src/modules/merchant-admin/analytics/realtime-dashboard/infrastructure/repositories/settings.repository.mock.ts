import { DashboardSettings } from '../../domain/value-objects/dashboard-settings.value-object';

export class SettingsRepositoryMock {
  private settings: DashboardSettings | null = null;

  async load(): Promise<DashboardSettings | null> {
    try {
      // Load from mock JSON
      const response = await fetch('/mocks/api/settings/current.json');
      const data = await response.json();
      
      // Store in memory
      this.settings = data as DashboardSettings;
      return this.settings;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return null;
    }
  }

  async save(settings: DashboardSettings): Promise<void> {
    // In real app, this would POST to API
    // For now, just store in memory
    this.settings = settings;
    console.log('Settings saved (simulated):', settings);
  }

  async reset(): Promise<void> {
    this.settings = null;
    console.log('Settings reset');
  }

  getCurrent(): DashboardSettings | null {
    return this.settings;
  }
}

// Singleton instance
export const settingsRepository = new SettingsRepositoryMock();

