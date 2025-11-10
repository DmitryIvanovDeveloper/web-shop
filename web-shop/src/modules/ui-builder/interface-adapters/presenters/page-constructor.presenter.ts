import { inject, injectable } from 'inversify';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { LoadPageDraftUseCase } from '../../application/use-cases/load-page-draft.use-case';
import type { SavePageDraftUseCase } from '../../application/use-cases/save-page-draft.use-case';
import type { PublishPageUseCase } from '../../application/use-cases/publish-page.use-case';
import type { LoadDraftConfigUseCase } from '../../application/use-cases/load-draft-config.use-case';
import type { UpdateOfferCardsUseCase } from '../../application/use-cases/update-offer-cards.use-case';
import type { Logger } from '@/application/ports/logger.port';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';
import type { PageConfig } from '../../domain/entities/page-config.entity';
import type { PageSection, SectionLayout, ComponentNode } from '../../domain/entities/page-section.entity';
import type { OfferCardTemplate, AppConfigStructure, AppConfig } from '../../domain/entities/app-config.entity';
import type { OfferCardSharedConfig } from '../../application/use-cases/update-offer-cards.use-case';

interface PageConstructorViewModel {
  appId: string;
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
  
  // Store pageStyles separately (not in ViewModel)
  private pageStyles: { padding?: string; gap?: string } = {};
  
  // Store offerCards separately (not in ViewModel)
  private offerCards: OfferCardTemplate[] = [];
  private selectedOfferCardId: string | null = null;
  private primaryOfferCardId: string | null = null;
  private lastAppConfig: AppConfig | null = null;
  
  private vm: PageConstructorViewModel = {
    appId: '',
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
        this.pageStyles = result.value.pageStyles || {};
        this.vm = { 
          ...this.vm, 
          sections: result.value.sections,
          isLoading: false,
          isDraft: result.value.isDraft
        };
      } else {
        // No draft exists, start with empty page
        this.pageStyles = {};
        this.vm = { 
          ...this.vm, 
          sections: [],
          isLoading: false 
        };
      }

      // Load offer cards from app config
      await this.loadOfferCards();

