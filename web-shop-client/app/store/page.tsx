'use client';

import { container } from '../../src/infrastructure/bootstrap/container';
import { APP_LAYOUT_TYPES } from '../../src/modules/app-layout/infrastructure/bootstrap/types';
import { SidebarRendererPresenter } from '../../src/modules/app-layout/interface-adapters/presenters/sidebar-renderer.presenter';
import { SidebarRenderer } from '../../src/modules/app-layout/interface-adapters/ui/components/sidebar-renderer';
import type { ActionContext } from '../../src/shared/ui/action-context';
import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PAGE_RENDERER_TYPES } from '../../src/modules/page-renderer/infrastructure/bootstrap/types';
import { PageRendererPresenter } from '../../src/modules/page-renderer/interface-adapters/presenters/page-renderer.presenter';
import type { PageRendererViewModel } from '../../src/modules/page-renderer/interface-adapters/view-models/page-renderer.view-model';
import { LoadAppConfigFromMessageUseCase } from '../../src/application/use-cases/load-app-config-from-message.use-case';
import { LoadAppConfigUseCase } from '../../src/application/use-cases/load-app-config.use-case';
import { TYPES } from '../../src/infrastructure/bootstrap/types';
import { OfferCard } from '../../src/shared/components/molecules/offer-card';
import { ProductsList } from '../../src/modules/products/interface-adapters/ui/components/products-list';
import { DailyRewardsPopup } from '../../src/modules/daily-rewards';

