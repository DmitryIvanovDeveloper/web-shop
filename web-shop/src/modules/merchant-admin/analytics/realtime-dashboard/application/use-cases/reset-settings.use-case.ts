import { injectable, inject } from 'inversify';
import { DashboardSettings } from '../../domain/value-objects/dashboard-settings.value-object';
import { ROOT_TYPES } from '../../../../../../infrastructure/bootstrap/types';
import { Result, Success } from '../../../../../../shared/domain/result/result';

export interface ResetSettingsInput {
  userId: string;
}

@injectable()
export class ResetSettingsUseCase {
  execute(input: ResetSettingsInput): Result<DashboardSettings, Error> {
    // Clear settings from local storage
    if (typeof window !== 'undefined') {
      const key = `dashboard-settings-${input.userId}`;
      localStorage.removeItem(key);
    }

    // Return default settings
    return new Success(DashboardSettings.createDefault());
  }
}

