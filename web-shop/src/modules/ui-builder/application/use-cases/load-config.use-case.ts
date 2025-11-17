import { inject, injectable } from 'inversify';
import type { ConfigStoragePort } from '../ports/config-storage.port';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { Logger } from '@/application/ports/logger.port';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';

@injectable()
export class LoadConfigUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.ConfigStorage)
    private readonly _storage: ConfigStoragePort,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public async execute(appId: string): Promise<void> {
    this._logger.info('[LoadConfigUseCase] Loading config', { appId });
    await this._storage.loadConfig(appId);
  }
}




















