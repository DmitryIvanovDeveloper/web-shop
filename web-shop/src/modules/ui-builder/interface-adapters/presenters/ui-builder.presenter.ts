import { inject, injectable } from 'inversify';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { PreviewCommunicationPort } from '../../application/ports/preview-communication.port';
import type { LoadDraftConfigUseCase } from '../../application/use-cases/load-draft-config.use-case';
import type { LoadActiveConfigUseCase } from '../../application/use-cases/load-active-config.use-case';
import type { SaveDraftUseCase } from '../../application/use-cases/save-draft.use-case';
import type { PublishDraftUseCase } from '../../application/use-cases/publish-draft.use-case';
import type { CreatePageUseCase } from '../../application/use-cases/create-page.use-case';
import type { ListPagesUseCase } from '../../application/use-cases/list-pages.use-case';
import type { Logger } from '@/application/ports/logger.port';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';
import type { SelectedElement } from '../../domain/types/sidebar-element.types';

interface ViewModel {
  appId: string;
  version: number | null;
  isDraft: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  validationErrors: any[];
  config: Record<string, unknown> | null;
  selectedElement: SelectedElement | null;
  pages: string[];
  isLoadingPages: boolean;
}

@injectable()
export class UIBuilderPresenter {
  private readonly subscribers: Array<(vm: ViewModel) => void> = [];
  private saveDraftDebounceTimer: NodeJS.Timeout | null = null;
  private selectedElementArea: 'sidebar' | 'rightSidebar' | null = null;
  private vm: ViewModel = {
    appId: '',
    version: 1,
    isDraft: true,
    isLoading: false,
    isSaving: false,
    error: null,
    validationErrors: [],
    config: {
      theme: {
        colors: { primary: '#1d4ed8', background: '#ffffff', text: '#111827' },
        background: { backgroundColor: '#12141A' },
      },
      modules: {
        uiRenderer: {
          sidebar: {
            version: '1.0',
            theme: {
              colors: { primary: '#1d4ed8', background: '#ffffff', surface: '#ffffff', text: '#111827' },
              spacing: [4, 8, 12, 16, 24, 32, 48, 64]
            },
            layout: {
              id: 'left-sidebar',
              type: 'Container',
              props: { text: 'Left Sidebar' },
              styles: { backgroundColor: '#f3f4f6', textColor: '#111827', borderColor: '#e5e7eb', backgroundOpacity: '1' },
              children: [
                {
                  id: 'store-button',
                  type: 'Button',
                  props: { text: 'Store' },
                  styles: { backgroundColor: '#1d4ed8', textColor: '#ffffff', borderColor: '#1e40af' },
                },
              ],
            },
          },
          rightSidebar: {
            version: '1.0',
            theme: {
              colors: { primary: '#1d4ed8', background: '#ffffff', surface: '#ffffff', text: '#111827' },
              spacing: [4, 8, 12, 16, 24, 32, 48, 64]
            },
            layout: {
              id: 'right-sidebar',
              type: 'Container',
              props: { text: 'Right Sidebar' },
              styles: { backgroundColor: '#f9fafb', textColor: '#111827', borderColor: '#d1d5db', backgroundOpacity: '1' },
              children: [],
            },
          },
        },
      },
    },
    selectedElement: null,
    pages: [],
    isLoadingPages: false,
  };

