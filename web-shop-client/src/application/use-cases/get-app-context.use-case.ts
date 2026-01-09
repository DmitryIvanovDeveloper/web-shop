import { inject, injectable } from 'inversify';
import type { AppContextPort } from '../ports/app-context.port';
import { TYPES } from '../../infrastructure/bootstrap/types';

/**
 * Use case for getting application context information
 */
@injectable()
export class GetAppContextUseCase {
  constructor(
    @inject(TYPES.AppContext)
    private readonly _appContext: AppContextPort
  ) {}

  /**
   * Executes the use case to get current app context
   */
  execute(): { appId: string; merchantId: string | null } {
    return {
      appId: this._appContext.getAppId(),
      merchantId: this._appContext.getMerchantId()
    };
  }
}
