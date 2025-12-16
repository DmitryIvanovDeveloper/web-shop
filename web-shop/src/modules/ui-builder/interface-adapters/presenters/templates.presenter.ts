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
  isLoadingList: boolean;
  isLoadingDetails: boolean;
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

  private vm: TemplatesViewModel = {
    templates: [],
    selectedTemplateId: null,
    selectedTemplate: null,
    isLoadingList: false,
    isLoadingDetails: false,
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
    @inject(UI_BUILDER_TYPES.UIBuilderPresenter)
    private readonly uiBuilderPresenter: UIBuilderPresenter,
    @inject(UI_BUILDER_TYPES.PageConstructorPresenter)
    private readonly pageConstructorPresenter: PageConstructorPresenter,
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {}

  public setAdmin(isAdmin: boolean): void {
    this.isAdmin = isAdmin;
    this.logger.info('[TemplatesPresenter] Access mode updated', { isAdmin });

    // Load selected template ID from localStorage for admin
    if (isAdmin) {
      try {
        const savedTemplateId = localStorage.getItem('ui-builder-selected-template-id');
        if (savedTemplateId) {
          this.logger.info('[TemplatesPresenter] Restoring selected template from localStorage', { savedTemplateId });
          // Load template details but don't auto-apply yet (will be done in UIBuilderPage)
          this.selectTemplate(savedTemplateId).catch(error => {
            this.logger.error('[TemplatesPresenter] Failed to restore selected template', { savedTemplateId, error });
            // Clear invalid template ID from localStorage
            localStorage.removeItem('ui-builder-selected-template-id');
          });
        }
      } catch (error) {
        this.logger.warn('[TemplatesPresenter] Failed to load selected template ID from localStorage', { error });
      }
    }
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

  public async loadTemplates(query?: string): Promise<Result<void, Error>> {
    this.logger.info('[TemplatesPresenter] Loading templates', { query });
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
      this.logger.error('[TemplatesPresenter] Failed to load templates', {
        error: result.error,
      });
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

    this.logger.info('[TemplatesPresenter] Selecting template', { id });
    this.vm = {
      ...this.vm,
      selectedTemplateId: id,
      isLoadingDetails: true,
      error: null,
    };
    this.notify();

    const result = await this.getTemplateDetailsUseCase.execute({ id });

    if (result.isFailure) {
      this.logger.error('[TemplatesPresenter] Failed to load template details', {
        id,
        error: result.error,
      });
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

    // Save selected template ID to localStorage for persistence across page reloads
    if (this.isAdmin && id) {
      try {
        localStorage.setItem('ui-builder-selected-template-id', id);
      } catch (error) {
        this.logger.warn('[TemplatesPresenter] Failed to save selected template ID to localStorage', { error });
      }
    }

    this.logger.info('[TemplatesPresenter] Template selection completed', {
      id,
      hasTemplate: !!template,
      hasAppConfig: !!template?.appConfig
    });

    // Automatically apply template config for admin users
    if (this.isAdmin && template?.appConfig) {
      this.logger.info('[TemplatesPresenter] Auto-applying template config for admin');
      this.uiBuilderPresenter.applyTemplateConfig(template.appConfig);
    }
  }

  /**
   * Create template from current app + current page configuration.
   * Uses UIBuilderPresenter config and PageConstructorPresenter page state.
   */
  public async createTemplateFromCurrentConfig(
    name: string,
    options?: { description?: string }
  ): Promise<Result<Template, Error>> {
    if (!this.isAdmin) {
      const error = new Error('Only admin can create templates');
      this.logger.warn('[TemplatesPresenter] createTemplateFromCurrentConfig forbidden for non-admin', {
        name,
      });
      return Result.error(error);
    }

    this.logger.info('[TemplatesPresenter] Creating template from current config', { name });

    const builderVm = this.uiBuilderPresenter.getViewModel();
    const pageVm = this.pageConstructorPresenter.getViewModel();
    const pageStyles = this.pageConstructorPresenter.getPageStyles();

    // Get current config or fallback to default config
    let appConfigSnapshot = builderVm.config;
    const defaultConfig = this.uiBuilderPresenter.createDefaultConfigSnapshot();

    if (!appConfigSnapshot || typeof appConfigSnapshot !== 'object' || Object.keys(appConfigSnapshot).length === 0) {
      this.logger.info('[TemplatesPresenter] Using default config as current config is empty or not loaded');
      appConfigSnapshot = defaultConfig;
    }

    // Ensure we have a valid config by merging with default if needed
    if (typeof defaultConfig === 'object' && defaultConfig !== null &&
        typeof appConfigSnapshot === 'object' && appConfigSnapshot !== null) {
      try {
        appConfigSnapshot = this.mergeConfigs(defaultConfig as Record<string, unknown>, appConfigSnapshot as Record<string, unknown>);
      } catch (error) {
        this.logger.warn('[TemplatesPresenter] Failed to merge configs, using default', { error });
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
      this.logger.error('[TemplatesPresenter] Failed to create template', {
        error: result.error,
      });
      this.vm = {
        ...this.vm,
        isSaving: false,
        error: result.error?.message ?? 'Failed to create template',
      };
      this.notify();
      return Result.error(result.error ?? new Error('Failed to create template'));
    }

    const created = result.value!;
    // Reload list to ensure UI is in sync
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

  /**
   * Create a base Template from default app config + default home page config,
   * then immediately apply it to the builder.
   */
  public async createBaseTemplate(
    name: string,
    options?: { description?: string }
  ): Promise<Result<void, Error>> {
    if (!this.isAdmin) {
      const error = new Error('Only admin can create templates');
      this.logger.warn('[TemplatesPresenter] createBaseTemplate forbidden for non-admin', {
        name,
      });
      return Result.error(error);
    }

    this.logger.info('[TemplatesPresenter] Creating base template', { name });

    // Use the complete default config from UIBuilderPresenter for full editing capabilities
    const appConfigSnapshot = this.uiBuilderPresenter.createDefaultConfigSnapshot();
    const pageSnapshot: TemplatePageSnapshot = this.pageConstructorPresenter.createDefaultTemplatePageSnapshot();

    // Ensure app_config and page_configs are serializable
    let cleanAppConfig: unknown;
    let cleanPages: TemplatePageSnapshot[];

    try {
      cleanAppConfig = JSON.parse(JSON.stringify(appConfigSnapshot));
      this.logger.info('[TemplatesPresenter] App config serialized successfully');
    } catch (error) {
      this.logger.error('[TemplatesPresenter] Failed to serialize app config', { error });
      cleanAppConfig = { error: 'App config contains non-serializable data' };
    }

    try {
      cleanPages = JSON.parse(JSON.stringify([pageSnapshot]));
      this.logger.info('[TemplatesPresenter] Pages serialized successfully');
    } catch (error) {
      this.logger.error('[TemplatesPresenter] Failed to serialize pages', { error });
      cleanPages = [{ pageSlug: 'home', pageConfig: { sections: [], pageStyles: {} }, error: 'Page data contains non-serializable data' }];
    }

    this.logger.info('[TemplatesPresenter] Using complete default config for base template');

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
      this.logger.error('[TemplatesPresenter] Failed to create base template', {
        error: result.error,
      });
      this.vm = {
        ...this.vm,
        isSaving: false,
        error: result.error?.message ?? 'Failed to create template',
      };
      this.notify();
      return Result.error(result.error ?? new Error('Failed to create template'));
    }

    const created = result.value!;

    // Reload list and select created template
    await this.loadTemplates(this.vm.query);

    this.vm = {
      ...this.vm,
      isSaving: false,
      selectedTemplateId: created.id,
      selectedTemplate: created,
    };
    this.notify();

    // Immediately apply newly created template
    return this.applyTemplateToBuilder(created);
  }

  public async updateTemplate(patch: UpdateTemplateInput): Promise<Result<Template, Error>> {
    if (!this.isAdmin) {
      const error = new Error('Only admin can update templates');
      this.logger.warn('[TemplatesPresenter] updateTemplate forbidden for non-admin', {
        id: patch.id,
      });
      return Result.error(error);
    }

    if (!patch.id) {
      return Result.error(new Error('Template id is required'));
    }

    this.logger.info('[TemplatesPresenter] Updating template', { id: patch.id });
    this.vm = {
      ...this.vm,
      isSaving: true,
      error: null,
    };
    this.notify();

    const result = await this.updateTemplateUseCase.execute(patch);

    if (result.isFailure) {
      this.logger.error('[TemplatesPresenter] Failed to update template', {
        id: patch.id,
        error: result.error,
      });
      this.vm = {
        ...this.vm,
        isSaving: false,
        error: result.error?.message ?? 'Failed to update template',
      };
      this.notify();
      return Result.error(result.error ?? new Error('Failed to update template'));
    }

    const updated = result.value!;
    // Refresh list
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
      this.logger.warn('[TemplatesPresenter] deleteTemplate forbidden for non-admin', {
        id,
      });
      return Result.error(error);
    }

    this.logger.info('[TemplatesPresenter] Deleting template', { id });
    this.vm = {
      ...this.vm,
      isSaving: true,
      error: null,
    };
    this.notify();

    const result = await this.deleteTemplateUseCase.execute({ id });

    if (result.isFailure) {
      this.logger.error('[TemplatesPresenter] Failed to delete template', {
        id,
        error: result.error,
      });
      this.vm = {
        ...this.vm,
        isSaving: false,
        error: result.error?.message ?? 'Failed to delete template',
      };
      this.notify();
      return Result.error(result.error ?? new Error('Failed to delete template'));
    }

    // Refresh list
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

  /**
   * Admin-only: save current app/page configuration back into the selected Template
   * without changing its published state (draft update in templates table).
   */
  public async saveSelectedTemplateFromCurrentConfig(): Promise<Result<Template, Error>> {
    const callId = Math.random().toString(36).substr(2, 9);
    this.logger.info(`[TemplatesPresenter] saveSelectedTemplateFromCurrentConfig called [${callId}]`, {
      isAdmin: this.isAdmin,
      selectedTemplateId: this.vm.selectedTemplateId,
    });

    // Protection against concurrent saves
    if ((this.vm as any).isSavingTemplate) {
      this.logger.warn(`[TemplatesPresenter] saveSelectedTemplateFromCurrentConfig skipped - already saving [${callId}]`);
      return Result.error(new Error('Already saving template'));
    }
    (this.vm as any).isSavingTemplate = true;

    if (!this.isAdmin) {
      const error = new Error('Only admin can save template drafts');
      this.logger.warn('[TemplatesPresenter] saveSelectedTemplateFromCurrentConfig forbidden for non-admin');
      (this.vm as any).isSavingTemplate = false;
      return Result.error(error);
    }

    if (!this.vm.selectedTemplateId) {
      const error = new Error('No template selected to save');
      this.logger.warn('[TemplatesPresenter] saveSelectedTemplateFromCurrentConfig: no template selected');
      (this.vm as any).isSavingTemplate = false;
      return Result.error(error);
    }

    const builderVm = this.uiBuilderPresenter.getViewModel();
    const pageVm = this.pageConstructorPresenter.getViewModel();
    const pageStyles = this.pageConstructorPresenter.getPageStyles();

    this.logger.info('[TemplatesPresenter] Retrieved current config', {
      hasAppConfig: !!builderVm.config,
      pageSlug: pageVm.pageSlug,
    });

    const appConfigSnapshot = builderVm.config;
    if (!appConfigSnapshot) {
      const error = new Error('Cannot save template: app config is not loaded');
      this.logger.error('[TemplatesPresenter] No app config in view model when saving template', {
        error,
      });
      (this.vm as any).isSavingTemplate = false;
      return Result.error(error);
    }

    // Ensure app_config and page_configs are serializable before saving
    let cleanAppConfig: unknown;
    let cleanPages: TemplatePageSnapshot[];

    try {
      cleanAppConfig = JSON.parse(JSON.stringify(appConfigSnapshot));
      this.logger.info('[TemplatesPresenter] App config serialized successfully for autosave');
    } catch (error) {
      this.logger.error('[TemplatesPresenter] Failed to serialize app config for autosave', { error });
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
      this.logger.info('[TemplatesPresenter] Pages serialized successfully for autosave');
    } catch (error) {
      this.logger.error('[TemplatesPresenter] Failed to serialize pages for autosave', { error });
      cleanPages = [{ pageSlug: pageVm.pageSlug || 'home', pageConfig: { sections: [], pageStyles: {} }, error: 'Page data contains non-serializable data' }];
    }

    // For autosave, use HTTP API instead of direct repository access
    // to ensure proper server-side authentication and RLS policies
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

      this.logger.info('[TemplatesPresenter] Template autosaved via API', {
        id: this.vm.selectedTemplateId,
      });

      // Update local template data
      if (this.vm.selectedTemplateId === data.id) {
        this.vm = {
          ...this.vm,
          selectedTemplate: data,
        };
        this.notify();
      }

      return Result.ok(data);
    } catch (error) {
      this.logger.error('[TemplatesPresenter] Failed to autosave template via API', {
        id: this.vm.selectedTemplateId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      (this.vm as any).isSavingTemplate = false;
      return Result.error(error instanceof Error ? error : new Error('Failed to autosave template'));
    }

    if (result.isFailure) {
      this.logger.error('[TemplatesPresenter] Failed to autosave template config', {
        id: patch.id,
        error: result.error,
      });
      (this.vm as any).isSavingTemplate = false;
      return Result.error(result.error ?? new Error('Failed to autosave template'));
    }

    const updated = result.value!;

    // Keep selectedTemplate in sync without touching list/selection.
    if (this.vm.selectedTemplateId === updated.id) {
      this.vm = {
        ...this.vm,
        selectedTemplate: updated,
      };
      this.notify();
    }

    (this.vm as any).isSavingTemplate = false;
    return Result.ok(updated);
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

    this.logger.info('[TemplatesPresenter] Applying template to builder', {
      templateId: template.id,
      appId,
      currentPageSlug: pageVm.pageSlug,
    });

    // Apply app-level config
    this.uiBuilderPresenter.applyTemplateConfig(template.appConfig);

    // Choose page snapshot matching current pageSlug or fallback to first
    const currentSlug = pageVm.pageSlug || 'home';
    const matchingPage =
      template.pages.find((p) => p.pageSlug === currentSlug) ?? template.pages[0] ?? null;

    if (matchingPage) {
      this.pageConstructorPresenter.applyTemplatePageConfig({
        appId,
        pageSlug: matchingPage.pageSlug,
        pageConfig: matchingPage.pageConfig,
      });
    }

    return Result.ok<void, Error>(undefined as void);
  }

  /**
   * Helper method to merge default config with current config to ensure completeness.
   */
  private mergeConfigs(defaultConfig: Record<string, unknown>, currentConfig: Record<string, unknown>): Record<string, unknown> {
    const result = { ...defaultConfig };

    // Deep merge current config over default config
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

  /**
   * Called by UIBuilderPresenter after successful app-config publish when admin role is active.
   * Marks currently selected template as published at template level.
   */
  public async markSelectedTemplatePublished(): Promise<Result<Template, Error>> {
    if (!this.isAdmin) {
      return Result.error(new Error('Only admin can publish templates'));
    }
    if (!this.vm.selectedTemplateId) {
      return Result.error(new Error('No template selected to publish'));
    }

    this.logger.info('[TemplatesPresenter] Marking selected template as published', {
      templateId: this.vm.selectedTemplateId,
    });

    const result = await this.publishTemplateUseCase.execute({
      templateId: this.vm.selectedTemplateId,
    });

    if (result.isFailure) {
      this.logger.error('[TemplatesPresenter] Failed to publish template', {
        templateId: this.vm.selectedTemplateId,
        error: result.error,
      });
      return result;
    }

    // Refresh details and list to reflect new published state
    await this.loadTemplates(this.vm.query);
    await this.selectTemplate(this.vm.selectedTemplateId);

    return result;
  }
}


