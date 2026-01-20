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
import { usePathname } from 'next/navigation';
import type { PageRendererViewModel } from '../../src/modules/page-renderer/interface-adapters/view-models/page-renderer.view-model';
import { LoadAppConfigFromMessageUseCase } from '../../src/application/use-cases/load-app-config-from-message.use-case';
import { LoadAppConfigUseCase } from '../../src/application/use-cases/load-app-config.use-case';
import { TYPES } from '../../src/infrastructure/bootstrap/types';
import { OfferCard } from '../../src/shared/components/molecules/offer-card';
import { PatchNotesPublic } from '../../src/modules/patch-notes/interface-adapters/ui/components/patch-notes-public';
import type { AppConfig } from '../../src/shared/config/app-config.types';

export default function PatchNotesPage(): JSX.Element {
    const router = useRouter();
  const searchParams = useSearchParams();
  const sidebarPresenter = container.get<SidebarRendererPresenter>(
    APP_LAYOUT_TYPES.SidebarRendererPresenter
  );

    const [previewMode, setPreviewMode] = useState(false);
  const [elementSelectionMode, setElementSelectionMode] = useState(false);

    const getAppIdFromUrl = () => {
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        const appId = url.searchParams.get('appId') || url.searchParams.get('app');
        if (!appId) {
                    return '';
        }
        return appId;
      } catch (err) {
                return '';
      }
    }
    return '';
  };

  const [currentAppId, setCurrentAppId] = useState<string>('');

    useEffect(() => {
    const appId = getAppIdFromUrl();
    setCurrentAppId(appId);
  }, []);

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
    onPopupOpen: () => {},
    onPopupClose: () => {},
    navigate: (url: string) => {
      if (typeof url === 'string') {
        navigateWithQuery(url);
      }
    },
    navigateToPatchNotes: () => {
                  const patchNotesElement = document.getElementById('patch-notes-section');
      if (patchNotesElement) {
        patchNotesElement.scrollIntoView({ behavior: 'smooth' });
      } else {
                navigateWithQuery('/patch-notes');
      }
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
    const appId = getAppIdFromUrl();
    setCurrentAppId(appId);
      }, [searchParams]);

      useEffect(() => {
    const loadAppConfig = async () => {
      try {
                const appId = getAppIdFromUrl();

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
            const configPayload = event.data.payload.config as AppConfig;
            await loadAppConfigFromMessageUseCase.execute(configPayload);
            const selectionModeValue =
              typeof (configPayload as any).elementSelectionMode === 'boolean'
                ? (configPayload as any).elementSelectionMode
                : Boolean((configPayload as any).elementSelectionMode);
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
                            console.log('[PatchNotesPage] Clearing selected offer card ID (explicit null)');
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
      console.log('[PatchNotesPage] Demo section debug:', {
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
      const targetOrigin =
        (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_UI_BUILDER_URL) || '*';
      window.parent.postMessage({ type: 'PREVIEW_READY' }, targetOrigin);
    }
  }, []);

  return (
    <main className="flex-1 overflow-y-auto w-full mx-auto px-4 md:px-8" style={{ paddingBottom: 'calc(128px + env(safe-area-inset-bottom))' }}>
      {}
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

      {}
      <section id="patch-notes-section" className="mt-12">
        <PatchNotesPublic appId={currentAppId} />
      </section>
    </main>
  );
}
