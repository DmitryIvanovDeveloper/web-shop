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
import { DAILY_REWARDS_TYPES } from '../../src/modules/daily-rewards/infrastructure/bootstrap/types';
import type { CheckDailyRewardAvailabilityUseCase } from '../../src/modules/daily-rewards/application/use-cases/check-daily-reward-availability.use-case';
import { isSuccess } from '../../src/shared/result/result';
import type { OfferCardTemplate } from '../../src/shared/config/app-config.types';

type OfferCardWithFlags = OfferCardTemplate & {
  styles?: OfferCardTemplate['styles'] & {
    buyButton?: { enabled?: boolean | null } | null;
    purchasedBadge?: { enabled?: boolean | null } | null;
  };
  buyButton?: { enabled?: boolean | null } | null;
};

declare const process: {
  env: {
    NEXT_PUBLIC_UI_BUILDER_URL?: string;
  };
};

export default function StorePage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sidebarPresenter = container.get<SidebarRendererPresenter>(
    APP_LAYOUT_TYPES.SidebarRendererPresenter
  );

  const appId = searchParams.get('appId');
  const userId = searchParams.get('userId') || 'anonymous-user';

  if (!appId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">App ID Required</h1>
          <p className="text-gray-600">Please specify ?appId=YOUR_APP_ID in the URL.</p>
        </div>
      </div>
    );
  }

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

  const navigateWithQuery = (path: string) => {
    const currentSearch = searchParams.toString();
    const newUrl = currentSearch ? `${path}?${currentSearch}` : path;
    router.push(newUrl);
  };

  const actionContext: ActionContext = {
    onPopupOpen: () => { },
    onPopupClose: () => { },
    navigate: (url: string) => {
      if (typeof url === 'string') {
        navigateWithQuery(url);
      }
    },
    navigateToPatchNotes: () => {
      navigateWithQuery('/patch-notes');
    },
    navigateToDailyRewards: () => {
      navigateWithQuery('/daily-rewards');
    },
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        const isPreview = url.searchParams.get('previewMode') === 'true';
        setPreviewMode(isPreview);
      } catch (err) {
      }
    }
  }, []);

  useEffect(() => {
    const loadAppConfig = async () => {
      try {
        setCurrentAppId(appId);

        const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

        if (appId) {
          const loadAppConfigUseCase = container.get<LoadAppConfigUseCase>(TYPES.LoadAppConfig);

          if (previewMode || isInIframe) {
            await loadAppConfigUseCase.execute(true);
          } else {
            await loadAppConfigUseCase.execute(false);
          }
        }
      } catch (error) {
      }
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(() => loadAppConfig());
    } else {
      setTimeout(() => loadAppConfig(), 0);
    }
  }, [previewMode]);

  useEffect(() => {
    if (!previewMode) return;

    const presenter = container.get<PageRendererPresenter>(PAGE_RENDERER_TYPES.PageRendererPresenter);
    const loadAppConfigFromMessageUseCase = container.get<LoadAppConfigFromMessageUseCase>(TYPES.LoadAppConfigFromMessage);

    const unsubscribe = presenter.subscribe((newVm) => {
      setOfferCardVm(newVm);
    });

    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'CONFIG_UPDATE') {
        try {
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

          if (event.data.payload?.offerCards) {
            presenter.setOfferCards(event.data.payload.offerCards);
          }
          if (event.data.payload?.selectedOfferCardId !== undefined) {
            if (event.data.payload.selectedOfferCardId !== null) {
              presenter.setSelectedOfferCardId(event.data.payload.selectedOfferCardId);
            } else {
              console.log('[StorePage] Clearing selected offer card ID (explicit null)');
              presenter.setSelectedOfferCardId(null);
            }
          }
        } catch (error) {
        }
      } else if (event.data?.type === 'SHOW_AUTH_POPUP') {
        const visible = event.data.payload?.visible ?? false;
        if (visible) {
          if (event.data.payload?.config) {
            try {
              await loadAppConfigFromMessageUseCase.execute(event.data.payload.config);
            } catch (error) {
            }
          }

          window.dispatchEvent(new CustomEvent('showAuthPopup'));
        } else {
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

  const selectedOfferCard = offerCardVm.selectedOfferCardId && offerCardVm.offerCards.length > 0
    ? offerCardVm.offerCards.find(card => card.id === offerCardVm.selectedOfferCardId)
    : null;

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

  useEffect(() => {
    if (previewMode && selectedOfferCard && typeof window !== 'undefined') {
      const currentStyles = (window as any).__offerCardStyles;

      (window as any).__offerCardStyles = {
        styles: selectedOfferCard.styles || {}
      };

      window.dispatchEvent(new Event('appConfigLoaded'));

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
    }
  }, []);

  useEffect(() => {
    if (previewMode || userId === 'anonymous-user' || !appId) {
      return;
    }

    const checkAndShowPopup = async () => {
      try {
        const checkUseCase = container.get<CheckDailyRewardAvailabilityUseCase>(
          DAILY_REWARDS_TYPES.CheckDailyRewardAvailabilityUseCase
        );

        const result = await checkUseCase.execute({
          userId,
          appId
        });

        if (isSuccess(result) && result.data?.canClaim) {
          setTimeout(() => {
            setShowDailyRewardsPopup(true);
          }, 3000);
        } else {
          console.log('[store/page.tsx] No active reward available today, popup will NOT be shown', {
            isSuccess: isSuccess(result),
            canClaim: isSuccess(result) ? result.data?.canClaim : undefined,
            error: !isSuccess(result) ? result.error?.message : undefined
          });
        }
      } catch (error) {
      }
    };

    checkAndShowPopup();
  }, [previewMode, userId, appId]);

  return (
    <main className="flex-1 overflow-y-auto w-full mx-auto px-4 md:px-8" style={{ paddingBottom: 'calc(128px + env(safe-area-inset-bottom))' }}>
      { }
      <DailyRewardsPopup
        userId={userId}
        isOpen={showDailyRewardsPopup}
        onClose={() => setShowDailyRewardsPopup(false)}
        autoShow={false}
      />


      { }
      {previewMode && selectedOfferCard && (
        <div key="offer-card-demo-section" className="offer-card-demo-section" style={{ padding: '20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 'bold', width: '100%', textAlign: 'left' }}>
            Offer Card Preview: {selectedOfferCard.name}
          </h2>
          <div style={{ maxWidth: '400px', width: '100%', display: 'flex', justifyContent: 'center' }}>
            {(() => {
              const cardWithFlags = selectedOfferCard as OfferCardWithFlags;
              const isPurchased =
                cardWithFlags.styles?.buyButton?.enabled === false ||
                cardWithFlags.buyButton?.enabled === false ||
                cardWithFlags.styles?.purchasedBadge?.enabled === true ||
                false;
              return (
                <OfferCard
                  id={selectedOfferCard.id}
                  topLabel="Limited Offer🎁"
                  title="Offer #1"
                  description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                  mainImage={selectedOfferCard.media?.mainImage ?? 'https://via.placeholder.com/400x200'}
                  mainImageAlt={selectedOfferCard.media?.mainImageAlt ?? 'Offer card image'}
                  discount="80%"
                  isPurchased={isPurchased}
                />
              );
            })()}
          </div>
        </div>
      )}

      { }
      <div className="mt-12">
        <ProductsList />
      </div>
    </main>
  );
}
