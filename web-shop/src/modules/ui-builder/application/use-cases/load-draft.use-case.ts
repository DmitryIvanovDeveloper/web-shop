import { inject, injectable } from 'inversify';
import type { ConfigStoragePort } from '../ports/config-storage.port';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import { Result } from '@/shared/result/result';
@injectable()
export class LoadDraftUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.ConfigStorage)
    private readonly _storage: ConfigStoragePort
  ) {}

  public async execute(appId: string): Promise<Result<unknown, Error>> {
    return Result.ok(null);
  }
}




















