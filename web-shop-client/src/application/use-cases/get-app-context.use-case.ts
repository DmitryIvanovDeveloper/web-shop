import { inject, injectable } from 'inversify';
import type { AppContextPort } from '../ports/app-context.port';
import { TYPES } from '../../infrastructure/bootstrap/types';


@injectable()
export class GetAppContextUseCase {
  constructor(
    @inject(TYPES.AppContext)
    private readonly _appContext: AppContextPort
  ) {}

  
  execute(): { appId: string; merchantId: string | null } {
    return {
      appId: this._appContext.getAppId(),
      merchantId: this._appContext.getMerchantId()
    };
  }
}
