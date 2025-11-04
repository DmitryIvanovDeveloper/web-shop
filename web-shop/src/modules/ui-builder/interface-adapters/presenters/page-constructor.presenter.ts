import { inject, injectable } from 'inversify';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { LoadPageDraftUseCase } from '../../application/use-cases/load-page-draft.use-case';
import type { SavePageDraftUseCase } from '../../application/use-cases/save-page-draft.use-case';
import type { PublishPageUseCase } from '../../application/use-cases/publish-page.use-case';
import type { Logger } from '@/application/ports/logger.port';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';
import type { PageConfig } from '../../domain/entities/page-config.entity';
import type { PageSection, SectionLayout, ComponentNode } from '../../domain/entities/page-section.entity';

interface PageConstructorViewModel {
  appId: string;
  pageSlug: string;
  sections: PageSection[];
  selectedSection: PageSection | null;
  selectedComponent: ComponentNode | null;
  pageStyles: {
    padding?: string;
    gap?: string;
  };
  isLoading: boolean;
  isSaving: boolean;
  isDraft: boolean;
  error: string | null;
}

@injectable()
export class PageConstructorPresenter {
  private readonly subscribers: Array<(vm: PageConstructorViewModel) => void> = [];
  private saveDraftDebounceTimer: NodeJS.Timeout | null = null;
  
  private vm: PageConstructorViewModel = {
    appId: '',
    pageSlug: 'home',
    sections: [],
    selectedSection: null,
    selectedComponent: null,
    pageStyles: {},
    isLoading: false,
    isSaving: false,
    isDraft: true,
    error: null,
  };

