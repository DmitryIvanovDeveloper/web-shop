import { inject, injectable } from 'inversify';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { LoadPageDraftUseCase } from '../../application/use-cases/load-page-draft.use-case';
import type { SavePageDraftUseCase } from '../../application/use-cases/save-page-draft.use-case';
import type { PublishPageUseCase } from '../../application/use-cases/publish-page.use-case';
import type { LoadDraftConfigUseCase } from '../../application/use-cases/load-draft-config.use-case';
import type { UpdateOfferCardsUseCase } from '../../application/use-cases/update-offer-cards.use-case';
import type { PageConfigStoragePort } from '../../application/ports/page-config-storage.port';
import type { Logger } from '@/application/ports/logger.port';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';
import type { PageConfig } from '../../domain/entities/page-config.entity';
import type { PageSection, SectionLayout, ComponentNode } from '../../domain/entities/page-section.entity';
import type { OfferCardTemplate, AppConfigStructure, AppConfig } from '../../domain/entities/app-config.entity';
import type { TemplatePageSnapshot } from '../../domain/entities/template.entity';
import { generateElementId } from '../../shared/utils/id-generator';
import { migratePageConfigIds } from '../../shared/utils/config-migrator';

interface PageConstructorViewModel {
  appId: string;
  merchantId: string;
  pageSlug: string;
  sections: PageSection[];
  selectedSection: PageSection | null;
  selectedComponent: ComponentNode | null;
  isLoading: boolean;
  isSaving: boolean;
  isDraft: boolean;
  error: string | null;
}

@injectable()
export class PageConstructorPresenter {
  private readonly subscribers: Array<(vm: PageConstructorViewModel) => void> = [];
  private saveDraftDebounceTimer: NodeJS.Timeout | null = null;

  private readonly saveOfferCardsDebounceMs = 350;
  private saveOfferCardsTimer: ReturnType<typeof setTimeout> | undefined;
  private saveOfferCardsPending = false;
  private saveOfferCardsPromise: Promise<void> | null = null;

  private pageStyles: { padding?: string; gap?: string; backgroundColor?: string; backgroundOpacity?: number } = {};

  private offerCards: OfferCardTemplate[] = [];
  private selectedOfferCardId: string | null = null;
  private lastAppConfig: AppConfig | null = null;

  private elementSelectionMode: boolean = false;
  
  private vm: PageConstructorViewModel = {
    appId: '',
    merchantId: '',
    pageSlug: 'home',
    sections: [],
    selectedSection: null,
    selectedComponent: null,
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
    @inject(UI_BUILDER_TYPES.LoadDraftConfigUseCase)
    private readonly _loadDraftConfigUseCase: LoadDraftConfigUseCase,
    @inject(UI_BUILDER_TYPES.UpdateOfferCardsUseCase)
    private readonly _updateOfferCardsUseCase: UpdateOfferCardsUseCase,
    @inject(UI_BUILDER_TYPES.PageConfigStorage)
    private readonly _pageConfigStorage: PageConfigStoragePort,
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
        
        const migratedConfig = migratePageConfigIds(result.value);
        
        this.pageStyles = migratedConfig.pageStyles || {};
        
        let finalConfig = migratedConfig;
        const hasNoSections = !migratedConfig.sections || migratedConfig.sections.length === 0;
        
        if (pageSlug === 'home' && hasNoSections) {
          const defaultSections = this.createDefaultSectionsForHome();
          finalConfig = {
            ...migratedConfig,
            sections: defaultSections,
          };
        }
        
        this.vm = { 
          ...this.vm, 
          sections: finalConfig.sections,
          isLoading: false,
          isDraft: finalConfig.isDraft
        };
        
        if (JSON.stringify(result.value) !== JSON.stringify(finalConfig)) {
          await this._saveDraftUseCase.execute(finalConfig);
        }
        
        this.sendConfigToIframe();
      } else {
        this.pageStyles = {};
        
        if (pageSlug === 'home') {
          const defaultSections = this.createDefaultSectionsForHome();
          this.vm = { 
            ...this.vm, 
            sections: defaultSections,
            isLoading: false 
          };
          
          const defaultPageConfig: PageConfig = {
            id: generateElementId('page'),
            appId,
            merchantId: this.vm.merchantId || '550e8400-e29b-41d4-a716-446655440000',
            pageSlug,
            version: 1,
            isDraft: true,
            isActive: false,
            sections: defaultSections,
            pageStyles: {},
          };
          
          await this._saveDraftUseCase.execute(defaultPageConfig);
        } else {
          this.vm = { 
            ...this.vm, 
            sections: [],
            isLoading: false 
          };
        }
      }

