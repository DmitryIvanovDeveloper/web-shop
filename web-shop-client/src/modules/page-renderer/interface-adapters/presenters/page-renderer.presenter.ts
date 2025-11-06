import { injectable, inject } from 'inversify';
import type { PageRendererViewModel } from '../view-models/page-renderer.view-model';
import type { PageConfig } from '../../domain/entities/page-config.entity';
import type { Logger } from '../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { OfferCardTemplate } from '../../../../shared/config/app-config.types';

@injectable()
export class PageRendererPresenter {
  private _vm: PageRendererViewModel = {
    sections: [],
    pageStyles: {},
    isLoading: true,
    error: null,
    selectedOfferCardId: null,
    offerCards: []
  };
  
  private _listeners: Array<(vm: PageRendererViewModel) => void> = [];
  
  constructor(
    @inject(ROOT_TYPES.Logger) private readonly _logger: Logger
  ) {}

  get viewModel(): PageRendererViewModel {
    return this._vm;
  }

  subscribe(listener: (vm: PageRendererViewModel) => void): () => void {
    this._listeners.push(listener);
    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }

  private _notify(): void {
    this._listeners.forEach(listener => listener(this._vm));
  }

  setLoading(isLoading: boolean): void {
    this._vm = { ...this._vm, isLoading };
    this._notify();
  }

  setError(error: string): void {
    this._logger.error('[PageRendererPresenter] Error', error);
    this._vm = { ...this._vm, error, isLoading: false };
    this._notify();
  }

  setPageConfig(pageConfig: PageConfig | null): void {
    this._logger.info('[PageRendererPresenter] Setting page config', {
      hasConfig: !!pageConfig,
      sectionsCount: pageConfig?.sections.length || 0,
      hasPageStyles: !!pageConfig?.pageStyles,
      pagePadding: pageConfig?.pageStyles?.padding || 'not set'
    });
    
    this._vm = {
      ...this._vm,
      sections: pageConfig?.sections || [],
      pageStyles: pageConfig?.pageStyles || {},
      isLoading: false,
      error: null
    };
    this._notify();
  }

  setSelectedOfferCardId(cardId: string | null): void {
    this._logger.info('[PageRendererPresenter] Setting selected offer card ID', { cardId });
    this._vm = {
      ...this._vm,
      selectedOfferCardId: cardId
    };
    this._notify();
  }

  setOfferCards(offerCards: OfferCardTemplate[]): void {
    this._logger.info('[PageRendererPresenter] Setting offer cards', { 
      count: offerCards.length,
      selectedCardId: this._vm.selectedOfferCardId,
      selectedCardBuyButtonBg: offerCards.find(c => c.id === this._vm.selectedOfferCardId)?.styles?.buyButton?.backgroundColor
    });
    // Create deep copy to ensure React detects changes
    this._vm = {
      ...this._vm,
      offerCards: offerCards.map(card => ({
        ...card,
        styles: { ...card.styles },
        media: card.media ? { ...card.media } : undefined,
      }))
    };
    this._notify();
  }
}

