import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import type { Logger } from '@/application/ports/logger.port';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { Template, TemplatePageSnapshot } from '../../domain/entities/template.entity';
import type {
  TemplateSummary,
  PaginationParams,
} from '../../application/ports/template-repository.port';
import type { UserAppConfig, UserAppConfigSummary } from '../../domain/entities/user-app-config.entity';
import type { ListUserAppConfigsUseCase } from '../../application/use-cases/list-user-app-configs.use-case';
import type { ApplyUserAppConfigUseCase } from '../../application/use-cases/apply-user-app-config.use-case';
import type { CreateTemplateUseCase, CreateTemplateInput } from '../../application/use-cases/create-template.use-case';
import type { UpdateTemplateUseCase, UpdateTemplateInput } from '../../application/use-cases/update-template.use-case';
import type { DeleteTemplateUseCase } from '../../application/use-cases/delete-template.use-case';
import type { ListTemplatesUseCase } from '../../application/use-cases/list-templates.use-case';
import type { GetTemplateDetailsUseCase } from '../../application/use-cases/get-template-details.use-case';
import type { PublishTemplateUseCase } from '../../application/use-cases/publish-template.use-case';
import type { UIBuilderPresenter } from './ui-builder.presenter';
import type { PageConstructorPresenter } from './page-constructor.presenter';

export interface TemplatesViewModel {
  templates: TemplateSummary[];
  selectedTemplateId: string | null;
  selectedTemplate: Template | null;
  userAppConfigs: UserAppConfigSummary[];
  selectedUserAppConfigId: string | null;
  isLoadingList: boolean;
  isLoadingDetails: boolean;
  isLoadingUserAppConfigs: boolean;
  isSaving: boolean;
  error: string | null;
  // Optional search / pagination state for future extension
  query: string;
  pagination: PaginationParams | null;
}

@injectable()
export class TemplatesPresenter {
  private readonly subscribers: Array<(vm: TemplatesViewModel) => void> = [];

  private isAdmin: boolean = false;
  private currentAppId: string | null = null;
  private currentMerchantId: string | null = null;

  private vm: TemplatesViewModel = {
    templates: [],
    selectedTemplateId: null,
    selectedTemplate: null,
    userAppConfigs: [],
    selectedUserAppConfigId: null,
    isLoadingList: false,
    isLoadingDetails: false,
    isLoadingUserAppConfigs: false,
    isSaving: false,
    error: null,
    query: '',
    pagination: null,
  };

