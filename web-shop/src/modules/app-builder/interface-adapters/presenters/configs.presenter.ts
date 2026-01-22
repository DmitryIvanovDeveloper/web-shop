import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import { APP_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { AppConfig } from '../../domain/entities/app-config.entity';
import type { GrapeJsProjectData } from '../../domain/entities/template.entity';
import type { GetAppConfigsListUseCase } from '../../application/use-cases/get-app-configs-list.use-case';
import type { DeleteAppConfigUseCase } from '../../application/use-cases/delete-app-config.use-case';
import type { SaveAppConfigUseCase, SaveAppConfigRequest } from '../../application/use-cases/save-app-config.use-case';
import type { PublishAppConfigUseCase, PublishAppConfigRequest } from '../../application/use-cases/publish-app-config.use-case';

export interface ConfigsViewModel {
  configs: AppConfig[];
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  error: string | null;
  selectedConfigId: string | null;
  selectedConfig: AppConfig | null;
}

@injectable()
export class ConfigsPresenter {
  private readonly subscribers: Array<(vm: ConfigsViewModel) => void> = [];

  private vm: ConfigsViewModel = {
    configs: [],
    isLoading: false,
    isSaving: false,
    isDeleting: false,
    error: null,
    selectedConfigId: null,
    selectedConfig: null,
  };

  constructor(
    @inject(APP_BUILDER_TYPES.GetAppConfigsListUseCase)
    private readonly getAppConfigsListUseCase: GetAppConfigsListUseCase,
    @inject(APP_BUILDER_TYPES.DeleteAppConfigUseCase)
    private readonly deleteAppConfigUseCase: DeleteAppConfigUseCase,
    @inject(APP_BUILDER_TYPES.SaveAppConfigUseCase)
    private readonly saveAppConfigUseCase: SaveAppConfigUseCase,
    @inject(APP_BUILDER_TYPES.PublishAppConfigUseCase)
    private readonly publishAppConfigUseCase: PublishAppConfigUseCase
  ) {}

  public subscribe(cb: (vm: ConfigsViewModel) => void): () => void {
    this.subscribers.push(cb);
    cb(this.vm);
    return () => {
      const idx = this.subscribers.indexOf(cb);
      if (idx >= 0) this.subscribers.splice(idx, 1);
    };
  }

  private notify(): void {
    for (const cb of this.subscribers) cb(this.vm);
  }

  public getViewModel(): ConfigsViewModel {
    return this.vm;
  }

  public async loadConfigs(appId: string): Promise<Result<void, Error>> {
    this.vm = {
      ...this.vm,
      isLoading: true,
      error: null,
    };
    this.notify();

    const result = await this.getAppConfigsListUseCase.execute({ appId });

    if (result.isFailure) {
      this.vm = {
        ...this.vm,
        isLoading: false,
        error: result.error?.message ?? 'Failed to load configs',
      };
      this.notify();
      return Result.error(result.error ?? new Error('Failed to load configs'));
    }

    this.vm = {
      ...this.vm,
      isLoading: false,
      configs: result.value ?? [],
    };
    this.notify();

    return Result.ok<void, Error>(undefined as void);
  }

  public async selectConfig(configId: string | null): Promise<void> {
    if (!configId) {
      this.vm = {
        ...this.vm,
        selectedConfigId: null,
        selectedConfig: null,
      };
      this.notify();
      return;
    }

    const config = this.vm.configs.find(c => c.id === configId);
    this.vm = {
      ...this.vm,
      selectedConfigId: configId,
      selectedConfig: config || null,
    };
    this.notify();
  }

  public async saveConfig(appId: string, merchantId: string, configData: GrapeJsProjectData): Promise<Result<AppConfig, Error>> {
    this.vm = {
      ...this.vm,
      isSaving: true,
      error: null,
    };
    this.notify();

    const request: SaveAppConfigRequest = {
      appId,
      merchantId,
      config: configData,
      draftConfig: configData,
    };

    const result = await this.saveAppConfigUseCase.execute(request);

    if (result.isFailure) {
      this.vm = {
        ...this.vm,
        isSaving: false,
        error: result.error?.message ?? 'Failed to save config',
      };
      this.notify();
      return result;
    }

    // После успешного сохранения обновляем список
    await this.loadConfigs(appId);

    this.vm = {
      ...this.vm,
      isSaving: false,
    };
    this.notify();

    return result;
  }

  public async deleteConfig(configId: string, appId: string): Promise<Result<void, Error>> {
    this.vm = {
      ...this.vm,
      isDeleting: true,
      error: null,
    };
    this.notify();

    const result = await this.deleteAppConfigUseCase.execute({ configId });

    if (result.isFailure) {
      this.vm = {
        ...this.vm,
        isDeleting: false,
        error: result.error?.message ?? 'Failed to delete config',
      };
      this.notify();
      return result;
    }

    // После успешного удаления обновляем список
    await this.loadConfigs(appId);

    this.vm = {
      ...this.vm,
      isDeleting: false,
    };
    this.notify();

    return Result.ok<void, Error>(undefined as void);
  }

  public async publishConfig(configId: string, appId: string): Promise<Result<AppConfig, Error>> {
    this.vm = {
      ...this.vm,
      isSaving: true,
      error: null,
    };
    this.notify();

    const result = await this.publishAppConfigUseCase.execute({ configId });

    if (result.isFailure) {
      this.vm = {
        ...this.vm,
        isSaving: false,
        error: result.error?.message ?? 'Failed to publish config',
      };
      this.notify();
      return result;
    }

    // После успешной публикации обновляем список
    await this.loadConfigs(appId);

    this.vm = {
      ...this.vm,
      isSaving: false,
    };
    this.notify();

    return result;
  }

  public clearSelection(): void {
    this.vm = {
      ...this.vm,
      selectedConfigId: null,
      selectedConfig: null,
    };
    this.notify();
  }
}