import { DashboardSettings } from '../../domain/value-objects/dashboard-settings.value-object';
import { Result, Success } from '../../../../../../shared/domain/result/result';

export interface ApplySettingsInput {
  settings: DashboardSettings;
  userId: string;
}

export class ApplySettingsUseCase {
  public execute(input: ApplySettingsInput): Result<void, Error> {
    // In a real implementation, this would persist settings
    // For now, we just return success as settings are managed in presenter
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`dashboard-settings-${input.userId}`, JSON.stringify({
        dateRange: input.settings.toQueryParams().get('dateRange'),
        refreshInterval: input.settings.toQueryParams().get('refreshInterval'),
        theme: input.settings.toQueryParams().get('theme')
      }));
    }
    
    return new Success(undefined);
  }
}
