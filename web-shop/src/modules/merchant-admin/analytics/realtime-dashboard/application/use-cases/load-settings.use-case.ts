import { injectable, inject } from 'inversify';
import { DashboardSettings } from '../../domain/value-objects/dashboard-settings.value-object';
import { ROOT_TYPES } from '../../../../../../infrastructure/bootstrap/types';
import { Result } from '@/shared/result/result';

export interface LoadSettingsInput {
  userId: string;
  queryParams?: URLSearchParams;
}

@injectable()
export class LoadSettingsUseCase {
  execute(input: LoadSettingsInput): Result<DashboardSettings, Error> {
    
    if (input.queryParams && input.queryParams.toString()) {
      const settingsResult = DashboardSettings.fromQueryParams(input.queryParams);
      if (settingsResult.isSuccess) {
        return Result.ok(settingsResult.value!);
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
      if (settingsResult.isSuccess) {
        return Result.ok(settingsResult.value!);
      }
        } catch {
          
        }
      }
    }

    return Result.ok(DashboardSettings.createDefault());
  }
}