      await this.loadOfferCards();
      
      this.selectedOfferCardId = null;

      this.notify();
      this.sendConfigToIframe();
      await this.sendAppConfigToIframe();
    } catch (error) {
      this.vm = { 
        ...this.vm, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
      this.notify();
    }
  }

  public addSection(type: 'header' | 'content' | 'footer'): void {
    const newSection: PageSection = {
      id: generateElementId(type),
      type,
      layout: {
        grid: '1-column',
        gap: '1rem',
        align: 'start',
      },
      styles: {
        minHeight: '350px',
        border: '2px dashed #d1d5db', 
      },
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

  public selectSection(sectionId: string | null): void {
    if (sectionId === null) {
      this.vm = {
        ...this.vm,
        selectedSection: null,
        selectedComponent: null,
      };
      this.notify();
      return;
    }

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
    this.vm = {
      ...this.vm,
      sections: this.vm.sections.map(section =>
        section.id === sectionId
          ? { ...section, layout }
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

  public updateSectionStyles(sectionId: string, styles: Record<string, unknown>): void {
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

  public addComponent(sectionId: string, componentType: string): void {

    const newComponent: ComponentNode = {
      id: generateElementId(componentType.toLowerCase()),
      type: componentType,
      props: this.getDefaultProps(componentType),
      styles: this.getDefaultStyles(componentType),
    };

    this.vm = {
      ...this.vm,
      sections: this.vm.sections.map(section =>
        section.id === sectionId
          ? { ...section, components: [...(section.components || []), newComponent] }
          : section
      ),
      selectedComponent: newComponent,
    };

    this.notify();
    this.saveConfigDebounced();
    this.sendConfigToIframe();
  }

  public removeComponent(sectionId: string, componentId: string): void {

    this.vm = {
      ...this.vm,
      sections: this.vm.sections.map(section =>
        section.id === sectionId
          ? { ...section, components: (section.components || []).filter(c => c.id !== componentId) }
          : section
      ),
      selectedComponent: this.vm.selectedComponent?.id === componentId ? null : this.vm.selectedComponent,
    };

    this.notify();
    this.saveConfigDebounced();
    this.sendConfigToIframe();
  }

  public selectComponent(sectionId: string | null, componentId: string | null): void {
    if (sectionId === null || componentId === null) {
      this.vm = {
        ...this.vm,
        selectedComponent: null,
      };
      this.notify();
      return;
    }

    const section = this.vm.sections.find(s => s.id === sectionId);
    if (!section) return;

    const component = section.components?.find(c => c.id === componentId);
    if (!component) return;

    this.vm = {
      ...this.vm,
      selectedSection: section,
      selectedComponent: component,
    };

    this.notify();
  }

  public updateComponent(sectionId: string, componentId: string, props: Record<string, unknown>, styles?: Record<string, unknown>): void {
    this.vm = {
      ...this.vm,
      sections: this.vm.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              components: (section.components || []).map(comp =>
                comp.id === componentId
                  ? { 
                      ...comp, 
                      props: { ...(comp.props || {}), ...props },
                      styles: styles !== undefined 
                        ? { ...(comp.styles || {}), ...styles } 
                        : (comp.styles || {})
                    }
                  : comp
              ),
            }
          : section
      ),
    };

    if (this.vm.selectedComponent?.id === componentId) {
      const section = this.vm.sections.find(s => s.id === sectionId);
      this.vm.selectedComponent = section?.components.find(c => c.id === componentId) || null;
    }

    this.notify();
    this.saveConfigDebounced();
    this.sendConfigToIframe();
  }

  private saveConfigDebounced(): void {
    if (this.saveDraftDebounceTimer) {
      clearTimeout(this.saveDraftDebounceTimer);
    }

    this.saveDraftDebounceTimer = setTimeout(() => {
      this.saveDraft();
    }, 500);
  }

  public async saveDraft(): Promise<boolean> {
    this.vm = { ...this.vm, isSaving: true, error: null };
    this.notify();

    try {
      const config: PageConfig = {
        id: '', 
        appId: this.vm.appId,
        merchantId: this.vm.merchantId,
        pageSlug: this.vm.pageSlug,
        version: 1, 
        isDraft: true,
        isActive: false,
        sections: this.vm.sections,
        pageStyles: this.pageStyles,
      };

      const result = await this._saveDraftUseCase.execute(config);

      if (!result.isSuccess) {
        this.vm = { ...this.vm, isSaving: false, error: result.error?.message || 'Failed to save draft' };
        this.notify();
        return false;
      }

      this.vm = { ...this.vm, isSaving: false };
      this.notify();
      return true;
    } catch (error) {
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
    this.vm = { ...this.vm, isSaving: true, error: null };
    this.notify();

    try {
      const result = await this._publishUseCase.execute(this.vm.appId, this.vm.pageSlug);

      if (!result.isSuccess) {
        this.vm = { ...this.vm, isSaving: false, error: result.error?.message || 'Failed to publish' };
        this.notify();
        return false;
      }

      const activeResult = await this._pageConfigStorage.loadActive(this.vm.appId, this.vm.pageSlug);
      
      if (activeResult.isSuccess && activeResult.value) {
        const activeConfig = activeResult.value;
        
        this.vm = {
          ...this.vm,
          sections: activeConfig.sections,
          isSaving: false,
          isDraft: false,
        };
        this.pageStyles = activeConfig.pageStyles || {};
        this.notify();
        
        this.sendActiveConfigToIframe(activeConfig);
      } else {
        this.vm = { ...this.vm, isSaving: false, isDraft: false };
        this.notify();
      }
      
      return true;
    } catch (error) {
      this.vm = {
        ...this.vm,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      this.notify();
      return false;
    }
  }

  public updatePagePadding(padding: string): void {
    this.pageStyles = {
      ...this.pageStyles,
      padding: padding || undefined,
    };

    this.notify();
    this.saveConfigDebounced();
    this.sendConfigToIframe();
  }

  public updatePageGap(gap: string): void {
    this.pageStyles = {
      ...this.pageStyles,
      gap: gap || undefined,
    };

    this.notify();
    this.saveConfigDebounced();
    this.sendConfigToIframe();
  }

  public updatePageBackgroundColor(backgroundColor: string): void {
    this.pageStyles = {
      ...this.pageStyles,
      backgroundColor: backgroundColor || undefined,
    };

    this.notify();
    this.saveConfigDebounced();
    this.sendConfigToIframe();
  }

  public updatePageBackgroundOpacity(opacity: number): void {
    this.pageStyles = {
      ...this.pageStyles,
      backgroundOpacity: opacity !== undefined && opacity !== null ? opacity : undefined,
    };

    this.notify();
    this.saveConfigDebounced();
    this.sendConfigToIframe();
  }

  public getPageStyles(): { padding?: string; gap?: string; backgroundColor?: string; backgroundOpacity?: number } {
    return { ...this.pageStyles };
  }

  public createDefaultTemplatePageSnapshot(): TemplatePageSnapshot {
    const sections = this.createDefaultSectionsForHome();
    return {
      pageSlug: 'home',
      pageConfig: {
        sections,
        pageStyles: {},
      },
    };
  }

  public applyTemplatePageConfig(input: { appId: string; merchantId: string; pageSlug: string; pageConfig: unknown }): void {
    if (
      !input.pageConfig ||
      typeof input.pageConfig !== 'object' ||
      !Array.isArray((input.pageConfig as any).sections)
    ) {
      return;
    }

    const snapshot = input.pageConfig as {
      sections: PageSection[];
      pageStyles?: { padding?: string; gap?: string; backgroundColor?: string; backgroundOpacity?: number };
    };

    this.vm = {
      ...this.vm,
      appId: input.appId,
      merchantId: input.merchantId,
      pageSlug: input.pageSlug,
      sections: snapshot.sections,
      selectedSection: null,
      selectedComponent: null,
      isDraft: true,
      error: null,
    };

    this.pageStyles = snapshot.pageStyles ? { ...snapshot.pageStyles } : {};

    this.notify();
    this.saveConfigDebounced();
    this.sendConfigToIframe();
  }

  private sendActiveConfigToIframe(config: PageConfig): void {
    if (typeof window === 'undefined') return;

    const iframe = document.querySelector('iframe');
    if (!iframe?.contentWindow) {
      return;
    }

    try {
      iframe.contentWindow.postMessage(
        { type: 'PAGE_CONFIG_UPDATE', config: config },
        '*'
      );
    } catch (error) {
    }
  }

  private sendConfigToIframe(): void {
    if (typeof window === 'undefined') return;

    const iframe = document.querySelector('iframe');
    if (!iframe?.contentWindow) {
      return;
    }

    const pageConfig: PageConfig = {
      id: 'draft',
      appId: this.vm.appId,
      merchantId: this.vm.merchantId || '550e8400-e29b-41d4-a716-446655440000',
      pageSlug: this.vm.pageSlug,
      version: 1,
      isDraft: true,
      isActive: false,
      sections: [...this.vm.sections],
      pageStyles: this.pageStyles ? { ...this.pageStyles } : undefined,
    };

    try {
      iframe.contentWindow.postMessage(
        { type: 'PAGE_CONFIG_UPDATE', config: pageConfig },
        '*'
      );
      
      setTimeout(() => {
        try {
          iframe.contentWindow?.postMessage(
            {
              type: 'CONFIG_UPDATE',
              elementSelectionMode: this.elementSelectionMode,
            },
            '*'
          );
        } catch (error) {
        }
      }, 100);
    } catch (error) {
    }
  }
  
  public setElementSelectionMode(enabled: boolean): void {
    if (this.elementSelectionMode === enabled) {
      return;
    }
    
    this.elementSelectionMode = enabled;
    
    if (typeof window !== 'undefined') {
      const iframe = document.querySelector('iframe');
      if (iframe?.contentWindow) {
        try {
          iframe.contentWindow.postMessage(
            {
              type: 'CONFIG_UPDATE',
              elementSelectionMode: enabled,
            },
            '*'
          );
        } catch (error) {
        }
      }
    }
  }
  
  public getElementSelectionMode(): boolean {
    return this.elementSelectionMode;
  }

  private async sendAppConfigToIframe(): Promise<void> {
    if (typeof window === 'undefined') return;

    const iframe = document.querySelector('iframe');
    if (!iframe?.contentWindow) {
      return;
    }

    try {
      let appConfig: AppConfig | null = this.lastAppConfig
        ? {
            ...this.lastAppConfig,
            config: { ...(this.lastAppConfig.config as AppConfigStructure) },
          }
        : null;

      if (!appConfig) {
        const result = await this._loadDraftConfigUseCase.execute(this.vm.appId);
        
        if (!result.isSuccess || !result.value) {
          return;
        }

        appConfig = result.value;
        this.lastAppConfig = result.value;
      }

      const config = appConfig.config as AppConfigStructure;
      const updatedConfig: AppConfigStructure = {
        ...config,
        offerCards: [...this.offerCards],
      };

      const updatedAppConfig: AppConfig = {
        ...appConfig,
        config: updatedConfig,
      };

      this.lastAppConfig = updatedAppConfig;

      const payload: Record<string, unknown> = {
        config: updatedAppConfig,
        offerCards: [...this.offerCards],
      };
      
      if (this.selectedOfferCardId !== null) {
        payload.selectedOfferCardId = this.selectedOfferCardId;
      }
      
      iframe.contentWindow.postMessage(
        {
          type: 'CONFIG_UPDATE',
          payload,
        },
        '*'
      );
    } catch (error) {
    }
  }

  private getDefaultProps(componentType: string): Record<string, unknown> {
    const defaults: Record<string, Record<string, unknown>> = {
      Text: { text: 'Enter text here...' },
      Button: { text: 'Click' },
      Image: { src: '', alt: 'Image' },
      Video: { src: '' },
      ProductsList: {},
      OffersList: {},
      Container: {},
    };

    return defaults[componentType] || {};
  }

  private getDefaultStyles(componentType: string): Record<string, unknown> {
    if (componentType === 'Video') {
      return {
        minHeight: '315px', 
      };
    }
    const defaults: Record<string, Record<string, unknown>> = {
      Button: {
        backgroundColor: '#ffc629',
        textColor: '#ffffff',
        borderColor: '#ffffff',
      },
    };

    return defaults[componentType] || {};
  }

  public async loadOfferCards(): Promise<void> {
    try {
      const result = await this._loadDraftConfigUseCase.execute(this.vm.appId);
      
      if (!result.isSuccess || !result.value) {
        this.offerCards = [];
        return;
      }

      this.lastAppConfig = result.value;
      const config = result.value.config as AppConfigStructure;
      const loadedCards = config.offerCards || [];
      const figmaStyles = this.getDefaultFigmaStyles();
      this.offerCards = loadedCards.map(card => {
        const mergedStyles: OfferCardTemplate['styles'] = {
          container: { ...figmaStyles.container, ...(card.styles?.container || {}) },
          topLabel: { ...figmaStyles.topLabel, ...(card.styles?.topLabel || {}) },
          image: { ...figmaStyles.image, ...(card.styles?.image || {}) },
          discountBadge: { ...figmaStyles.discountBadge, ...(card.styles?.discountBadge || {}) },
          title: { ...figmaStyles.title, ...(card.styles?.title || {}) },
          description: { ...figmaStyles.description, ...(card.styles?.description || {}) },
          originalPrice: { ...figmaStyles.originalPrice, ...(card.styles?.originalPrice || {}) },
          currentPrice: { ...figmaStyles.currentPrice, ...(card.styles?.currentPrice || {}) },
          rarity: { ...figmaStyles.rarity, ...(card.styles?.rarity || {}) },
          buyButton: { 
            ...figmaStyles.buyButton,
            ...(card.styles?.buyButton || {}),
            backgroundColor: (card.styles?.buyButton?.backgroundColor === '#99ff00' || 
                             card.styles?.buyButton?.backgroundColor === '#99FF00')
              ? figmaStyles.buyButton?.backgroundColor
              : (card.styles?.buyButton?.backgroundColor || figmaStyles.buyButton?.backgroundColor),
          },
          purchasedBadge: { ...figmaStyles.purchasedBadge, ...(card.styles?.purchasedBadge || {}) },
          bonuses: { ...figmaStyles.bonuses, ...(card.styles?.bonuses || {}) },
          includedItems: { ...figmaStyles.includedItems, ...(card.styles?.includedItems || {}) },
        };
        
        return {
          ...card,
        styles: mergedStyles,
        media: card.media ? { ...card.media } : undefined,
        };
      });

      if (!this.selectedOfferCardId || !this.offerCards.some(card => card.id === this.selectedOfferCardId)) {
        if (!this.offerCards.some(card => card.id === this.selectedOfferCardId)) {
          this.selectedOfferCardId = null;
        }
      }

      this.updateLastAppConfigOfferCards();
      
      const needsSave = loadedCards.some((card, index) => {
        const loaded = card.styles || {};
        const merged = this.offerCards[index].styles;
        return JSON.stringify(loaded) !== JSON.stringify(merged);
      });
      
      if (needsSave) {
      }
      
    } catch (error) {
      this.offerCards = [];
    }
  }

  public getOfferCards(): OfferCardTemplate[] {
    return [...this.offerCards];
  }

  public getSelectedOfferCardId(): string | null {
    return this.selectedOfferCardId;
  }

  public getSelectedOfferCard(): OfferCardTemplate | null {
    if (!this.selectedOfferCardId) return null;
    return this.offerCards.find(card => card.id === this.selectedOfferCardId) || null;
  }

  private updateLastAppConfigOfferCards(): void {
    if (!this.lastAppConfig) {
      return;
    }

    const config = (this.lastAppConfig.config as AppConfigStructure) || {};

    const nextConfig: AppConfigStructure = {
      ...config,
      offerCards: [...this.offerCards],
    };

    this.lastAppConfig = { ...this.lastAppConfig, config: nextConfig };
  }

  public selectOfferCard(cardId: string | null): void {
    this.selectedOfferCardId = cardId;

    this.sendAppConfigToIframe();
  }

  private getDefaultFigmaStyles(): OfferCardTemplate['styles'] {
    return {
      container: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: '20px',
        shadow: 'lg',
        backgroundOpacity: '1',
        blurAmount: '0',
      },
      topLabel: {
        backgroundColor: '#ffb63e',
        color: '#FFFFFF',
        fontSize: '12px',
        fontWeight: '600',
        padding: '8px 4px',
        borderRadius: '20px',
      },
      image: {
        backgroundColor: '#374151',
        aspectRatio: '1.5 / 1',
        height: '274px',
      },
      discountBadge: {
        backgroundColor: '#ff2060',
        color: '#FFFFFF',
        fontSize: '12px',
        fontWeight: '500',
        padding: '8px 4px',
        borderRadius: '20px',
      },
      includedItems: {
        backgroundColor: '#374151',
        itemBackgroundColor: '#4B5563',
      },
      title: {
        fontSize: '18px',
        fontWeight: '500',
        color: '#FAF9F6',
      },
      description: {
        fontSize: '16px',
        fontWeight: '400',
        color: '#FAF9F6',
        lineHeight: '23px',
      },
      originalPrice: {
        fontSize: '16px',
        fontWeight: '500',
        color: '#FFFFFF',
      },
      currentPrice: {
        fontSize: '16px',
        fontWeight: '500',
        color: '#FAF9F6',
      },
      rarity: {
        backgroundColor: '#8A2BE2',
        color: '#FFFFFF',
      },
      buyButton: {
        backgroundColor: '#FF6B35',
        color: '#FFFFFF',
        borderRadius: '8px',
        fontSize: 'clamp(12px, 4cqw, 18px)',
        fontWeight: 'bold',
        padding: '12px 8px',
        minHeight: '48px',

        enabled: true,
      },
      purchasedBadge: {
        backgroundColor: '#10B981',
        color: '#FFFFFF',
        padding: '12px 16px',
        borderRadius: '8px',
        minHeight: '44px',

        enabled: false,
      },
      bonuses: {
        rpColor: '#FBBF24',
        lpColor: '#3B82F6',
        fontSize: '12px',
      },
    };
  }

  public async migrateOfferCardsToFigmaStyles(): Promise<void> {
    const figmaStyles = this.getDefaultFigmaStyles();
    
    this.offerCards = this.offerCards.map(card => {
      const mergedStyles: OfferCardTemplate['styles'] = {
        container: { ...figmaStyles.container, ...(card.styles.container || {}) },
        topLabel: { ...figmaStyles.topLabel, ...(card.styles.topLabel || {}) },
        image: { ...figmaStyles.image, ...(card.styles.image || {}) },
        discountBadge: { ...figmaStyles.discountBadge, ...(card.styles.discountBadge || {}) },
        title: { ...figmaStyles.title, ...(card.styles.title || {}) },
        description: { ...figmaStyles.description, ...(card.styles.description || {}) },
        originalPrice: { ...figmaStyles.originalPrice, ...(card.styles.originalPrice || {}) },
        currentPrice: { ...figmaStyles.currentPrice, ...(card.styles.currentPrice || {}) },
        rarity: { ...figmaStyles.rarity, ...(card.styles.rarity || {}) },
        buyButton: { 
          ...figmaStyles.buyButton,
          ...(card.styles.buyButton || {}),
          backgroundColor: (card.styles.buyButton?.backgroundColor === '#99ff00' || 
                           card.styles.buyButton?.backgroundColor === '#99FF00')
            ? figmaStyles.buyButton?.backgroundColor
            : (card.styles.buyButton?.backgroundColor || figmaStyles.buyButton?.backgroundColor),
        },
        purchasedBadge: { ...figmaStyles.purchasedBadge, ...(card.styles.purchasedBadge || {}) },
        bonuses: { ...figmaStyles.bonuses, ...(card.styles.bonuses || {}) },
        includedItems: { ...figmaStyles.includedItems, ...(card.styles.includedItems || {}) },
      };
      
      return {
        ...card,
        styles: mergedStyles,
        media: card.media ? { ...card.media } : undefined,
      };
    });
    
    this.scheduleSaveOfferCards();
    await this.sendAppConfigToIframe();
  }

  public async addOfferCard(name?: string): Promise<void> {
    const newCard: OfferCardTemplate = {
      id: generateElementId('offer-card'),
      name: name || `Offer Card ${this.offerCards.length + 1}`,
      styles: this.getDefaultFigmaStyles(),
      media: {
        mainImageAlt: 'Offer card image',
      },
    };

    this.offerCards = [...this.offerCards, newCard];
    this.selectedOfferCardId = newCard.id;
    
    this.scheduleSaveOfferCards();
    await this.sendAppConfigToIframe();
  }

  public async updateOfferCard(cardId: string, template: OfferCardTemplate): Promise<void> {
    const index = this.offerCards.findIndex(card => card.id === cardId);
    if (index === -1) {
      return;
    }

    this.offerCards = [
      ...this.offerCards.slice(0, index),
      template,
      ...this.offerCards.slice(index + 1),
    ];

    this.scheduleSaveOfferCards();
    await this.sendAppConfigToIframe();
  }

  public async removeOfferCard(cardId: string): Promise<void> {
    this.offerCards = this.offerCards.filter(card => card.id !== cardId);
    
    if (this.selectedOfferCardId === cardId) {
      this.selectedOfferCardId = this.offerCards.length > 0 ? this.offerCards[0].id : null;
    }

    this.scheduleSaveOfferCards();
    await this.sendAppConfigToIframe();
  }

  public updateAppConfigSnapshot(config: AppConfigStructure | null): void {
    if (!config) {
      return;
    }

    if (this.lastAppConfig) {
      this.lastAppConfig = {
        ...this.lastAppConfig,
        config: { ...config },
      };
    } else {
      this.lastAppConfig = {
        id: undefined,
        appId: this.vm.appId,
        merchantId: this.vm.merchantId || '550e8400-e29b-41d4-a716-446655440000',
        version: { value: 1 } as any,
        isDraft: true,
        isActive: false,
        config: { ...config },
      };
    }
  }

  private scheduleSaveOfferCards(delayMs: number = this.saveOfferCardsDebounceMs): void {
    this.saveOfferCardsPending = true;

    if (this.saveOfferCardsTimer) {
      clearTimeout(this.saveOfferCardsTimer);
    }

    this.saveOfferCardsTimer = setTimeout(() => {
      this.saveOfferCardsTimer = undefined;
      void this.runOfferCardsSave();
    }, Math.max(0, delayMs));
  }

  private async flushSaveOfferCards(): Promise<void> {
    if (this.saveOfferCardsTimer) {
      clearTimeout(this.saveOfferCardsTimer);
      this.saveOfferCardsTimer = undefined;
    }

    if (!this.saveOfferCardsPending && !this.saveOfferCardsPromise) {
      return;
    }

    this.saveOfferCardsPending = true;
    await this.runOfferCardsSave();
  }

  private async runOfferCardsSave(): Promise<void> {
    if (this.saveOfferCardsPromise) {
      try {
        await this.saveOfferCardsPromise;
      } catch {
      }
    }

    if (!this.saveOfferCardsPending) {
      return;
    }

    this.saveOfferCardsPending = false;

    const savePromise = this.saveOfferCards();
    this.saveOfferCardsPromise = savePromise;

    try {
      await savePromise;
    } finally {
      this.saveOfferCardsPromise = null;
      if (this.saveOfferCardsPending) {
        await this.runOfferCardsSave();
      }
    }
  }

  private createDefaultSectionsForHome(): PageSection[] {
    const defaultSection: PageSection = {
      id: generateElementId('content'),
      type: 'content',
      layout: {
        grid: '1-column',
        gap: '1rem',
        align: 'start',
      },
      styles: {
        minHeight: '350px',
        border: '2px dashed #d1d5db',
      },
      components: [],
    };
    
    return [defaultSection];
  }

  private async saveOfferCards(): Promise<void> {
    try {
      const result = await this._updateOfferCardsUseCase.execute(
        this.vm.appId,
        this.vm.merchantId,
        this.offerCards,
      );
      
      if (!result.isSuccess) {
        return;
      }

      this.updateLastAppConfigOfferCards();
    } catch (error) {
    }
  }
}
