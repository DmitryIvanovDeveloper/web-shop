import { injectable, inject } from 'inversify';
import type { DashboardSettings } from '../../domain/value-objects/dashboard-settings.value-object';
import { ROOT_TYPES } from '../../../../../../infrastructure/bootstrap/types';
import { Result, Success } from '@/shared/result/result';

export interface ApplySettingsInput {
  settings: DashboardSettings;
  userId: string;
}

@injectable()
export class ApplySettingsUseCase {
  public execute(input: ApplySettingsInput): Result<void, Error> {

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
