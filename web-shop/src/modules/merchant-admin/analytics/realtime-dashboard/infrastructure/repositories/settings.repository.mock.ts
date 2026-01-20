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
      
      const response = await fetch('/mocks/api/settings/current.json');
      const data = await response.json();

      this.settings = data as DashboardSettings;
      return this.settings;
    } catch (error) {
            return null;
    }
  }

  async save(settings: DashboardSettings): Promise<void> {

    this.settings = settings;
  }

  async reset(): Promise<void> {
    this.settings = null;
  }

  getCurrent(): DashboardSettings | null {
    return this.settings;
  }
}

export const settingsRepository = new SettingsRepositoryMock(
  
  {
    info: () => {},
    warn: () => {},
    debug: () => {},
    error: () => {},
  }
);