  constructor(
    @inject(UI_BUILDER_TYPES.CreateTemplateUseCase)
    private readonly createTemplateUseCase: CreateTemplateUseCase,
    @inject(UI_BUILDER_TYPES.UpdateTemplateUseCase)
    private readonly updateTemplateUseCase: UpdateTemplateUseCase,
    @inject(UI_BUILDER_TYPES.DeleteTemplateUseCase)
    private readonly deleteTemplateUseCase: DeleteTemplateUseCase,
    @inject(UI_BUILDER_TYPES.ListTemplatesUseCase)
    private readonly listTemplatesUseCase: ListTemplatesUseCase,
    @inject(UI_BUILDER_TYPES.GetTemplateDetailsUseCase)
    private readonly getTemplateDetailsUseCase: GetTemplateDetailsUseCase,
    @inject(UI_BUILDER_TYPES.PublishTemplateUseCase)
    private readonly publishTemplateUseCase: PublishTemplateUseCase,
    @inject(UI_BUILDER_TYPES.ListUserAppConfigsUseCase)
    private readonly listUserAppConfigsUseCase: ListUserAppConfigsUseCase,
    @inject(UI_BUILDER_TYPES.ApplyUserAppConfigUseCase)
    private readonly applyUserAppConfigUseCase: ApplyUserAppConfigUseCase,
    @inject(UI_BUILDER_TYPES.UIBuilderPresenter)
    private readonly uiBuilderPresenter: UIBuilderPresenter,
    @inject(UI_BUILDER_TYPES.PageConstructorPresenter)
    private readonly pageConstructorPresenter: PageConstructorPresenter,
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {}

  public setAdmin(isAdmin: boolean): void {
    this.isAdmin = isAdmin;

    if (isAdmin) {
      try {
        const savedTemplateId = localStorage.getItem('ui-builder-selected-template-id');
        if (savedTemplateId) {
          this.selectTemplate(savedTemplateId).catch(error => {
            localStorage.removeItem('ui-builder-selected-template-id');
          });
        }
      } catch (error) {
      }
    }
  }

  public async setAppId(appId: string): Promise<void> {
    this.currentAppId = appId;

    if (!this.isAdmin) {
      await this.loadUserAppConfigs(appId);
    }
  }

  public setMerchantId(merchantId: string): void {
    this.currentMerchantId = merchantId;
  }

  public subscribe(cb: (vm: TemplatesViewModel) => void): () => void {
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

  public getViewModel(): TemplatesViewModel {
    return this.vm;
  }

  public selectUserAppConfig(userAppConfigId: string | null): void {
    this.vm = {
      ...this.vm,
      selectedUserAppConfigId: userAppConfigId,
    };
    this.notify();
  }

  public async loadUserAppConfigs(appId: string): Promise<Result<void, Error>> {
    this.vm = {
      ...this.vm,
      isLoadingUserAppConfigs: true,
      error: null,
    };
    this.notify();

    const result = await this.listUserAppConfigsUseCase.execute({
      appId,
      includeInactive: true,
    });

    if (result.isFailure) {
      this.vm = {
        ...this.vm,
        isLoadingUserAppConfigs: false,
        error: result.error?.message ?? 'Failed to load user app configs',
      };
      this.notify();
      return Result.error(result.error ?? new Error('Failed to load user app configs'));
    }

    this.vm = {
      ...this.vm,
      isLoadingUserAppConfigs: false,
      userAppConfigs: result.value ?? [],
    };
    this.notify();

    return Result.ok<void, Error>(undefined as void);
  }

  public async applyUserAppConfig(userAppConfigId: string): Promise<Result<void, Error>> {
    if (!this.isAdmin) {
      const result = await this.applyUserAppConfigUseCase.execute(userAppConfigId);
      if (result.isSuccess) {
        // Mark the config as selected for UI feedback
        this.selectUserAppConfig(userAppConfigId);
      }
      return result;
    }
    return Result.error(new Error('Admins cannot apply user app configs'));
  }

  public async saveCurrentConfigAsUserAppConfig(name?: string): Promise<Result<UserAppConfig, Error>> {
    if (this.isAdmin) {
      return Result.error(new Error('Admins cannot save user app configs'));
    }

    if (!this.currentAppId) {
      return Result.error(new Error('AppId not set'));
    }

    const builderVm = this.uiBuilderPresenter.getViewModel();
    const pageVm = this.pageConstructorPresenter.getViewModel();

    let appConfigSnapshot = builderVm.config;
    const defaultConfig = this.uiBuilderPresenter.createDefaultConfigSnapshot();

    if (!appConfigSnapshot || typeof appConfigSnapshot !== 'object' || Object.keys(appConfigSnapshot).length === 0) {
      appConfigSnapshot = defaultConfig;
    }

    if (typeof defaultConfig === 'object' && defaultConfig !== null &&
        typeof appConfigSnapshot === 'object' && appConfigSnapshot !== null) {
      try {
        appConfigSnapshot = this.mergeConfigs(defaultConfig as Record<string, unknown>, appConfigSnapshot as Record<string, unknown>);
      } catch (error) {
        appConfigSnapshot = defaultConfig;
      }
    }

    this.vm = {
      ...this.vm,
      isSaving: true,
      error: null,
    };
    this.notify();

    try {
      const response = await fetch('/api/app-configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appId: this.currentAppId,
          name: name || `Config v${Date.now()}`,
          config: appConfigSnapshot,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();

      await this.loadUserAppConfigs(this.currentAppId);

      this.vm = {
        ...this.vm,
        isSaving: false,
      };
      this.notify();

      return Result.ok({
        id: data.appConfig.id,
        appId: data.appConfig.app_id,
        name: name,
        config: data.appConfig.config,
        version: data.appConfig.version,
        isActive: data.appConfig.is_active,
        isDraft: data.appConfig.is_draft,
        createdAt: new Date(data.appConfig.created_at),
        updatedAt: new Date(data.appConfig.updated_at),
      });
    } catch (error) {
      this.vm = {
        ...this.vm,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Failed to save config',
      };
      this.notify();

      return Result.error(error instanceof Error ? error : new Error('Failed to save user app config'));
    }
  }

  public async loadTemplates(query?: string): Promise<Result<void, Error>> {
    this.vm = {
      ...this.vm,
      isLoadingList: true,
      error: null,
      query: query ?? this.vm.query,
    };
    this.notify();

    const result = await this.listTemplatesUseCase.execute({
      query: query ?? this.vm.query,
      pagination: this.vm.pagination ?? undefined,
    });

    if (result.isFailure) {
      this.vm = {
        ...this.vm,
        isLoadingList: false,
        error: result.error?.message ?? 'Failed to load templates',
      };
      this.notify();
      return Result.error(result.error ?? new Error('Failed to load templates'));
    }

    this.vm = {
      ...this.vm,
      isLoadingList: false,
      templates: result.value ?? [],
    };
    this.notify();

    return Result.ok<void, Error>(undefined as void);
  }

  public async selectTemplate(id: string | null): Promise<void> {
    if (!id) {
      this.vm = {
        ...this.vm,
        selectedTemplateId: null,
        selectedTemplate: null,
        isLoadingDetails: false,
        error: null,
      };
      this.notify();
      return;
    }

    this.vm = {
      ...this.vm,
      selectedTemplateId: id,
      isLoadingDetails: true,
      error: null,
    };
    this.notify();

    const result = await this.getTemplateDetailsUseCase.execute({ id });

    if (result.isFailure) {
      this.vm = {
        ...this.vm,
        isLoadingDetails: false,
        selectedTemplate: null,
        error: result.error?.message ?? 'Failed to load template details',
      };
      this.notify();
      return;
    }

    const template = result.value ?? null;

    this.vm = {
      ...this.vm,
      isLoadingDetails: false,
      selectedTemplate: template,
    };
    this.notify();

    if (this.isAdmin && id) {
      try {
        localStorage.setItem('ui-builder-selected-template-id', id);
      } catch (error) {
      }
    }

    if (this.isAdmin && template?.appConfig) {
      this.uiBuilderPresenter.applyTemplateConfig(template.appConfig);
    }
  }

  public async createTemplateFromCurrentConfig(
    name: string,
    options?: { description?: string }
  ): Promise<Result<Template, Error>> {
    if (!this.isAdmin) {
      const error = new Error('Only admin can create templates');
      return Result.error(error);
    }

    const builderVm = this.uiBuilderPresenter.getViewModel();
    const pageVm = this.pageConstructorPresenter.getViewModel();
    const pageStyles = this.pageConstructorPresenter.getPageStyles();

    // Get current config or fallback to default config
    let appConfigSnapshot = builderVm.config;
    const defaultConfig = this.uiBuilderPresenter.createDefaultConfigSnapshot();

    if (!appConfigSnapshot || typeof appConfigSnapshot !== 'object' || Object.keys(appConfigSnapshot).length === 0) {
      appConfigSnapshot = defaultConfig;
    }

    if (typeof defaultConfig === 'object' && defaultConfig !== null &&
        typeof appConfigSnapshot === 'object' && appConfigSnapshot !== null) {
      try {
        appConfigSnapshot = this.mergeConfigs(defaultConfig as Record<string, unknown>, appConfigSnapshot as Record<string, unknown>);
      } catch (error) {
        appConfigSnapshot = defaultConfig;
      }
    }

    const pageSnapshot: TemplatePageSnapshot = {
      pageSlug: pageVm.pageSlug,
      pageConfig: {
        sections: pageVm.sections,
        pageStyles,
      },
    };

    const input: CreateTemplateInput = {
      name,
      description: options?.description,
      appConfig: appConfigSnapshot,
      pages: [pageSnapshot],
    };

    this.vm = {
      ...this.vm,
      isSaving: true,
      error: null,
    };
    this.notify();

    const result = await this.createTemplateUseCase.execute(input);

    if (result.isFailure) {
      this.vm = {
        ...this.vm,
        isSaving: false,
        error: result.error?.message ?? 'Failed to create template',
      };
      this.notify();
      return Result.error(result.error ?? new Error('Failed to create template'));
    }

    const created = result.value!;
    await this.loadTemplates(this.vm.query);

    this.vm = {
      ...this.vm,
      isSaving: false,
      selectedTemplateId: created.id,
      selectedTemplate: created,
    };
    this.notify();

    return Result.ok(created);
  }

  public async createBaseTemplate(
    name: string,
    options?: { description?: string }
  ): Promise<Result<void, Error>> {
    if (!this.isAdmin) {
      const error = new Error('Only admin can create templates');
      return Result.error(error);
    }

    const appConfigSnapshot = this.uiBuilderPresenter.createDefaultConfigSnapshot();
    const pageSnapshot: TemplatePageSnapshot = this.pageConstructorPresenter.createDefaultTemplatePageSnapshot();

    let cleanAppConfig: unknown;
    let cleanPages: TemplatePageSnapshot[];

    try {
      cleanAppConfig = JSON.parse(JSON.stringify(appConfigSnapshot));
    } catch (error) {
      cleanAppConfig = { error: 'App config contains non-serializable data' };
    }

    try {
      cleanPages = JSON.parse(JSON.stringify([pageSnapshot]));
    } catch (error) {
      cleanPages = [{ pageSlug: 'home', pageConfig: { sections: [], pageStyles: {} } }];
    }

    const input: CreateTemplateInput = {
      name,
      description: options?.description,
      appConfig: cleanAppConfig,
      pages: cleanPages,
    };

    this.vm = {
      ...this.vm,
      isSaving: true,
      error: null,
    };
    this.notify();

    const result = await this.createTemplateUseCase.execute(input);

    if (result.isFailure) {
      this.vm = {
        ...this.vm,
        isSaving: false,
        error: result.error?.message ?? 'Failed to create template',
      };
      this.notify();
      return Result.error(result.error ?? new Error('Failed to create template'));
    }

    const created = result.value!;

    await this.loadTemplates(this.vm.query);

    this.vm = {
      ...this.vm,
      isSaving: false,
      selectedTemplateId: created.id,
      selectedTemplate: created,
    };
    this.notify();

    return this.applyTemplateToBuilder(created);
  }

  public async updateTemplate(patch: UpdateTemplateInput): Promise<Result<Template, Error>> {
    if (!this.isAdmin) {
      const error = new Error('Only admin can update templates');
      return Result.error(error);
    }

    if (!patch.id) {
      return Result.error(new Error('Template id is required'));
    }
    this.vm = {
      ...this.vm,
      isSaving: true,
      error: null,
    };
    this.notify();

    const result = await this.updateTemplateUseCase.execute(patch);

    if (result.isFailure) {
      this.vm = {
        ...this.vm,
        isSaving: false,
        error: result.error?.message ?? 'Failed to update template',
      };
      this.notify();
      return Result.error(result.error ?? new Error('Failed to update template'));
    }

    const updated = result.value!;
    await this.loadTemplates(this.vm.query);

    this.vm = {
      ...this.vm,
      isSaving: false,
      selectedTemplateId: updated.id,
      selectedTemplate: updated,
    };
    this.notify();

    return Result.ok(updated);
  }

  public async deleteTemplate(id: string): Promise<Result<void, Error>> {
    if (!this.isAdmin) {
      const error = new Error('Only admin can delete templates');
      return Result.error(error);
    }
    this.vm = {
      ...this.vm,
      isSaving: true,
      error: null,
    };
    this.notify();

    const result = await this.deleteTemplateUseCase.execute({ id });

    if (result.isFailure) {
      this.vm = {
        ...this.vm,
        isSaving: false,
        error: result.error?.message ?? 'Failed to delete template',
      };
      this.notify();
      return Result.error(result.error ?? new Error('Failed to delete template'));
    }

    await this.loadTemplates(this.vm.query);

    this.vm = {
      ...this.vm,
      isSaving: false,
      selectedTemplateId: this.vm.selectedTemplateId === id ? null : this.vm.selectedTemplateId,
      selectedTemplate: this.vm.selectedTemplateId === id ? null : this.vm.selectedTemplate,
    };
    this.notify();

    return Result.ok<void, Error>(undefined as void);
  }

  public async saveSelectedTemplateFromCurrentConfig(): Promise<Result<Template, Error>> {
    const callId = Math.random().toString(36).substr(2, 9);

    if ((this.vm as any).isSavingTemplate) {
      return Result.error(new Error('Already saving template'));
    }
    (this.vm as any).isSavingTemplate = true;

    if (!this.isAdmin) {
      const error = new Error('Only admin can save template drafts');
      (this.vm as any).isSavingTemplate = false;
      return Result.error(error);
    }

    if (!this.vm.selectedTemplateId) {
      const error = new Error('No template selected to save');
      (this.vm as any).isSavingTemplate = false;
      return Result.error(error);
    }

    const builderVm = this.uiBuilderPresenter.getViewModel();
    const pageVm = this.pageConstructorPresenter.getViewModel();
    const pageStyles = this.pageConstructorPresenter.getPageStyles();

    const appConfigSnapshot = builderVm.config;
    if (!appConfigSnapshot) {
      const error = new Error('Cannot save template: app config is not loaded');
      (this.vm as any).isSavingTemplate = false;
      return Result.error(error);
    }

    let cleanAppConfig: unknown;
    let cleanPages: TemplatePageSnapshot[];

    try {
      cleanAppConfig = JSON.parse(JSON.stringify(appConfigSnapshot));
    } catch (error) {
      cleanAppConfig = { error: 'App config contains non-serializable data' };
    }

    const pageSnapshot: TemplatePageSnapshot = {
      pageSlug: pageVm.pageSlug,
      pageConfig: {
        sections: pageVm.sections,
        pageStyles,
      },
    };

    try {
      cleanPages = JSON.parse(JSON.stringify([pageSnapshot]));
    } catch (error) {
      cleanPages = [{ pageSlug: pageVm.pageSlug || 'home', pageConfig: { sections: [], pageStyles: {} } }];
    }
    try {
      const response = await fetch('/api/templates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: this.vm.selectedTemplateId,
          appConfig: cleanAppConfig,
          pages: cleanPages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();

      if (this.vm.selectedTemplateId === data.id) {
        this.vm = {
          ...this.vm,
          selectedTemplate: data,
        };
        this.notify();
      }

      return Result.ok(data);
    } catch (error) {
      (this.vm as any).isSavingTemplate = false;
      return Result.error(error instanceof Error ? error : new Error('Failed to autosave template'));
    }
  }

  /**
   * Apply currently selected Template into UI Builder and Page Constructor.
   * Uses current pageSlug to choose matching pageConfig, falls back to first page.
   */
  public async applySelectedTemplateToBuilder(): Promise<Result<void, Error>> {
    const selected = this.vm.selectedTemplate;
    if (!selected) {
      return Result.error(new Error('No template selected'));
    }

    return this.applyTemplateToBuilder(selected);
  }

  /**
   * Internal helper: apply given Template to app + current page.
   */
  private applyTemplateToBuilder(template: Template): Result<void, Error> {
    const builderVm = this.uiBuilderPresenter.getViewModel();
    const pageVm = this.pageConstructorPresenter.getViewModel();
    const appId = builderVm.appId || pageVm.appId;

    if (!appId) {
      return Result.error(new Error('AppId is not set in UIBuilder/PageConstructor'));
    }

    this.uiBuilderPresenter.applyTemplateConfig(template.appConfig);

    const currentSlug = pageVm.pageSlug || 'home';
    const matchingPage =
      template.pages.find((p) => p.pageSlug === currentSlug) ?? template.pages[0] ?? null;

    if (matchingPage) {
      const merchantId = this.uiBuilderPresenter.getViewModel().merchantId || '550e8400-e29b-41d4-a716-446655440000';

      this.pageConstructorPresenter.applyTemplatePageConfig({
        appId,
        merchantId,
        pageSlug: matchingPage.pageSlug,
        pageConfig: matchingPage.pageConfig,
      });
    }

    return Result.ok<void, Error>(undefined as void);
  }

  private mergeConfigs(defaultConfig: Record<string, unknown>, currentConfig: Record<string, unknown>): Record<string, unknown> {
    const result = { ...defaultConfig };

    const mergeDeep = (target: Record<string, unknown>, source: Record<string, unknown>) => {
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) {
            target[key] = {};
          }
          mergeDeep(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
        } else if (source[key] !== undefined) {
          target[key] = source[key];
        }
      }
    };

    mergeDeep(result, currentConfig);
    return result;
  }

  public async updateUserAppConfigStatus(id: string, isActive: boolean): Promise<Result<UserAppConfig, Error>> {
    if (this.isAdmin) {
      return Result.error(new Error('Admins cannot modify user app config status'));
    }

    this.vm = {
      ...this.vm,
      isSaving: true,
      error: null,
    };
    this.notify();

    try {
      const response = await fetch(`/api/app-configs`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          isActive,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();

      const updatedConfig = data.appConfig;
      this.vm = {
        ...this.vm,
        userAppConfigs: this.vm.userAppConfigs.map(config =>
          config.id === id ? {
            ...config,
            isActive: updatedConfig.is_active,
            isDraft: updatedConfig.is_draft,
            updatedAt: new Date(updatedConfig.updated_at),
          } : config
        ),
        isSaving: false,
      };
      this.notify();

      return Result.ok({
        id: updatedConfig.id,
        appId: updatedConfig.app_id,
        config: updatedConfig.config,
        version: updatedConfig.version,
        isActive: updatedConfig.is_active,
        isDraft: updatedConfig.is_draft,
        createdAt: new Date(updatedConfig.created_at),
        updatedAt: new Date(updatedConfig.updated_at),
      });
    } catch (error) {
      this.vm = {
        ...this.vm,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Failed to update config status',
      };
      this.notify();

      return Result.error(error instanceof Error ? error : new Error('Failed to update user app config status'));
    }
  }


  public async markSelectedTemplatePublished(): Promise<Result<Template, Error>> {
    if (!this.isAdmin) {
      return Result.error(new Error('Only admin can publish templates'));
    }
    if (!this.vm.selectedTemplateId) {
      return Result.error(new Error('No template selected to publish'));
    }

    const result = await this.publishTemplateUseCase.execute({
      templateId: this.vm.selectedTemplateId,
    });

    if (result.isFailure) {
      return result;
    }

    await this.loadTemplates(this.vm.query);
    await this.selectTemplate(this.vm.selectedTemplateId);

    return result;
  }
}


