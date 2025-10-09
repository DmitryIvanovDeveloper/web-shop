import { DashboardSettings } from '../../domain/value-objects/dashboard-settings.value-object';
import { Result, Success } from '../../../../../../shared/domain/result/result';

export interface LoadSettingsInput {
  userId: string;
  queryParams?: URLSearchParams;
}

export class LoadSettingsUseCase {
  execute(input: LoadSettingsInput): Result<DashboardSettings, Error> {
    // First try to load from URL query params
    if (input.queryParams && input.queryParams.toString()) {
      const settingsResult = DashboardSettings.fromQueryParams(input.queryParams);
      if (settingsResult.success) {
        return new Success(settingsResult.data);
      }
    }

    // Then try localStorage
    if (typeof localStorage !== 'undefined') {
      const key = `dashboard-settings-${input.userId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const params = new URLSearchParams();
          Object.keys(parsed).forEach(key => {
            if (parsed[key]) params.set(key, parsed[key]);
          });
          const settingsResult = DashboardSettings.fromQueryParams(params);
          if (settingsResult.success) {
            return new Success(settingsResult.data);
          }
        } catch {
          // Fall through to default
        }
      }
    }

    // Default settings
    return new Success(DashboardSettings.createDefault());
  }
}
