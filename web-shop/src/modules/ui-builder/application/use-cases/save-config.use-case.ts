import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import { AppConfigFactory } from '../../domain/entities/app-config.entity';
import type { ConfigStoragePort } from '../ports/config-storage.port';
import type { ConfigValidatorPort } from '../ports/config-validator.port';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { Logger } from '@/application/ports/logger.port';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';
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
    private readonly _validator: ConfigValidatorPort,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public async execute(input: SaveConfigInput): Promise<Result<SaveConfigOutput, Error>> {
    const { appId, merchantId, config } = input;

    this._logger.info(`[SaveConfigUseCase] Saving config for app_id: ${appId}`);

    // Validate config
    const validationResult = await this._validator.validate(config);

    if (validationResult.isFailure) {
      const errors = validationResult.error ?? [];
      this._logger.error(`[SaveConfigUseCase] Validation failed`, errors);
      return Result.error(new ConfigValidationError(
        'Config validation failed',
        errors.map(e => `${e.path}: ${e.message}`)
      ));
    }

    const validatedConfig = (validationResult.value ?? {}) as Record<string, unknown>;

    // Load current config to get version
    const currentConfigResult = await this._storage.loadConfig(appId);
    
    let newVersion: ConfigVersion;
    if (currentConfigResult.isSuccess && currentConfigResult.value) {
      // Increment version from current
      newVersion = currentConfigResult.value.version.increment();
      
      // Deactivate current config
      const deactivateResult = await this._storage.deactivateConfig(appId);
      if (deactivateResult.isFailure) {
        this._logger.error(`[SaveConfigUseCase] Failed to deactivate current config`, deactivateResult.error);
        return Result.error(new ConfigSaveError(appId, 'Failed to deactivate current config'));
      }
    } else {
      // First version
      newVersion = ConfigVersion.initial();
    }

    // Create new config entity
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

    // Save new config
    const saveResult = await this._storage.saveConfig(newConfig);

    if (saveResult.isFailure) {
      this._logger.error(`[SaveConfigUseCase] Failed to save config`, saveResult.error);
      const reason = saveResult.error?.message ?? 'Failed to save config';
      return Result.error(new ConfigSaveError(appId, reason));
    }

    this._logger.info(`[SaveConfigUseCase] Config saved successfully`, {
      appId,
      version: newVersion.value
    });

    return Result.ok({
      version: newVersion.value,
      savedAt: new Date()
    });
  }
}