export default function StorePage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sidebarPresenter = container.get<SidebarRendererPresenter>(
    APP_LAYOUT_TYPES.SidebarRendererPresenter
  );

  // Get appId and userId from query parameters
  const appId = searchParams.get('appId') || 'default-app';
  const userId = searchParams.get('userId') || 'anonymous-user';

  // Check if we're in preview mode
  const [previewMode, setPreviewMode] = useState(false);
  const [elementSelectionMode, setElementSelectionMode] = useState(false);
  const [currentAppId, setCurrentAppId] = useState<string>(appId);
  const [showDailyRewardsPopup, setShowDailyRewardsPopup] = useState(false);
  const applyElementSelectionMode = useCallback((enabled: boolean) => {
    setElementSelectionMode(enabled);

    if (typeof window !== 'undefined') {
      (window as any).__elementSelectionMode = enabled;
    }

    if (typeof document !== 'undefined') {
      if (enabled) {
        document.body.setAttribute('data-selection-mode', 'true');
      } else {
        document.body.removeAttribute('data-selection-mode');
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('elementSelectionModeChanged', { detail: { enabled } }));
    }
  }, []);
  const [offerCardVm, setOfferCardVm] = useState<PageRendererViewModel>({
    sections: [],
    isLoading: false,
    error: null,
    selectedOfferCardId: null,
    offerCards: []
  });

  // ActionContext для обработки действий
  // Helper function to preserve query parameters
  const navigateWithQuery = (path: string) => {
    const currentSearch = searchParams.toString();
    const newUrl = currentSearch ? `${path}?${currentSearch}` : path;
    console.log('[StorePage] Navigating to:', newUrl);
    router.push(newUrl);
  };

  const actionContext: ActionContext = {
    onPopupOpen: () => {},
    onPopupClose: () => {},
    navigate: (url: string) => {
      if (typeof url === 'string') {
        navigateWithQuery(url);
      }
    },
    navigateToPatchNotes: () => {
      console.log('[StorePage] Navigating to patch notes');
      navigateWithQuery('/patch-notes');
    },
  };

  // Check previewMode from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        const isPreview = url.searchParams.get('previewMode') === 'true';
        setPreviewMode(isPreview);
        console.log('[StorePage] Preview mode:', isPreview);
      } catch (err) {
        console.error('[StorePage] Failed to parse URL for previewMode:', err);
      }
    }
  }, []);

  // Load app config on mount if appId is available (for iframe Builder preview)
  useEffect(() => {
    const loadAppConfig = async () => {
      try {
        // Set current appId (already extracted from searchParams)
        setCurrentAppId(appId);

        // Check if we're in an iframe (likely Builder preview)
        const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

        if (appId) {
          // Try to load config from Supabase if not loaded yet
          const loadAppConfigUseCase = container.get<LoadAppConfigUseCase>(TYPES.LoadAppConfig);

          if (previewMode || isInIframe) {
            // Load draft config for preview mode
            await loadAppConfigUseCase.execute(true);
            console.log('[StorePage] Draft app config loaded from Supabase for preview mode', { appId, isInIframe });
          } else {
            // Load active config for regular client usage
            await loadAppConfigUseCase.execute(false);
            console.log('[StorePage] Active app config loaded from Supabase for regular client', { appId });
          }
        }
      } catch (error) {
        console.warn('[StorePage] Failed to load app config on mount, will wait for CONFIG_UPDATE message', error);
      }
    };

    loadAppConfig();
  }, [previewMode]);

  // Subscribe to PageRendererPresenter for offer card updates (only in preview mode)
  useEffect(() => {
    if (!previewMode) return;

    const presenter = container.get<PageRendererPresenter>(PAGE_RENDERER_TYPES.PageRendererPresenter);
    const loadAppConfigFromMessageUseCase = container.get<LoadAppConfigFromMessageUseCase>(TYPES.LoadAppConfigFromMessage);

    // Subscribe to ViewModel changes
    const unsubscribe = presenter.subscribe((newVm) => {
      setOfferCardVm(newVm);
      console.log('[StorePage] Offer card VM updated', {
        selectedOfferCardId: newVm.selectedOfferCardId,
        offerCardsCount: newVm.offerCards.length
      });
    });

    // Listen for CONFIG_UPDATE messages from parent window
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'CONFIG_UPDATE') {
        try {
          console.log('[StorePage] Received CONFIG_UPDATE', {
            hasConfig: !!event.data.payload?.config,
            hasOfferCards: !!event.data.payload?.offerCards,
            offerCardsCount: event.data.payload?.offerCards?.length || 0,
            selectedOfferCardId: event.data.payload?.selectedOfferCardId
          });

          // Load app-config (this will publish AppConfigLoadedEvent)
          if (event.data.payload?.config) {
            const configPayload = event.data.payload.config as any;
            await loadAppConfigFromMessageUseCase.execute(configPayload);
            const selectionModeValue =
              typeof configPayload.elementSelectionMode === 'boolean'
                ? configPayload.elementSelectionMode
                : Boolean(configPayload.elementSelectionMode);
            applyElementSelectionMode(Boolean(selectionModeValue));
          } else {
            applyElementSelectionMode(false);
          }

          // Set offer cards and selected offer card ID in presenter
          if (event.data.payload?.offerCards) {
            console.log('[StorePage] Setting offer cards', { count: event.data.payload.offerCards.length });
            presenter.setOfferCards(event.data.payload.offerCards);
          }
          // Only update selectedOfferCardId if explicitly provided in payload (preserve current value if not provided)
          if (event.data.payload?.selectedOfferCardId !== undefined) {
            if (event.data.payload.selectedOfferCardId !== null) {
              console.log('[StorePage] Setting selected offer card ID', { cardId: event.data.payload.selectedOfferCardId });
              presenter.setSelectedOfferCardId(event.data.payload.selectedOfferCardId);
            } else {
              // Explicitly clear when null is provided
              console.log('[StorePage] Clearing selected offer card ID (explicit null)');
              presenter.setSelectedOfferCardId(null);
            }
          }
          // If selectedOfferCardId is not in payload, keep current value (don't clear it)
        } catch (error) {
          console.error('[StorePage] Failed to process app config update from message', error);
        }
      } else if (event.data?.type === 'SHOW_AUTH_POPUP') {
        const visible = event.data.payload?.visible ?? false;
        console.log('[StorePage] Received SHOW_AUTH_POPUP', { visible });

        if (visible) {
          // Ensure config is loaded before showing popup
          // If config is in the message, load it first
          if (event.data.payload?.config) {
            try {
              await loadAppConfigFromMessageUseCase.execute(event.data.payload.config);
              console.log('[StorePage] Config loaded before showing auth popup');
            } catch (error) {
              console.error('[StorePage] Failed to load config before showing popup', error);
            }
          }

          // Dispatch showAuthPopup event to trigger AuthModule popup
          window.dispatchEvent(new CustomEvent('showAuthPopup'));
        } else {
          // Dispatch close event if needed (AuthModule should handle closing)
          window.dispatchEvent(new CustomEvent('closeAuthPopup'));
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      unsubscribe();
      window.removeEventListener('message', handleMessage);
    };
  }, [previewMode, applyElementSelectionMode]);

  // Find selected offer card for demo section
  const selectedOfferCard = offerCardVm.selectedOfferCardId && offerCardVm.offerCards.length > 0
    ? offerCardVm.offerCards.find(card => card.id === offerCardVm.selectedOfferCardId)
    : null;

  // Debug logging for demo section
  useEffect(() => {
    if (previewMode) {
      console.log('[StorePage] Demo section debug:', {
        previewMode,
        selectedOfferCardId: offerCardVm.selectedOfferCardId,
        offerCardsCount: offerCardVm.offerCards.length,
        offerCardsIds: offerCardVm.offerCards.map(c => c.id),
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
      console.log('[StorePage] Sent PREVIEW_READY to parent');
    }
  }, []);

  // Show Daily Rewards popup for authenticated users
  useEffect(() => {
    if (previewMode || userId === 'anonymous-user') {
      return;
    }

    // Show popup after a short delay to let the page load
    const timer = setTimeout(() => {
      setShowDailyRewardsPopup(true);
    }, 3000); // 3 seconds delay

    return () => clearTimeout(timer);
  }, [previewMode, userId]);

  return (
    <main className="flex-1 overflow-y-auto w-full mx-auto px-4 md:px-8" style={{ paddingBottom: 'calc(128px + env(safe-area-inset-bottom))' }}>
      {/* Daily Rewards Popup */}
      <DailyRewardsPopup
        userId={userId}
        appId={appId}
        isOpen={showDailyRewardsPopup}
        onClose={() => setShowDailyRewardsPopup(false)}
        autoShow={false}
      />


      {/* Demo section for selected offer card (only in preview mode) */}
      {previewMode && selectedOfferCard && (
        <div key="offer-card-demo-section" className="offer-card-demo-section" style={{ padding: '20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 'bold', width: '100%', textAlign: 'left' }}>
            Offer Card Preview: {selectedOfferCard.name}
          </h2>
          <div style={{ maxWidth: '400px', width: '100%', display: 'flex', justifyContent: 'center' }}>
            {(() => {
              const isPurchased =
                (selectedOfferCard.styles as any)?.buyButton?.enabled === false ||
                (selectedOfferCard as any)?.buyButton?.enabled === false ||
                (selectedOfferCard.styles as any)?.purchasedBadge?.enabled === true ||
                false;
              return (
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
              isPurchased={isPurchased}
            />
              );
            })()}
          </div>
        </div>
      )}

      {/* Store content - Products list */}
      <div className="mt-12">
        <ProductsList />
      </div>
    </main>
  );
}