  constructor(
    @inject(UI_BUILDER_TYPES.LoadPageDraftUseCase)
    private readonly _loadDraftUseCase: LoadPageDraftUseCase,
    @inject(UI_BUILDER_TYPES.SavePageDraftUseCase)
    private readonly _saveDraftUseCase: SavePageDraftUseCase,
    @inject(UI_BUILDER_TYPES.PublishPageUseCase)
    private readonly _publishUseCase: PublishPageUseCase,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public subscribe(cb: (vm: PageConstructorViewModel) => void): () => void {
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

  public getViewModel(): PageConstructorViewModel {
    return this.vm;
  }

  public async initialize(appId: string, pageSlug: string = 'home'): Promise<void> {
    this._logger.info('[PageConstructorPresenter] Initializing', { appId, pageSlug });
    
    this.vm = { ...this.vm, appId, pageSlug, isLoading: true, error: null };
    this.notify();

    try {
      const result = await this._loadDraftUseCase.execute(appId, pageSlug);
      
      if (!result.isSuccess) {
        this.vm = { ...this.vm, isLoading: false, error: result.error?.message || 'Failed to load page config' };
        this.notify();
        return;
      }

      if (result.value) {
        this.vm = { 
          ...this.vm, 
          sections: result.value.sections,
          pageStyles: result.value.pageStyles || {},
          isLoading: false,
          isDraft: result.value.isDraft
        };
      } else {
        // No draft exists, start with empty page
        this.vm = { 
          ...this.vm, 
          sections: [],
          pageStyles: {},
          isLoading: false 
        };
      }

      this.notify();
      this._logger.info('[PageConstructorPresenter] Initialized successfully', { 
        appId, 
        pageSlug, 
        sectionsCount: this.vm.sections.length 
      });
    } catch (error) {
      this._logger.error('[PageConstructorPresenter] Error initializing', error);
      this.vm = { 
        ...this.vm, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
      this.notify();
    }
  }

  // ============ Section Operations ============

  public addSection(type: 'header' | 'content' | 'footer'): void {
    this._logger.info('[PageConstructorPresenter] Adding section', { type });

    const newSection: PageSection = {
      id: `${type}-${Date.now()}`,
      type,
      layout: {
        grid: '1-column',
        gap: '1rem',
        align: 'start',
      },
      styles: {},
      components: [],
    };

    this.vm = {
      ...this.vm,
      sections: [...this.vm.sections, newSection],
      selectedSection: newSection,
      selectedComponent: null,
    };

    this.notify();
    this.saveConfigDebounced();
    this.sendConfigToIframe();
  }

  public removeSection(sectionId: string): void {
    this._logger.info('[PageConstructorPresenter] Removing section', { sectionId });

    this.vm = {
      ...this.vm,
      sections: this.vm.sections.filter(s => s.id !== sectionId),
      selectedSection: this.vm.selectedSection?.id === sectionId ? null : this.vm.selectedSection,
      selectedComponent: null,
    };

    this.notify();
    this.saveConfigDebounced();
    this.sendConfigToIframe();
  }

  public selectSection(sectionId: string): void {
    const section = this.vm.sections.find(s => s.id === sectionId);
    if (!section) return;

    this.vm = {
      ...this.vm,
      selectedSection: section,
      selectedComponent: null,
    };

    this.notify();
  }

  public updateSectionLayout(sectionId: string, layout: SectionLayout): void {
    this._logger.info('[PageConstructorPresenter] Updating section layout', { sectionId, layout });

    this.vm = {
      ...this.vm,
      sections: this.vm.sections.map(section =>
        section.id === sectionId
          ? { ...section, layout }
          : section
      ),
    };

    // Update selectedSection if it's the one being edited
    if (this.vm.selectedSection?.id === sectionId) {
      this.vm.selectedSection = this.vm.sections.find(s => s.id === sectionId) || null;
    }

    this.notify();
    this.saveConfigDebounced();
    this.sendConfigToIframe();
  }

  public updateSectionStyles(sectionId: string, styles: Record<string, unknown>): void {
    this._logger.info('[PageConstructorPresenter] Updating section styles', { sectionId });

    this.vm = {
      ...this.vm,
      sections: this.vm.sections.map(section =>
        section.id === sectionId
          ? { ...section, styles }
          : section
      ),
    };

    if (this.vm.selectedSection?.id === sectionId) {
      this.vm.selectedSection = this.vm.sections.find(s => s.id === sectionId) || null;
    }

    this.notify();
    this.saveConfigDebounced();
    this.sendConfigToIframe();
  }

  // ============ Component Operations ============

  public addComponent(sectionId: string, componentType: string): void {
    this._logger.info('[PageConstructorPresenter] Adding component', { sectionId, componentType });

    const newComponent: ComponentNode = {
      id: `${componentType.toLowerCase()}-${Date.now()}`,
      type: componentType,
      props: this.getDefaultProps(componentType),
      styles: this.getDefaultStyles(componentType),
    };

    this.vm = {
      ...this.vm,
      sections: this.vm.sections.map(section =>
        section.id === sectionId
          ? { ...section, components: [...section.components, newComponent] }
          : section
      ),
      selectedComponent: newComponent,
    };

    this.notify();
    this.saveConfigDebounced();
    this.sendConfigToIframe();
  }

  public removeComponent(sectionId: string, componentId: string): void {
    this._logger.info('[PageConstructorPresenter] Removing component', { sectionId, componentId });

    this.vm = {
      ...this.vm,
      sections: this.vm.sections.map(section =>
        section.id === sectionId
          ? { ...section, components: section.components.filter(c => c.id !== componentId) }
          : section
      ),
      selectedComponent: this.vm.selectedComponent?.id === componentId ? null : this.vm.selectedComponent,
    };

    this.notify();
    this.saveConfigDebounced();
    this.sendConfigToIframe();
  }

  public selectComponent(sectionId: string, componentId: string): void {
    const section = this.vm.sections.find(s => s.id === sectionId);
    if (!section) return;

    const component = section.components.find(c => c.id === componentId);
    if (!component) return;

    this.vm = {
      ...this.vm,
      selectedSection: section,
      selectedComponent: component,
    };

    this.notify();
  }

  public updateComponent(sectionId: string, componentId: string, props: Record<string, unknown>): void {
    this._logger.info('[PageConstructorPresenter] Updating component', { 
      sectionId, 
      componentId,
      propsKeys: Object.keys(props),
      hasStylesInProps: 'styles' in props,
      stylesValue: props.styles
    });

    // Extract styles from props if present
    const { styles, ...componentProps } = props;
    const hasStyles = styles !== undefined;

    this.vm = {
      ...this.vm,
      sections: this.vm.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              components: section.components.map(comp => {
                if (comp.id === componentId) {
                  const currentStyles = comp.styles || {};
                  const mergedStyles = hasStyles ? { ...currentStyles, ...(styles as Record<string, unknown>) } : currentStyles;
                  
                  this._logger.info('[PageConstructorPresenter] Merging styles', {
                    componentId,
                    currentStylesKeys: Object.keys(currentStyles),
                    newStylesKeys: hasStyles ? Object.keys(styles as Record<string, unknown>) : [],
                    mergedStylesKeys: Object.keys(mergedStyles)
                  });
                  
                  return {
                    ...comp,
                    props: { ...comp.props, ...componentProps },
                    styles: mergedStyles,
                  };
                }
                return comp;
              }),
            }
          : section
      ),
    };

    // Update selectedComponent if it's the one being edited
    if (this.vm.selectedComponent?.id === componentId) {
      const section = this.vm.sections.find(s => s.id === sectionId);
      this.vm.selectedComponent = section?.components.find(c => c.id === componentId) || null;
    }

    this.notify();
    this.saveConfigDebounced();
    this.sendConfigToIframe();
  }

  // ============ Persistence ============

  private saveConfigDebounced(): void {
    if (this.saveDraftDebounceTimer) {
      clearTimeout(this.saveDraftDebounceTimer);
    }

    this.saveDraftDebounceTimer = setTimeout(() => {
      this.saveDraft();
    }, 500);
  }

  public async saveDraft(): Promise<boolean> {
    this._logger.info('[PageConstructorPresenter] Saving draft');

    this.vm = { ...this.vm, isSaving: true, error: null };
    this.notify();

    try {
      const config: PageConfig = {
        id: '', // Will be set by database
        appId: this.vm.appId,
        pageSlug: this.vm.pageSlug,
        version: 1, // Will be incremented by storage layer
        isDraft: true,
        isActive: false,
        sections: this.vm.sections,
        pageStyles: this.vm.pageStyles,
      };

      const result = await this._saveDraftUseCase.execute(config);

      if (!result.isSuccess) {
        this.vm = { ...this.vm, isSaving: false, error: result.error?.message || 'Failed to save draft' };
        this.notify();
        return false;
      }

      this.vm = { ...this.vm, isSaving: false };
      this.notify();
      this._logger.info('[PageConstructorPresenter] Draft saved successfully');
      return true;
    } catch (error) {
      this._logger.error('[PageConstructorPresenter] Error saving draft', error);
      this.vm = {
        ...this.vm,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      this.notify();
      return false;
    }
  }

  public async publish(): Promise<boolean> {
    this._logger.info('[PageConstructorPresenter] Publishing page');

    this.vm = { ...this.vm, isSaving: true, error: null };
    this.notify();

    try {
      const result = await this._publishUseCase.execute(this.vm.appId, this.vm.pageSlug);

      if (!result.isSuccess) {
        this.vm = { ...this.vm, isSaving: false, error: result.error?.message || 'Failed to publish' };
        this.notify();
        return false;
      }

      this.vm = { ...this.vm, isSaving: false, isDraft: false };
      this.notify();
      this._logger.info('[PageConstructorPresenter] Page published successfully');
      return true;
    } catch (error) {
      this._logger.error('[PageConstructorPresenter] Error publishing', error);
      this.vm = {
        ...this.vm,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      this.notify();
      return false;
    }
  }

  // ============ Helper Methods ============

  public getPageSlug(): string {
    return this.vm.pageSlug;
  }

  public updatePagePadding(padding: string): void {
    this._logger.info('[PageConstructorPresenter] Updating page padding', { padding });

    this.vm = {
      ...this.vm,
      pageStyles: {
        ...this.vm.pageStyles,
        padding: padding || undefined,
      },
    };

    this.notify();
    this.saveConfigDebounced();
    this.sendConfigToIframe();
  }

  public updatePageGap(gap: string): void {
    this._logger.info('[PageConstructorPresenter] Updating page gap', { gap });

    this.vm = {
      ...this.vm,
      pageStyles: {
        ...this.vm.pageStyles,
        gap: gap || undefined,
      },
    };

    this.notify();
    this.saveConfigDebounced();
    this.sendConfigToIframe();
  }

  private sendConfigToIframe(): void {
    if (typeof window === 'undefined') return;

    const iframe = document.querySelector('iframe');
    if (!iframe?.contentWindow) {
      this._logger.warn('[PageConstructorPresenter] Iframe not found for sending config');
      return;
    }

    const pageConfig: PageConfig = {
      id: 'draft',
      appId: this.vm.appId,
      pageSlug: this.vm.pageSlug,
      version: 1,
      isDraft: true,
      isActive: false,
      sections: this.vm.sections,
      pageStyles: this.vm.pageStyles,
    };

    // Log detailed info about sections and components
    pageConfig.sections.forEach(section => {
      this._logger.info(`[PageConstructorPresenter] Section ${section.type} (${section.id})`, {
        componentsCount: section.components.length,
        components: section.components.map(c => ({
          id: c.id,
          type: c.type,
          props: c.props,
          hasStyles: !!c.styles && Object.keys(c.styles).length > 0
        }))
      });
    });

    iframe.contentWindow.postMessage(
      { type: 'PAGE_CONFIG_UPDATE', config: pageConfig },
      '*'
    );

    this._logger.info('[PageConstructorPresenter] Sent config to iframe', {
      sectionsCount: pageConfig.sections.length,
      pagePadding: pageConfig.pageStyles?.padding || 'not set',
    });
  }

  private getDefaultProps(componentType: string): Record<string, unknown> {
    const defaults: Record<string, Record<string, unknown>> = {
      Text: { text: 'Enter text here...' },
      Button: { text: 'Click me' },
      Image: { src: '', alt: 'Image' },
      Video: { src: '' },
      ProductsList: {},
      OffersList: {},
      Container: {},
    };

    return defaults[componentType] || {};
  }

  private getDefaultStyles(componentType: string): Record<string, unknown> {
    const defaults: Record<string, Record<string, unknown>> = {
      Button: {
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        padding: '8px 16px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
      },
      Text: {
        color: '#000000',
        fontSize: '1rem',
      },
    };

    return defaults[componentType] || {};
  }
}