  constructor(
    @inject(UI_BUILDER_TYPES.PreviewCommunication)
    private readonly preview: PreviewCommunicationPort,
    @inject(UI_BUILDER_TYPES.LoadDraftConfigUseCase)
    private readonly _loadDraftConfigUseCase: LoadDraftConfigUseCase,
    @inject(UI_BUILDER_TYPES.LoadActiveConfigUseCase)
    private readonly _loadActiveConfigUseCase: LoadActiveConfigUseCase,
    @inject(UI_BUILDER_TYPES.SaveDraftUseCase)
    private readonly _saveDraftUseCase: SaveDraftUseCase,
    @inject(UI_BUILDER_TYPES.PublishDraftUseCase)
    private readonly _publishDraftUseCase: PublishDraftUseCase,
    @inject(UI_BUILDER_TYPES.CreatePageUseCase)
    private readonly _createPageUseCase: CreatePageUseCase,
    @inject(UI_BUILDER_TYPES.ListPagesUseCase)
    private readonly _listPagesUseCase: ListPagesUseCase,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public subscribe(cb: (vm: ViewModel) => void): () => void {
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

  public getViewModel(): ViewModel {
    return this.vm;
  }

  public getPreviewCommunication(): PreviewCommunicationPort {
    return this.preview;
  }

  public async initialize(appId: string): Promise<void> {
    this._logger.info('[UIBuilderPresenter] Initializing with appId', { appId });
    this.vm = { ...this.vm, isLoading: true, appId };
    this.notify();

    try {
      const result = await this._loadDraftConfigUseCase.execute(appId);
      
      if (result.isSuccess && result.value) {
        this._logger.info('[UIBuilderPresenter] Config loaded successfully', { appId });
        const appConfig = result.value as any;
        const version = appConfig.version;
        const versionValue = typeof version === 'object' && version !== null && 'value' in version 
          ? (version as { value: number }).value 
          : (typeof version === 'number' ? version : null);
        this.vm = { 
          ...this.vm, 
          config: appConfig.config as unknown as Record<string, unknown>, 
          isLoading: false,
          isDraft: appConfig.isDraft ?? false, // Set isDraft from AppConfig
          version: versionValue
        };
        this.sendConfigToIframe();
      } else {
        this._logger.warn('[UIBuilderPresenter] Failed to load config, using default', { appId, error: result.error });
        this.vm = { ...this.vm, config: this.getDefaultConfig(), isLoading: false };
        this.sendConfigToIframe();
      }
      
      this.notify();
    } catch (error) {
      this._logger.error('[UIBuilderPresenter] Error initializing', { appId, error });
      this.vm = { ...this.vm, config: this.getDefaultConfig(), isLoading: false, error: 'Failed to load configuration' };
      this.notify();
    }
  }

  public async resetToActive(appId: string): Promise<void> {
    this._logger.info('[UIBuilderPresenter] Resetting to active config', { appId });
    this.vm = { ...this.vm, isLoading: true };
    this.notify();

    try {
      const result = await this._loadActiveConfigUseCase.execute(appId);
      
      if (result.isSuccess && result.value) {
        this._logger.info('[UIBuilderPresenter] Active config loaded successfully', { appId });
        this.vm = { 
          ...this.vm, 
          config: result.value as unknown as Record<string, unknown>, 
          isLoading: false,
          isDraft: false,
          selectedElement: null 
        };
        this.sendConfigToIframe();
      } else {
        this._logger.error('[UIBuilderPresenter] Failed to load active config', { appId, error: result.error });
        this.vm = { 
          ...this.vm, 
          isLoading: false, 
          error: 'Failed to load active configuration. Make sure you have published at least one version.' 
        };
      }
      
      this.notify();
    } catch (error) {
      this._logger.error('[UIBuilderPresenter] Error resetting to active', { appId, error });
      this.vm = { 
        ...this.vm, 
        isLoading: false, 
        error: 'Failed to reset to active configuration' 
      };
      this.notify();
    }
  }

  private getDefaultConfig(): Record<string, unknown> {
    return {
      theme: {
        colors: { primary: '#1d4ed8', background: '#ffffff', text: '#111827' },
        background: { backgroundColor: '#12141A' },
      },
      modules: {
        uiRenderer: {
          sidebar: {
            version: '1.0',
            theme: {
              colors: { primary: '#1d4ed8', background: '#ffffff', surface: '#ffffff', text: '#111827' },
              spacing: [4, 8, 12, 16, 24, 32, 48, 64]
            },
            layout: {
              id: 'left-sidebar',
              type: 'Container',
              props: { text: 'Left Sidebar' },
              styles: { backgroundColor: '#f3f4f6', textColor: '#111827', borderColor: '#e5e7eb', backgroundOpacity: '1' },
              children: [
                {
                  id: 'store-button',
                  type: 'Button',
                  props: { text: 'Store' },
                  styles: { backgroundColor: '#1d4ed8', textColor: '#ffffff', borderColor: '#1e40af' },
                },
              ],
            },
          },
          rightSidebar: {
            version: '1.0',
            theme: {
              colors: { primary: '#1d4ed8', background: '#ffffff', surface: '#ffffff', text: '#111827' },
              spacing: [4, 8, 12, 16, 24, 32, 48, 64]
            },
            layout: {
              id: 'right-sidebar',
              type: 'Container',
              props: { text: 'Right Sidebar' },
              styles: { backgroundColor: '#f9fafb', textColor: '#111827', borderColor: '#d1d5db', backgroundOpacity: '1' },
              children: [],
            },
          },
        },
      },
      version: '1.0',
      environment: 'production'
    };
  }

  public async loadConfig(appId: string): Promise<void> {
    this.vm.isLoading = true;
    this.vm.appId = appId;
    this.notify();
    // Placeholder for real load via use case; keep current config
    this.vm.isLoading = false;
    this.notify();
  }


  public updateTheme(colors: Record<string, string>): void {
    if (!this.vm.config) {
      return;
    }

    const newConfig = {
      ...(this.vm.config as Record<string, unknown>),
      theme: { ...(this.vm.config as any).theme, colors },
    };

    this.vm = {
      ...this.vm,
      config: newConfig,
      isDraft: true,
    };

    this.notify();
    this.sendConfigToIframe();
    this.saveConfigToSupabase();
  }

  public updateBackground(newBackground: Record<string, string | undefined>): void {
    if (!this.vm.config) {
      return;
    }

    const sanitizedBackground: Record<string, string> = {};
    for (const [key, value] of Object.entries(newBackground)) {
      if (value !== undefined && value !== null && value !== '') {
        sanitizedBackground[key] = value;
      }
    }

    const theme = (this.vm.config as any).theme ?? {};
    const nextTheme = { ...theme };

    if (Object.keys(sanitizedBackground).length > 0) {
      nextTheme.background = sanitizedBackground;
    } else if ('background' in nextTheme) {
      delete nextTheme.background;
    }

    const updatedConfig = {
      ...(this.vm.config as Record<string, unknown>),
      theme: nextTheme,
    };

    this.vm = {
      ...this.vm,
      config: updatedConfig,
      isDraft: true,
    };

    this.notify();
    this.sendConfigToIframe();
    this.saveConfigToSupabaseDebounced();
  }

  public selectElement(elementId: string): void {
    console.log('[UIBuilderPresenter] selectElement called:', elementId);
    if (!elementId) {
      this.selectedElementArea = null;
      this.vm = { ...this.vm, selectedElement: null };
      this.notify();
      return;
    }

    const located = this.locateElement(elementId);
    if (!located) {
      this._logger.warn('[UIBuilderPresenter] selectElement: element not found', { elementId });
      this.selectedElementArea = null;
      this.vm = { ...this.vm, selectedElement: null };
      this.notify();
      return;
    }

    const { node, layout } = located;
    const colors = this.readColorsFromNode(node);
    console.log('[UIBuilderPresenter] Found colors:', colors);
    this.selectedElementArea = layout;

    this.vm = {
      ...this.vm,
      selectedElement: {
        id: elementId,
        colors: colors || undefined,
        gap: node?.styles?.gap,
        padding: node?.styles?.padding,
        flexDirection: node?.styles?.flexDirection,
        type: node?.type,
        borderRadius: node?.styles?.borderRadius,
        label: node?.props?.text || node?.props?.children,
        textAlign: node?.styles?.textAlign,
        icon: node?.props?.icon,
        area: layout,
        backgroundOpacity: node?.styles?.backgroundOpacity,
        pageSlug: node?.props?.pageSlug,
      },
    };
    console.log('[UIBuilderPresenter] Updated viewModel.selectedElement:', this.vm.selectedElement);
    this.notify();
  }

  public updateElementColors(elementId: string, colors: Record<string, string>): void {
    this.applyColorsToConfig(elementId, colors);
    this.selectElement(elementId);
    this.sendConfigToIframe();
    this.saveConfigToSupabaseDebounced();
  }

  public updateContainerBackgroundOpacity(elementId: string, opacity: string): void {
    const node = this.findNode(elementId);
    if (!node) {
      return;
    }

    if (!node.styles) {
      node.styles = {};
    }

    node.styles.backgroundOpacity = opacity;

    this.selectElement(elementId);
    this.sendConfigToIframe();
    this.saveConfigToSupabaseDebounced();
  }
 
  public updateContainerGap(elementId: string, gap: string): void {
    const node = this.findNode(elementId);
    if (!node) return;
    
    if (!node.styles) {
      node.styles = {};
    }
    node.styles.gap = gap;
    
    this.selectElement(elementId);
    this.sendConfigToIframe();
    this.saveConfigToSupabaseDebounced();
  }

  public updateContainerPadding(elementId: string, padding: string): void {
    const node = this.findNode(elementId);
    if (!node) return;
    
    if (!node.styles) {
      node.styles = {};
    }
    node.styles.padding = padding;
    
    this.selectElement(elementId);
    this.sendConfigToIframe();
    this.saveConfigToSupabaseDebounced();
  }

  public updateButtonBorderRadius(elementId: string, borderRadius: string): void {
    const node = this.findNode(elementId);
    if (!node) return;
    
    if (!node.styles) {
      node.styles = {};
    }
    node.styles.borderRadius = borderRadius;
    
    this.selectElement(elementId);
    this.sendConfigToIframe();
    this.saveConfigToSupabaseDebounced();
  }

  public updateButtonLabel(elementId: string, label: string): void {
    const node = this.findNode(elementId);
    if (!node) return;
    
    if (!node.props) {
      node.props = {};
    }
    node.props.text = label;
    
    this.selectElement(elementId);
    this.sendConfigToIframe();
    this.saveConfigToSupabaseDebounced();
  }

  public updateButtonTextAlign(elementId: string, textAlign: string): void {
    const node = this.findNode(elementId);
    if (!node) return;
    
    if (!node.styles) {
      node.styles = {};
    }
    node.styles.textAlign = textAlign;
    
    this.selectElement(elementId);
    this.sendConfigToIframe();
    this.saveConfigToSupabaseDebounced();
  }

  public updateButtonIcon(elementId: string, icon: string | null): void {
    const node = this.findNode(elementId);
    if (!node) {
      return;
    }

    if (!node.props) {
      node.props = {};
    }

    if (icon && icon.trim() !== '') {
      node.props.icon = icon;
    } else {
      delete node.props.icon;
    }

    this.selectElement(elementId);
    this.sendConfigToIframe();
    this.saveConfigToSupabaseDebounced();
  }

  public updateButtonPageSlug(elementId: string, pageSlug: string | null): void {
    const node = this.findNode(elementId);
    if (!node) {
      this._logger.warn('[UIBuilderPresenter] updateButtonPageSlug: node not found', { elementId });
      return;
    }

    if (!node.props) {
      node.props = {};
    }

    if (pageSlug && pageSlug.trim() !== '') {
      node.props.pageSlug = pageSlug;
      this._logger.info('[UIBuilderPresenter] updateButtonPageSlug: set pageSlug', { elementId, pageSlug });
    } else {
      delete node.props.pageSlug;
      this._logger.info('[UIBuilderPresenter] updateButtonPageSlug: removed pageSlug', { elementId });
    }

    this.selectElement(elementId);
    this.sendConfigToIframe();
    this.saveConfigToSupabaseDebounced();
  }

  public addSidebarButton(label?: string): void {
    const layout = (this.vm.config as any)?.modules?.uiRenderer?.sidebar?.layout;
    if (!layout) return;
    if (!Array.isArray(layout.children)) {
      layout.children = [];
    }

    const existingIds = new Set<string>();
    let lastButton: any = null;
    
    const collect = (n: any) => {
      if (n?.id) existingIds.add(n.id);
      if (n?.type === 'Button') {
        lastButton = n;
      }
      if (Array.isArray(n?.children)) n.children.forEach(collect);
    };
    collect(layout);

    let index = 1;
    let newId = `button-${index}`;
    while (existingIds.has(newId)) {
      index += 1;
      newId = `button-${index}`;
    }

    // Copy styles from the last button or use defaults
    const defaultStyles = {
      backgroundColor: '#1d4ed8',
      textColor: '#ffffff',
      borderColor: '#1e40af',
    };
    
    const copiedStyles = lastButton?.styles 
      ? { ...lastButton.styles } 
      : defaultStyles;

    const node = {
      id: newId,
      type: 'Button',
      props: { text: label || 'New Button' },
      styles: copiedStyles,
    };

    layout.children.push(node);
    // Иммутабельное обновление, чтобы React отследил изменения
    const clonedConfig = JSON.parse(JSON.stringify(this.vm.config || {}));
    this.vm = {
      ...this.vm,
      config: clonedConfig,
      isDraft: true,
    };

    this.selectedElementArea = 'sidebar';
    this.selectElement(newId);
    this.sendConfigToIframe();
    
    // Save to Supabase
    this.saveConfigToSupabase();
  }

  public removeSidebarButton(buttonId: string): void {
    const layout = (this.vm.config as any)?.modules?.uiRenderer?.sidebar?.layout;
    if (!layout || !Array.isArray(layout.children)) return;

    // Filter out the button with the matching ID
    layout.children = layout.children.filter((child: any) => child.id !== buttonId);

    // Clear selection if the deleted button was selected
    if (this.vm.selectedElement?.id === buttonId) {
      this.selectedElementArea = null;
      this.vm = { ...this.vm, selectedElement: null };
    }

    this.notify();
    this.sendConfigToIframe();
    this.saveConfigToSupabaseDebounced();
  }

  public async saveDraft(): Promise<boolean> {
    // stub success
    this.vm.isDraft = true;
    this.notify();
    return true;
  }

  public async publishDraft(): Promise<boolean> {
    this._logger.info('[UIBuilderPresenter] Publishing draft', { appId: this.vm.appId });
    this.vm = { ...this.vm, isLoading: true };
    this.notify();

    try {
      // Always use version 0 to publish the latest draft
      // Using a specific version can fail if that draft was already published
      const result = await this._publishDraftUseCase.execute({
        appId: this.vm.appId,
        merchantId: this.vm.appId, // Use appId as merchantId for now
        draftVersion: 0, // Always use 0 to get the latest draft
      });

      if (result.isSuccess && result.value) {
        const version = result.value.version;
        const versionValue = typeof version === 'object' && version !== null && 'value' in version 
          ? (version as { value: number }).value 
          : (typeof version === 'number' ? version : null);
        this._logger.info('[UIBuilderPresenter] Draft published successfully', { 
          appId: this.vm.appId, 
          version: versionValue
        });

        // After publishing, create a new draft from the published config for further editing
        // This ensures we can continue editing after publish
        if (this.vm.config) {
          const newDraftResult = await this._saveDraftUseCase.execute({
            appId: this.vm.appId,
            config: this.vm.config as any,
          });

          if (newDraftResult.isSuccess) {
            // Reload the new draft to get the updated version
            const draftLoadResult = await this._loadDraftConfigUseCase.execute(this.vm.appId);
            if (draftLoadResult.isSuccess && draftLoadResult.value) {
              const appConfig = draftLoadResult.value as any;
              const draftVersion = appConfig.version;
              const draftVersionValue = typeof draftVersion === 'object' && draftVersion !== null && 'value' in draftVersion 
                ? (draftVersion as { value: number }).value 
                : (typeof draftVersion === 'number' ? draftVersion : null);
              
              this.vm = { 
                ...this.vm, 
                config: appConfig.config as unknown as Record<string, unknown>,
                isDraft: true, // New draft created
                isLoading: false,
                version: draftVersionValue,
              };
              this.sendConfigToIframe();
              this._logger.info('[UIBuilderPresenter] New draft created after publish', { 
                appId: this.vm.appId, 
                version: draftVersionValue
              });
            } else {
              // Fallback: keep current config, mark as draft
              this.vm = { 
                ...this.vm, 
                isDraft: true, 
                isLoading: false,
                version: versionValue,
              };
            }
          } else {
            // Failed to create new draft, but publish was successful
            this._logger.warn('[UIBuilderPresenter] Failed to create new draft after publish', { 
              appId: this.vm.appId, 
              error: newDraftResult.error 
            });
            this.vm = { 
              ...this.vm, 
              isDraft: false, 
              isLoading: false,
              version: versionValue,
            };
          }
        } else {
          // No config to create draft from
          this.vm = { 
            ...this.vm, 
            isDraft: false, 
            isLoading: false,
            version: versionValue,
          };
        }
        
    this.notify();
    return true;
      } else {
        this._logger.error('[UIBuilderPresenter] Failed to publish draft', { 
          appId: this.vm.appId, 
          error: result.error 
        });
        this.vm = { 
          ...this.vm, 
          isLoading: false, 
          error: result.error?.message || 'Failed to publish draft' 
        };
        this.notify();
        return false;
      }
    } catch (error) {
      this._logger.error('[UIBuilderPresenter] Error publishing draft', { 
        appId: this.vm.appId, 
        error 
      });
      this.vm = { 
        ...this.vm, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to publish draft' 
      };
      this.notify();
      return false;
    }
  }

  public previewAuthPopup(visible: boolean): void {
    this.preview.showAuthPopup(visible);
  }

  public updateLoginButton(input: { text?: string; icon?: string; styles?: Record<string, string> }): void {
    if (!this.vm.config) return;
    
    const config = this.vm.config as Record<string, any>;
    if (!config.modules) config.modules = {};
    if (!config.modules.authentication) config.modules.authentication = {};
    if (!config.modules.authentication.loginButtonUI) {
      config.modules.authentication.loginButtonUI = {
        type: 'Button',
        id: 'login-button',
        props: {},
        styles: {},
        children: []
      };
    }
    
    const loginButtonUI = config.modules.authentication.loginButtonUI;
    
    if (input.text !== undefined) {
      if (!loginButtonUI.props) loginButtonUI.props = {};
      loginButtonUI.props.text = input.text;
    }
    
    if (input.icon !== undefined) {
      if (!loginButtonUI.props) loginButtonUI.props = {};
      loginButtonUI.props.icon = input.icon;
    }
    
    if (input.styles) {
      loginButtonUI.styles = { ...(loginButtonUI.styles || {}), ...input.styles };
    }
    
    this.notify();
    this.sendConfigToIframe();
  }

  public updateAuthPopup(input: Record<string, unknown>): void {
    if (!this.vm.config) return;
    
    const config = this.vm.config as Record<string, any>;
    if (!config.modules) config.modules = {};
    if (!config.modules.authentication) config.modules.authentication = {};
    if (!config.modules.authentication.labels) config.modules.authentication.labels = {};
    
    const labels = config.modules.authentication.labels;
    
    if (input.userIdPlaceholder !== undefined) {
      labels.userIdPlaceholder = input.userIdPlaceholder;
    }
    
    if (input.enterUserId !== undefined) {
      labels.enterUserId = input.enterUserId;
    }
    
    this.notify();
    this.sendConfigToIframe();
  }

  private getElementColorsFromConfig(elementId: string): Record<string, string> | null {
    const located = this.locateElement(elementId);
    if (!located) {
      return null;
    }

    return this.readColorsFromNode(located.node);
  }

  private applyColorsToConfig(elementId: string, colors: Record<string, string>): void {
    const node = this.findNode(elementId);
    if (!node) return;
    node.styles = { ...(node.styles || {}), ...colors };
  }



  private findNodeInLayout(layoutKey: 'sidebar' | 'rightSidebar', elementId: string): any | null {
    const layout = (this.vm.config as any)?.modules?.uiRenderer?.[layoutKey]?.layout;
    if (!layout) {
      return null;
    }

    const dfs = (n: any): any | null => {
      if (n.id === elementId) return n;
      if (Array.isArray(n.children)) {
        for (const child of n.children) {
          const found = dfs(child);
          if (found) return found;
        }
      }
      return null;
    };

    return dfs(layout);
  }

  private locateElement(elementId: string): { node: any; layout: 'sidebar' | 'rightSidebar' } | null {
    const layouts: Array<'sidebar' | 'rightSidebar'> = ['sidebar', 'rightSidebar'];
    const preferred = this.selectedElementArea ? [this.selectedElementArea] : layouts;
    const searchOrder = Array.from(new Set([...preferred, ...layouts]));

    for (const layoutKey of searchOrder) {
      const node = this.findNodeInLayout(layoutKey, elementId);
      if (node) {
        return { node, layout: layoutKey };
      }
    }

    return null;
  }

  private readColorsFromNode(node: any): Record<string, string> | null {
    if (!node || !node.styles) {
      return null;
    }

    const colors: Record<string, string> = {};
    const styles = node.styles || {};
    if (styles.backgroundColor) colors.backgroundColor = styles.backgroundColor;
    if (styles.textColor) colors.textColor = styles.textColor;
    if (styles.borderColor) colors.borderColor = styles.borderColor;
    return Object.keys(colors).length > 0 ? colors : null;
  }
 
  private findNode(elementId: string): any | null {
    if (this.selectedElementArea) {
      const preferred = this.findNodeInLayout(this.selectedElementArea, elementId);
      if (preferred) {
        return preferred;
      }
    }

    const located = this.locateElement(elementId);
    return located?.node ?? null;
  }

  private createDefaultSidebarLayout(section: 'sidebar' | 'rightSidebar'): any {
    if (section === 'sidebar') {
      return {
        id: 'left-sidebar',
        type: 'Container',
        props: { text: 'Left Sidebar' },
        styles: { backgroundColor: '#f3f4f6', textColor: '#111827', borderColor: '#e5e7eb', backgroundOpacity: '1' },
        children: [
          {
            id: 'store-button',
            type: 'Button',
            props: { text: 'Store' },
            styles: { backgroundColor: '#1d4ed8', textColor: '#ffffff', borderColor: '#1e40af' },
          },
        ],
      };
    }

    return {
      id: 'right-sidebar',
      type: 'Container',
      props: { text: 'Right Sidebar' },
      styles: { backgroundColor: '#f9fafb', textColor: '#111827', borderColor: '#d1d5db', backgroundOpacity: '1' },
      children: [],
    };
  }

  public ensureSidebarLayout(section: 'sidebar' | 'rightSidebar'): string | null {
    if (!this.vm.config) {
      return null;
    }
 
    const currentConfig = this.vm.config as Record<string, any>;
    const modules = currentConfig.modules ? { ...currentConfig.modules } : {};
    const uiRenderer = modules.uiRenderer ? { ...modules.uiRenderer } : {};
    let sectionConfig = uiRenderer[section] ? { ...uiRenderer[section] } : undefined;
    let updated = false;
 
    if (!sectionConfig) {
      sectionConfig = {
        version: '1.0',
        theme: {
          colors: { primary: '#1d4ed8', background: '#ffffff', surface: '#ffffff', text: '#111827' },
          spacing: [4, 8, 12, 16, 24, 32, 48, 64],
        },
        layout: this.createDefaultSidebarLayout(section),
      };
      updated = true;
    } else if (!sectionConfig.layout) {
      sectionConfig.layout = this.createDefaultSidebarLayout(section);
      updated = true;
    } else if (typeof sectionConfig.layout?.styles?.backgroundOpacity === 'undefined') {
      sectionConfig = {
        ...sectionConfig,
        layout: {
          ...sectionConfig.layout,
          styles: {
            ...(sectionConfig.layout.styles || {}),
            backgroundOpacity: '1',
          },
        },
      };
      updated = true;
    }
 
    if (updated) {
      uiRenderer[section] = sectionConfig;
      const nextConfig = {
        ...currentConfig,
        modules: {
          ...modules,
          uiRenderer: {
            ...uiRenderer,
          },
        },
      };
 
      this.vm = {
        ...this.vm,
        config: nextConfig,
        isDraft: true,
      };
 
      this.notify();
      this.sendConfigToIframe();
      this.saveConfigToSupabaseDebounced();
    }
 
    return (sectionConfig?.layout?.id as string | undefined) ?? null;
  }

  private sendConfigToIframe(): void {
    if (!this.vm.config) {
      this._logger.warn('[UIBuilderPresenter] Cannot send config to iframe: config is null');
      return;
    }
    this.preview.sendConfig(this.vm.config);
  }

  private async saveConfigToSupabase(): Promise<void> {
    if (!this.vm.appId || !this.vm.config) {
      this._logger.warn('[UIBuilderPresenter] Cannot save: missing appId or config');
      return;
    }

    try {
      const result = await this._saveDraftUseCase.execute({
        appId: this.vm.appId,
        config: this.vm.config,
      });

      if (result.isSuccess) {
        this._logger.info('[UIBuilderPresenter] Config saved to Supabase successfully');
      } else {
        this._logger.error('[UIBuilderPresenter] Failed to save config', result.error);
      }
    } catch (error) {
      this._logger.error('[UIBuilderPresenter] Error saving config', error);
    }
  }

  private saveConfigToSupabaseDebounced(): void {
    if (this.saveDraftDebounceTimer) {
      clearTimeout(this.saveDraftDebounceTimer);
    }

    this.saveDraftDebounceTimer = setTimeout(() => {
      this.saveConfigToSupabase();
    }, 500); // 500ms debounce
  }

  public async loadPages(): Promise<void> {
    if (!this.vm.appId) {
      this._logger.warn('[UIBuilderPresenter] Cannot load pages: appId is empty');
      return;
    }

    this.vm = { ...this.vm, isLoadingPages: true };
    this.notify();

    try {
      const result = await this._listPagesUseCase.execute(this.vm.appId);

      if (!result.isSuccess) {
        this._logger.error('[UIBuilderPresenter] Failed to load pages', result.error);
        this.vm = { ...this.vm, isLoadingPages: false, error: result.error?.message || 'Failed to load pages' };
        this.notify();
        return;
      }

      this.vm = { ...this.vm, pages: result.value || [], isLoadingPages: false };
      this.notify();
    } catch (error) {
      this._logger.error('[UIBuilderPresenter] Error loading pages', error);
      this.vm = { ...this.vm, isLoadingPages: false, error: error instanceof Error ? error.message : 'Unknown error' };
      this.notify();
    }
  }

  public async createPage(pageSlug: string): Promise<boolean> {
    if (!this.vm.appId) {
      this._logger.warn('[UIBuilderPresenter] Cannot create page: appId is empty');
      return false;
    }

    if (!pageSlug || pageSlug.trim() === '') {
      this._logger.warn('[UIBuilderPresenter] Cannot create page: pageSlug is empty');
      return false;
    }

    // Normalize pageSlug (lowercase, replace spaces with hyphens)
    const normalizedSlug = pageSlug.trim().toLowerCase().replace(/\s+/g, '-');

    try {
      const result = await this._createPageUseCase.execute(this.vm.appId, normalizedSlug);

      if (!result.isSuccess) {
        this._logger.error('[UIBuilderPresenter] Failed to create page', result.error);
        this.vm = { ...this.vm, error: result.error?.message || 'Failed to create page' };
        this.notify();
        return false;
      }

      // Reload pages list after creating a new page
      await this.loadPages();

      this._logger.info('[UIBuilderPresenter] Page created successfully', { pageSlug: normalizedSlug });
      return true;
    } catch (error) {
      this._logger.error('[UIBuilderPresenter] Error creating page', error);
      this.vm = { ...this.vm, error: error instanceof Error ? error.message : 'Unknown error' };
      this.notify();
      return false;
    }
  }
}


