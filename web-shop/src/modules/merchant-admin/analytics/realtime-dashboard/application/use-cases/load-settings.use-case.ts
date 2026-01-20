import { injectable, inject } from 'inversify';
import { DashboardSettings } from '../../domain/value-objects/dashboard-settings.value-object';
import { ROOT_TYPES } from '../../../../../../infrastructure/bootstrap/types';
import { Result, Success } from '../../../../../../shared/domain/result/result';

export interface LoadSettingsInput {
  userId: string;
  queryParams?: URLSearchParams;
}

@injectable()
export class LoadSettingsUseCase {
  execute(input: LoadSettingsInput): Result<DashboardSettings, Error> {
    
    if (input.queryParams && input.queryParams.toString()) {
      const settingsResult = DashboardSettings.fromQueryParams(input.queryParams);
      if (settingsResult.success) {
        return new Success(settingsResult.data);
      }
    }

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
          
        }
      }
    }

    return new Success(DashboardSettings.createDefault());
  }
}
