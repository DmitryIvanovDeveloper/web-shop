import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import { AppConfigFactory } from '../../domain/entities/app-config.entity';
import type { ConfigStoragePort } from '../ports/config-storage.port';
import type { ConfigValidatorPort } from '../ports/config-validator.port';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import { ConfigValidationError, ConfigSaveError } from '../../domain/errors/config.error';
import { ConfigVersion } from '../../domain/value-objects/config-version.vo';

export interface SaveConfigInput {
  appId: string;
  merchantId: string;
  config: Record<string, unknown>;
}

export interface SaveConfigOutput {
  version: number;
  savedAt: Date;
}

@injectable()
export class SaveConfigUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.ConfigStorage)
    private readonly _storage: ConfigStoragePort,
    @inject(UI_BUILDER_TYPES.ConfigValidator)
    private readonly _validator: ConfigValidatorPort
  ) {}

  public async execute(input: SaveConfigInput): Promise<Result<SaveConfigOutput, Error>> {
    const { appId, merchantId, config } = input;

    const validationResult = await this._validator.validate(config);

    if (validationResult.isFailure) {
      const errors = validationResult.error ?? [];
      return Result.error(new ConfigValidationError(
        'Config validation failed',
        errors.map(e => `${e.path}: ${e.message}`)
      ));
    }

    const validatedConfig = (validationResult.value ?? {}) as Record<string, unknown>;

    const currentConfigResult = await this._storage.loadConfig(appId);
    
    let newVersion: ConfigVersion;
    if (currentConfigResult.isSuccess && currentConfigResult.value) {
      newVersion = currentConfigResult.value.version.increment();
      
      const deactivateResult = await this._storage.deactivateConfig(appId);
      if (deactivateResult.isFailure) {
        return Result.error(new ConfigSaveError(appId, 'Failed to deactivate current config'));
      }
    } else {
      newVersion = ConfigVersion.initial();
    }

    const newConfig = AppConfigFactory.create({
      appId,
      merchantId,
      config: validatedConfig,
      version: newVersion,
      isActive: true,
      isDraft: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saveResult = await this._storage.saveConfig(newConfig);

    if (saveResult.isFailure) {
      const reason = saveResult.error?.message ?? 'Failed to save config';
      return Result.error(new ConfigSaveError(appId, reason));
    }

    return Result.ok({
      version: newVersion.value,
      savedAt: new Date()
    });
  }
}

