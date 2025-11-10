'use client';

import { container } from '../src/infrastructure/bootstrap/container';
import { APP_LAYOUT_TYPES } from '../src/modules/app-layout/infrastructure/bootstrap/types';
import { SidebarRendererPresenter } from '../src/modules/app-layout/interface-adapters/presenters/sidebar-renderer.presenter';
import { SidebarRenderer } from '../src/modules/app-layout/interface-adapters/ui/components/sidebar-renderer';
import type { ActionContext } from '../src/shared/ui/action-context';
import { useEffect, useState } from 'react';
import { PAGE_RENDERER_TYPES } from '../src/modules/page-renderer/infrastructure/bootstrap/types';
import { PageRendererPresenter } from '../src/modules/page-renderer/interface-adapters/presenters/page-renderer.presenter';
import type { PageRendererViewModel } from '../src/modules/page-renderer/interface-adapters/view-models/page-renderer.view-model';
import { LoadAppConfigFromMessageUseCase } from '../src/application/use-cases/load-app-config-from-message.use-case';
import { TYPES } from '../src/infrastructure/bootstrap/types';
import { OfferCard } from '../src/shared/components/molecules/offer-card';

export default function HomePage(): JSX.Element {
  const sidebarPresenter = container.get<SidebarRendererPresenter>(
    APP_LAYOUT_TYPES.SidebarRendererPresenter
  );

  // Check if we're in preview mode
  const [previewMode, setPreviewMode] = useState(false);
  const [offerCardVm, setOfferCardVm] = useState<PageRendererViewModel>({
    sections: [],
    isLoading: false,
    error: null,
    selectedOfferCardId: null,
    offerCards: []
  });

  // ActionContext для обработки действий
  const actionContext: ActionContext = {
    onPopupOpen: () => {},
    onPopupClose: () => {},
  };

  // Check previewMode from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        const isPreview = url.searchParams.get('previewMode') === 'true';
        setPreviewMode(isPreview);
        console.log('[HomePage] Preview mode:', isPreview);
      } catch (err) {
        console.error('[HomePage] Failed to parse URL for previewMode:', err);
      }
    }
  }, []);

  // Subscribe to PageRendererPresenter for offer card updates (only in preview mode)
  useEffect(() => {
    if (!previewMode) return;

    const presenter = container.get<PageRendererPresenter>(PAGE_RENDERER_TYPES.PageRendererPresenter);
    const loadAppConfigFromMessageUseCase = container.get<LoadAppConfigFromMessageUseCase>(TYPES.LoadAppConfigFromMessage);

    // Subscribe to ViewModel changes
    const unsubscribe = presenter.subscribe((newVm) => {
      setOfferCardVm(newVm);
      console.log('[HomePage] Offer card VM updated', {
        selectedOfferCardId: newVm.selectedOfferCardId,
        offerCardsCount: newVm.offerCards.length
      });
    });

    // Listen for CONFIG_UPDATE messages from parent window
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'CONFIG_UPDATE') {
        try {
          console.log('[HomePage] Received CONFIG_UPDATE', {
            hasConfig: !!event.data.payload?.config,
            hasOfferCards: !!event.data.payload?.offerCards,
            offerCardsCount: event.data.payload?.offerCards?.length || 0,
            selectedOfferCardId: event.data.payload?.selectedOfferCardId
          });

          // Load app-config (this will publish AppConfigLoadedEvent)
          if (event.data.payload?.config) {
            await loadAppConfigFromMessageUseCase.execute(event.data.payload.config);
      }

          // Set offer cards and selected offer card ID in presenter
          if (event.data.payload?.offerCards) {
            console.log('[HomePage] Setting offer cards', { count: event.data.payload.offerCards.length });
            presenter.setOfferCards(event.data.payload.offerCards);
          }
          if (event.data.payload?.selectedOfferCardId !== undefined) {
            console.log('[HomePage] Setting selected offer card ID', { cardId: event.data.payload.selectedOfferCardId });
            presenter.setSelectedOfferCardId(event.data.payload.selectedOfferCardId);
          } else {
            presenter.setSelectedOfferCardId(null);
          }
        } catch (error) {
          console.error('[HomePage] Failed to process app config update from message', error);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      unsubscribe();
      window.removeEventListener('message', handleMessage);
    };
  }, [previewMode]);

  // Find selected offer card for demo section
  const selectedOfferCard = offerCardVm.selectedOfferCardId && offerCardVm.offerCards.length > 0
    ? offerCardVm.offerCards.find(card => card.id === offerCardVm.selectedOfferCardId)
    : null;

  // Debug logging for demo section
  useEffect(() => {
    if (previewMode) {
      console.log('[HomePage] Demo section debug:', {
        previewMode,
        selectedOfferCardId: offerCardVm.selectedOfferCardId,
        offerCardsCount: offerCardVm.offerCards.length,
        offerCardIds: offerCardVm.offerCards.map(c => c.id),
        selectedOfferCard: selectedOfferCard ? selectedOfferCard.name : null
      });
    }
  }, [previewMode, offerCardVm.selectedOfferCardId, offerCardVm.offerCards, selectedOfferCard]);

  // Set styles for demo section when selectedOfferCard changes
  useEffect(() => {
    if (previewMode && selectedOfferCard && typeof window !== 'undefined') {
      // Save current styles
      const currentStyles = (window as any).__offerCardStyles;

      // Set styles from selected offer card
      (window as any).__offerCardStyles = {
        styles: selectedOfferCard.styles || {}
      };

      // Dispatch event to notify OfferCard components
      window.dispatchEvent(new Event('appConfigLoaded'));

      // Restore previous styles on cleanup (optional, for demo section we might want to keep them)
      return () => {
        if (currentStyles !== undefined) {
          (window as any).__offerCardStyles = currentStyles;
        }
      };
    }
  }, [previewMode, selectedOfferCard]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.parent && window.parent !== window) {
      const targetOrigin = process.env.NEXT_PUBLIC_UI_BUILDER_URL || '*';
      window.parent.postMessage({ type: 'PREVIEW_READY' }, targetOrigin);
      console.log('[HomePage] Sent PREVIEW_READY to parent');
    }
  }, []);

  return (
    <main className="flex-1 overflow-y-auto w-full mx-auto" style={{ paddingBottom: 'calc(128px + env(safe-area-inset-bottom))' }}>
      {/* Demo section for selected offer card (only in preview mode) */}
      {previewMode && selectedOfferCard && (
        <div key="offer-card-demo-section" className="offer-card-demo-section" style={{ padding: '20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 'bold', width: '100%', textAlign: 'left' }}>
            Offer Card Preview: {selectedOfferCard.name}
          </h2>
          <div style={{ maxWidth: '400px', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <OfferCard
              id={selectedOfferCard.id}
              topLabel="Limited Offer🎁"
              title="Offer #1"
              description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
              mainImage={selectedOfferCard.media?.mainImage ?? 'https://via.placeholder.com/400x274/374151/ffffff?text=Dragon+Slayer+Sword'}
              mainImageAlt={selectedOfferCard.media?.mainImageAlt ?? 'Offer card image'}
              discount="80%"
              originalPrice="24,99 $"
              currentPrice="14,99 $"
            />
          </div>
        </div>
      )}

      <SidebarRenderer 
        presenter={sidebarPresenter} 
        layoutType="store"
        actionContext={actionContext}
      />
    </main>
  );
}