      this.notify();
      this.sendConfigToIframe();
      await this.sendAppConfigToIframe();
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
  }

  // ============ Component Operations ============

  public addComponent(sectionId: string, componentType: string): void {
    this._logger.info('[PageConstructorPresenter] Adding component', { sectionId, componentType });

    const newComponent: ComponentNode = {
      id: `${componentType.toLowerCase()}-${Date.now()}`,
      type: componentType,
      props: this.getDefaultProps(componentType),
      styles: {},
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
    this._logger.info('[PageConstructorPresenter] Updating component', { sectionId, componentId });

    this.vm = {
      ...this.vm,
      sections: this.vm.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              components: section.components.map(comp =>
                comp.id === componentId
                  ? { ...comp, props: { ...comp.props, ...props } }
                  : comp
              ),
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

  // ============ Page Settings ============

  public updatePagePadding(padding: string): void {
    this._logger.info('[PageConstructorPresenter] Updating page padding', { padding });

    this.pageStyles = {
      ...this.pageStyles,
      padding: padding || undefined,
    };

    this.notify();
    this.saveConfigDebounced();
    this.sendConfigToIframe();
  }

  public updatePageGap(gap: string): void {
    this._logger.info('[PageConstructorPresenter] Updating page gap', { gap });

    this.pageStyles = {
      ...this.pageStyles,
      gap: gap || undefined,
    };

    this.notify();
    this.saveConfigDebounced();
    this.sendConfigToIframe();
  }

  public getPageStyles(): { padding?: string; gap?: string } {
    return { ...this.pageStyles };
  }

  private sendConfigToIframe(): void {
    if (typeof window === 'undefined') return;

    const iframe = document.querySelector('iframe');
    if (!iframe?.contentWindow) {
      this._logger.warn('[PageConstructorPresenter] Iframe not found for sending config');
      return;
    }

    // Ensure we have sections - don't send empty config
    if (!this.vm.sections || this.vm.sections.length === 0) {
      this._logger.warn('[PageConstructorPresenter] No sections to send to iframe, skipping update');
      return;
    }

    const pageConfig: PageConfig = {
      id: 'draft',
      appId: this.vm.appId,
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

      this._logger.info('[PageConstructorPresenter] Sent config to iframe', {
        sectionsCount: pageConfig.sections.length,
        pagePadding: pageConfig.pageStyles?.padding || 'not set',
        pageGap: pageConfig.pageStyles?.gap || 'not set',
      });
    } catch (error) {
      this._logger.error('[PageConstructorPresenter] Failed to send config to iframe', error);
    }
  }

  private async sendAppConfigToIframe(): Promise<void> {
    if (typeof window === 'undefined') return;

    const iframe = document.querySelector('iframe');
    if (!iframe?.contentWindow) {
      this._logger.warn('[PageConstructorPresenter] Iframe not found for sending app config');
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
          this._logger.warn('[PageConstructorPresenter] Failed to load app-config for iframe', result.error);
          return;
        }

        appConfig = result.value;
        this.lastAppConfig = result.value;
      }

      const primaryCard = this.offerCards.length > 0 ? this.getPrimaryOfferCard() : null;
      if (this.offerCards.length > 0 && !primaryCard) {
        this._logger.warn('[PageConstructorPresenter] Skipping iframe update: no primary offer card selected');
        return;
      }

      // Update offerCards and shared UI config in config
      const config = appConfig.config as AppConfigStructure;
      const sharedConfig = this.cloneSharedConfig(config.shared);

      if (primaryCard) {
        const sharedNode = this.buildSharedOfferCardConfig(primaryCard);
        sharedConfig.offerCardUI = sharedNode;
        sharedConfig.productCardUI = sharedNode;
      } else {
        delete sharedConfig.offerCardUI;
        delete sharedConfig.productCardUI;
      }

      const updatedConfig: AppConfigStructure = {
        ...config,
        shared: sharedConfig,
        offerCards: [...this.offerCards],
      };

      // Create updated AppConfig
      const updatedAppConfig: AppConfig = {
        ...appConfig,
        config: updatedConfig,
      };

      this.lastAppConfig = updatedAppConfig;

      // Send CONFIG_UPDATE message with app-config, offerCards, and selectedOfferCardId
      iframe.contentWindow.postMessage(
        {
          type: 'CONFIG_UPDATE',
          payload: {
            config: updatedAppConfig,
            offerCards: [...this.offerCards],
            selectedOfferCardId: this.selectedOfferCardId,
          },
        },
        '*'
      );

      this._logger.info('[PageConstructorPresenter] Sent app-config to iframe', {
        offerCardsCount: this.offerCards.length,
        selectedOfferCardId: this.selectedOfferCardId,
      });
    } catch (error) {
      this._logger.error('[PageConstructorPresenter] Failed to send app-config to iframe', error);
    }
  }

  // ============ Helper Methods ============

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

  // ============ Offer Cards Methods ============

  public async loadOfferCards(): Promise<void> {
    try {
      const result = await this._loadDraftConfigUseCase.execute(this.vm.appId);
      
      if (!result.isSuccess || !result.value) {
        this._logger.warn('[PageConstructorPresenter] Failed to load offer cards, using empty array', result.error);
        this.offerCards = [];
        return;
      }

      this.lastAppConfig = result.value;
      const config = result.value.config as AppConfigStructure;
      const loadedCards = config.offerCards || [];
      
      // Ensure all cards have complete styles from getDefaultFigmaStyles()
      // This ensures cards look correct even if DB has incomplete styles
      const figmaStyles = this.getDefaultFigmaStyles();
      this.offerCards = loadedCards.map(card => {
        // Deep merge: start with Figma defaults, then apply DB styles
        const mergedStyles: OfferCardTemplate['styles'] = {
          container: { ...figmaStyles.container, ...(card.styles?.container || {}) },
          topLabel: { ...figmaStyles.topLabel, ...(card.styles?.topLabel || {}) },
          image: { ...figmaStyles.image, ...(card.styles?.image || {}) },
          discountBadge: { ...figmaStyles.discountBadge, ...(card.styles?.discountBadge || {}) },
          title: { ...figmaStyles.title, ...(card.styles?.title || {}) },
          description: { ...figmaStyles.description, ...(card.styles?.description || {}) },
          priceBlock: { ...figmaStyles.priceBlock, ...(card.styles?.priceBlock || {}) },
          originalPrice: { ...figmaStyles.originalPrice, ...(card.styles?.originalPrice || {}) },
          currentPrice: { ...figmaStyles.currentPrice, ...(card.styles?.currentPrice || {}) },
          rarity: { ...figmaStyles.rarity, ...(card.styles?.rarity || {}) },
          buyButton: { 
            ...figmaStyles.buyButton,
            ...(card.styles?.buyButton || {}),
            // Fix incorrect old backgroundColor value
            backgroundColor: (card.styles?.buyButton?.backgroundColor === '#99ff00' || 
                             card.styles?.buyButton?.backgroundColor === '#99FF00')
              ? figmaStyles.buyButton?.backgroundColor
              : (card.styles?.buyButton?.backgroundColor || figmaStyles.buyButton?.backgroundColor),
          },
          purchasedBadge: { ...figmaStyles.purchasedBadge, ...(card.styles?.purchasedBadge || {}) },
          bonuses: { ...figmaStyles.bonuses, ...(card.styles?.bonuses || {}) },
          includedItems: { ...figmaStyles.includedItems, ...(card.styles?.includedItems || {}) },
        };

        if (mergedStyles.priceBlock && 'backgroundColor' in mergedStyles.priceBlock) {
          delete (mergedStyles.priceBlock as Record<string, unknown>).backgroundColor;
        }
        
        return {
          ...card,
        styles: mergedStyles,
        media: card.media ? { ...card.media } : undefined,
        };
      });
      
      const sharedPrimaryId = this.extractSharedOfferCardId(config.shared);
      this.primaryOfferCardId = sharedPrimaryId && this.offerCards.some(card => card.id === sharedPrimaryId)
        ? sharedPrimaryId
        : null;

      if (!this.selectedOfferCardId && this.primaryOfferCardId) {
        this.selectedOfferCardId = this.primaryOfferCardId;
      }
      
      // If styles were updated, save them back to DB
      const needsSave = loadedCards.some((card, index) => {
        const loaded = card.styles || {};
        const merged = this.offerCards[index].styles;
        // Check if any styles were added from defaults
        return JSON.stringify(loaded) !== JSON.stringify(merged);
      });
      
      if (needsSave) {
        this._logger.info('[PageConstructorPresenter] Offer cards styles were incomplete (autosave temporarily disabled)');
        // TODO: re-enable auto-save once debugging is finished
        // this.scheduleSaveOfferCards(0);
        // await this.flushSaveOfferCards();
      }
      
      this._logger.info('[PageConstructorPresenter] Loaded offer cards', { count: this.offerCards.length });

      this.ensurePrimaryOfferCard();
    } catch (error) {
      this._logger.error('[PageConstructorPresenter] Error loading offer cards', error);
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

  private ensurePrimaryOfferCard(): void {
    if (this.offerCards.length === 0) {
      this.primaryOfferCardId = null;
      this.selectedOfferCardId = null;
      return;
    }

    const hasPrimary = this.primaryOfferCardId && this.offerCards.some(card => card.id === this.primaryOfferCardId);
    if (!hasPrimary) {
      this.primaryOfferCardId = this.offerCards[0].id;
      this._logger.info('[PageConstructorPresenter] Auto-assigned primary offer card', {
        primaryOfferCardId: this.primaryOfferCardId,
      });
    }

    if (this.selectedOfferCardId && !this.offerCards.some(card => card.id === this.selectedOfferCardId)) {
      this.selectedOfferCardId = this.primaryOfferCardId;
    }
  }

  private getPrimaryOfferCard(): OfferCardTemplate | null {
    if (this.offerCards.length === 0) {
      return null;
    }

    if (!this.primaryOfferCardId) {
      this._logger.error('[PageConstructorPresenter] Primary offer card is not defined');
      return null;
    }

    const card = this.offerCards.find(item => item.id === this.primaryOfferCardId);
    if (!card) {
      this._logger.error('[PageConstructorPresenter] Primary offer card not found in collection', {
        primaryOfferCardId: this.primaryOfferCardId,
      });
      return null;
    }

    return card;
  }

  private buildSharedOfferCardConfig(card: OfferCardTemplate): OfferCardSharedConfig {
    return {
      type: 'OfferCard',
      id: card.id,
      name: card.name,
      styles: JSON.parse(JSON.stringify(card.styles ?? {})),
      media: card.media ? JSON.parse(JSON.stringify(card.media)) : undefined,
    };
  }

  private cloneSharedConfig(shared: unknown): Record<string, unknown> {
    if (shared && typeof shared === 'object' && !Array.isArray(shared)) {
      return { ...(shared as Record<string, unknown>) };
    }

    return {};
  }

  private extractSharedOfferCardId(shared: unknown): string | null {
    if (!shared || typeof shared !== 'object') {
      return null;
    }

    const sharedRecord = shared as Record<string, unknown>;
    const candidate = sharedRecord.offerCardUI ?? sharedRecord.productCardUI;

    if (candidate && typeof candidate === 'object' && 'id' in candidate && typeof (candidate as { id: unknown }).id === 'string') {
      return (candidate as { id: string }).id;
    }

    return null;
  }

  private updateLastAppConfigShared(shared: OfferCardSharedConfig | null): void {
    if (!this.lastAppConfig) {
      return;
    }

    const config = (this.lastAppConfig.config as AppConfigStructure) || {};
    const sharedConfig = this.cloneSharedConfig(config.shared);

    if (shared) {
      sharedConfig.offerCardUI = shared;
      sharedConfig.productCardUI = shared;
    } else {
      delete sharedConfig.offerCardUI;
      delete sharedConfig.productCardUI;
    }

    const nextConfig: AppConfigStructure = {
      ...config,
      shared: sharedConfig,
      offerCards: [...this.offerCards],
    };

    this.lastAppConfig = { ...this.lastAppConfig, config: nextConfig };
  }

  public selectOfferCard(cardId: string | null): void {
    this.selectedOfferCardId = cardId;

    if (cardId) {
      this.primaryOfferCardId = cardId;
      this._logger.info('[PageConstructorPresenter] Selected offer card', {
        cardId,
        primaryOfferCardId: this.primaryOfferCardId,
      });
    } else {
      this._logger.info('[PageConstructorPresenter] Cleared offer card selection');
    }

    this.sendAppConfigToIframe();
  }

  /**
   * Get default Figma-based styles for offer card
   */
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
      priceBlock: {
        borderRadius: '20px',
        padding: '16px 12px',
        minHeight: '60px',
        alignment: 'left',
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
      },
      purchasedBadge: {
        backgroundColor: '#10B981',
        color: '#FFFFFF',
      },
      bonuses: {
        rpColor: '#FBBF24',
        lpColor: '#3B82F6',
        fontSize: '12px',
      },
    };
  }

  /**
   * Migrate existing offer cards to Figma styles (merges with existing styles)
   * Ensures all values from getDefaultFigmaStyles() are in the config (DB)
   */
  public async migrateOfferCardsToFigmaStyles(): Promise<void> {
    this._logger.info('[PageConstructorPresenter] Migrating offer cards to Figma styles');
    
    const figmaStyles = this.getDefaultFigmaStyles();
    
    this.offerCards = this.offerCards.map(card => {
      // Deep merge: start with Figma defaults, then apply user customizations
      // This ensures all values from getDefaultFigmaStyles() are present in config
      const mergedStyles: OfferCardTemplate['styles'] = {
        container: { ...figmaStyles.container, ...(card.styles.container || {}) },
        topLabel: { ...figmaStyles.topLabel, ...(card.styles.topLabel || {}) },
        image: { ...figmaStyles.image, ...(card.styles.image || {}) },
        discountBadge: { ...figmaStyles.discountBadge, ...(card.styles.discountBadge || {}) },
        title: { ...figmaStyles.title, ...(card.styles.title || {}) },
        description: { ...figmaStyles.description, ...(card.styles.description || {}) },
        priceBlock: { ...figmaStyles.priceBlock, ...(card.styles.priceBlock || {}) },
        originalPrice: { ...figmaStyles.originalPrice, ...(card.styles.originalPrice || {}) },
        currentPrice: { ...figmaStyles.currentPrice, ...(card.styles.currentPrice || {}) },
        rarity: { ...figmaStyles.rarity, ...(card.styles.rarity || {}) },
        buyButton: { 
          ...figmaStyles.buyButton,
          ...(card.styles.buyButton || {}),
          // Fix incorrect old backgroundColor value - always use correct from Figma if wrong
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
    this._logger.info('[PageConstructorPresenter] Offer cards migrated to Figma styles', { count: this.offerCards.length });
  }

  public async addOfferCard(name?: string): Promise<void> {
    const newCard: OfferCardTemplate = {
      id: `offer-card-${Date.now()}`,
      name: name || `Offer Card ${this.offerCards.length + 1}`,
      styles: this.getDefaultFigmaStyles(),
      media: {
        mainImageAlt: 'Offer card image',
      },
    };

    this.offerCards = [...this.offerCards, newCard];
    this.selectedOfferCardId = newCard.id;
    this.primaryOfferCardId = newCard.id;
    this.ensurePrimaryOfferCard();
    
    this.scheduleSaveOfferCards();
    await this.sendAppConfigToIframe();
    this._logger.info('[PageConstructorPresenter] Added offer card', { cardId: newCard.id, name: newCard.name });
  }

  public async updateOfferCard(cardId: string, template: OfferCardTemplate): Promise<void> {
    const index = this.offerCards.findIndex(card => card.id === cardId);
    if (index === -1) {
      this._logger.warn('[PageConstructorPresenter] Offer card not found for update', { cardId });
      return;
    }

    this.offerCards = [
      ...this.offerCards.slice(0, index),
      template,
      ...this.offerCards.slice(index + 1),
    ];

    this.scheduleSaveOfferCards();
    await this.sendAppConfigToIframe();
    this._logger.info('[PageConstructorPresenter] Updated offer card', { cardId });
  }

  public async removeOfferCard(cardId: string): Promise<void> {
    this.offerCards = this.offerCards.filter(card => card.id !== cardId);
    
    if (this.selectedOfferCardId === cardId) {
      this.selectedOfferCardId = null;
    }

    if (this.primaryOfferCardId === cardId) {
      this.primaryOfferCardId = null;
    }

    this.ensurePrimaryOfferCard();

    this.scheduleSaveOfferCards();
    await this.sendAppConfigToIframe();
    this._logger.info('[PageConstructorPresenter] Removed offer card', { cardId });
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
        version: { value: 1 } as any,
        isDraft: true,
        isActive: false,
        config: { ...config },
      };
    }
  }

  private scheduleSaveOfferCards(delayMs: number = this.saveOfferCardsDebounceMs): void {
    this._logger.debug?.('[PageConstructorPresenter] Scheduling auto-save', { delayMs });
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
    this._logger.debug?.('[PageConstructorPresenter] Running auto-save');
    if (this.saveOfferCardsPromise) {
      try {
        await this.saveOfferCardsPromise;
      } catch {
        // Ошибка уже залогирована в saveOfferCards
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

  private async saveOfferCards(): Promise<void> {
    try {
      const primaryCard = this.offerCards.length > 0 ? this.getPrimaryOfferCard() : null;

      if (this.offerCards.length > 0 && !primaryCard) {
        this._logger.error('[PageConstructorPresenter] Skipping save: no primary offer card selected');
        return;
      }

      const sharedConfig = primaryCard ? this.buildSharedOfferCardConfig(primaryCard) : null;

      const result = await this._updateOfferCardsUseCase.execute(
        this.vm.appId,
        this.offerCards,
        sharedConfig,
      );
      
      if (!result.isSuccess) {
        this._logger.error('[PageConstructorPresenter] Failed to save offer cards', result.error);
        return;
      }

      this.updateLastAppConfigShared(sharedConfig);
    } catch (error) {
      this._logger.error('[PageConstructorPresenter] Error saving offer cards', error);
    }
  }
}

