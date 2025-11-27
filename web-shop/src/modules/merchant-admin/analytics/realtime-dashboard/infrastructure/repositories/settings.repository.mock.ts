import { DashboardSettings } from '../../domain/value-objects/dashboard-settings.value-object';
import type { Logger } from '../../../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../../../infrastructure/bootstrap/types';
import { inject, injectable } from 'inversify';

@injectable()
export class SettingsRepositoryMock {
  private settings: DashboardSettings | null = null;

  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {}

  async load(): Promise<DashboardSettings | null> {
    try {
      // Load from mock JSON
      const response = await fetch('/mocks/api/settings/current.json');
      const data = await response.json();
      
      // Store in memory
      this.settings = data as DashboardSettings;
      return this.settings;
    } catch (error) {
      this.logger.error('[SettingsRepositoryMock] Failed to load settings', error as Error);
      return null;
    }
  }

  async save(settings: DashboardSettings): Promise<void> {
    // In real app, this would POST to API
    // For now, just store in memory
    this.settings = settings;
  }

  async reset(): Promise<void> {
    this.settings = null;
  }

  getCurrent(): DashboardSettings | null {
    return this.settings;
  }
}

// Singleton instance for hook usage
export const settingsRepository = new SettingsRepositoryMock(
  // For hook usage outside DI, we fallback to a no-op console logger.
  {
    info: () => {},
    warn: () => {},
    debug: () => {},
    error: () => {},
  }
);

