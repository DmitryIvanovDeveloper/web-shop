import { inject, injectable } from 'inversify';
import type { ConfigStoragePort } from '../ports/config-storage.port';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
@injectable()
export class LoadConfigUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.ConfigStorage)
    private readonly _storage: ConfigStoragePort
  ) {}

  public async execute(appId: string): Promise<void> {
    await this._storage.loadConfig(appId);
  }
}




















