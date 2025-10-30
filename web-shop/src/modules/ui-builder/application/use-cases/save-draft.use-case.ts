import { inject, injectable } from 'inversify';
import type { ConfigStoragePort } from '../ports/config-storage.port';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import { Result } from '@/shared/result/result';
import type { Logger } from '@/application/ports/logger.port';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';

@injectable()
export class SaveDraftUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.ConfigStorage)
    private readonly _storage: ConfigStoragePort,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public async execute(): Promise<Result<void, Error>> {
    this._logger.info('[SaveDraftUseCase] Stub execute');
    return Result.ok<void, Error>(undefined as void);
  }
}





