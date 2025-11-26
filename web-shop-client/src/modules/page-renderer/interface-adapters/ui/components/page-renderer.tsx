'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SectionRenderer } from './section-renderer';
import { OfferCard } from '../../../../../shared/components/molecules/offer-card';
import { ProductsList } from '../../../../products/interface-adapters/ui/components/products-list';
import { container } from '../../../../../infrastructure/bootstrap/container';
import { PAGE_RENDERER_TYPES } from '../../../infrastructure/bootstrap/types';
import { LoadPageConfigUseCase } from '../../../application/use-cases/load-page-config.use-case';
import { LoadPageConfigFromMessageUseCase } from '../../../application/use-cases/load-page-config-from-message.use-case';
import { LoadAppConfigFromMessageUseCase } from '../../../../../application/use-cases/load-app-config-from-message.use-case';
import { TYPES } from '../../../../../infrastructure/bootstrap/types';
import { PageRendererPresenter } from '../../presenters/page-renderer.presenter';
import type { PageRendererViewModel } from '../../view-models/page-renderer.view-model';

// Check if in preview mode
const isPreviewMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('previewMode') === 'true' || params.get('uibuilder') === 'true';
};

const readSelectionModeFlag = (): boolean => {
  if (typeof document !== 'undefined' && document.body) {
    return document.body.getAttribute('data-selection-mode') === 'true';
  }
  if (typeof window !== 'undefined') {
    return (window as any).__elementSelectionMode === true;
  }
  return false;
};

interface PageRendererProps {
  appId: string;
  pageSlug?: string;
  theme: any;
  previewMode?: boolean;
}

export function PageRenderer({ appId, pageSlug = 'home', theme, previewMode = false }: PageRendererProps): JSX.Element {
  console.log('[PageRenderer] Component rendered', { appId, pageSlug, previewMode });
  const router = useRouter();
  const [vm, setVm] = useState<PageRendererViewModel>({
    sections: [],
    isLoading: true,
    error: null,
    selectedOfferCardId: null,
    offerCards: []
  });
  
  // Create actionContext with navigate function for button navigation
  const actionContext = {
    navigate: (url: string) => {
      console.log('[PageRenderer] Navigating to:', url);
      router.push(url);
    }
  };

  // State for hover effect in element selection mode
  const [isHovered, setIsHovered] = useState(false);
  const [elementSelectionMode, setElementSelectionMode] = useState(false);
  // State for selected element from UI Builder
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Listen for element selection mode changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleModeChange = (event: CustomEvent) => {
      const enabled = event.detail?.enabled ?? false;
      console.log('[PageRenderer] Received elementSelectionModeChanged event:', enabled, { pageSlug });
      setElementSelectionMode(enabled);
    };

    const initialMode = readSelectionModeFlag();
    console.log('[PageRenderer] Initial elementSelectionMode:', initialMode, {
      bodyAttribute: typeof document !== 'undefined' && document.body ? document.body.getAttribute('data-selection-mode') : null,
      windowFlag: typeof window !== 'undefined' ? (window as any).__elementSelectionMode : false
    });
    setElementSelectionMode(initialMode);

    // Also check periodically if mode changed (in case it was set before this component mounted)
    const checkInterval = setInterval(() => {
      const currentMode = readSelectionModeFlag();
      setElementSelectionMode((prevMode) => {
        if (currentMode !== prevMode) {
          console.log('[PageRenderer] ElementSelectionMode changed via polling:', { from: prevMode, to: currentMode });
          return currentMode;
        }
        return prevMode;
      });
    }, 500);

    window.addEventListener('elementSelectionModeChanged', handleModeChange as EventListener);

    return () => {
      window.removeEventListener('elementSelectionModeChanged', handleModeChange as EventListener);
      clearInterval(checkInterval);
    };
  }, [pageSlug]);

  useEffect(() => {
    const presenter = container.get<PageRendererPresenter>(PAGE_RENDERER_TYPES.PageRendererPresenter);
    const loadUseCase = container.get<LoadPageConfigUseCase>(PAGE_RENDERER_TYPES.LoadPageConfigUseCase);

    // Подписываемся на изменения ViewModel
    const unsubscribe = presenter.subscribe((newVm) => {
      console.log('[PageRenderer] ViewModel updated:', { 
        sectionsCount: newVm.sections.length, 
        isLoading: newVm.isLoading,
        pageSlug,
        sections: newVm.sections.map(s => ({ id: s.id, type: s.type, componentsCount: s.components?.length || 0 }))
      });
      setVm(newVm);
    });

    // Инициализируем загрузку данных
    presenter.setLoading(true);
    loadUseCase.execute({ appId, pageSlug, previewMode }).then((result) => {
      if (!result.isSuccess) {
        presenter.setError(result.error?.message || 'Failed to load page config');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [appId, pageSlug, previewMode]);

  // Apply selection to element when selectedElementId changes
  useEffect(() => {
    // Remove selection from all elements
    document.querySelectorAll('[data-element-id]').forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.classList.remove('preview-selected');
      htmlEl.style.removeProperty('box-shadow');
    });
    
    // Apply selection to target element
    if (selectedElementId) {
      // Use setTimeout to ensure DOM is ready after page switch
      const timeoutId = setTimeout(() => {
        const targetElement = document.querySelector(`[data-element-id="${selectedElementId}"]`) as HTMLElement;
        if (targetElement) {
          targetElement.classList.add('preview-selected');
          targetElement.style.setProperty('box-shadow', '0 0 0 2px #3b82f6', 'important');
          console.log('[PageRenderer] Applied selection to element:', selectedElementId);
        } else {
          console.warn('[PageRenderer] SELECT_ELEMENT: element not found, will retry', { selectedElementId });
          // Retry after a short delay in case element hasn't rendered yet
          setTimeout(() => {
            const retryElement = document.querySelector(`[data-element-id="${selectedElementId}"]`) as HTMLElement;
            if (retryElement) {
              retryElement.classList.add('preview-selected');
              retryElement.style.setProperty('box-shadow', '0 0 0 2px #3b82f6', 'important');
              console.log('[PageRenderer] Applied selection to element on retry:', selectedElementId);
            }
          }, 200);
        }
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedElementId, pageSlug]); // Re-apply when pageSlug changes too

  // Handle preview updates from UI Builder via postMessage
  useEffect(() => {
    // Also check URL params for previewMode (in case prop is not passed correctly)
    const urlParams = new URLSearchParams(window.location.search);
    const urlPreviewMode = urlParams.get('previewMode') === 'true' || urlParams.get('uibuilder') === 'true';
    const effectivePreviewMode = previewMode || urlPreviewMode;
    
    console.log('[PageRenderer] Setting up message handler', { 
      previewMode, 
      urlPreviewMode,
      effectivePreviewMode,
      appId, 
      pageSlug,
      search: window.location.search
    });
    if (!effectivePreviewMode) {
      console.log('[PageRenderer] Preview mode is false, skipping message handler setup');
      return;
    }

    console.log('[PageRenderer] Message handler setup complete, listening for CONFIG_UPDATE and PAGE_CONFIG_UPDATE');
    const presenter = container.get<PageRendererPresenter>(PAGE_RENDERER_TYPES.PageRendererPresenter);
    const loadFromMessageUseCase = container.get<LoadPageConfigFromMessageUseCase>(
      PAGE_RENDERER_TYPES.LoadPageConfigFromMessageUseCase
    );
    const loadAppConfigFromMessageUseCase = container.get<LoadAppConfigFromMessageUseCase>(
      TYPES.LoadAppConfigFromMessage
    );

    const handleMessage = async (event: MessageEvent) => {
      console.log('[PageRenderer] Message received', { type: event.data?.type, origin: event.origin });
      
      // Handle SELECT_ELEMENT message from parent (UI Builder)
      if (event.data.type === 'SELECT_ELEMENT') {
        const elementId = event.data.payload?.elementId || null;
        console.log('[PageRenderer] Received SELECT_ELEMENT message', { elementId });
        setSelectedElementId(elementId);
        return;
      }
      
      // Handle CLICK_BUTTON message from parent (UI Builder)
      if (event.data.type === 'CLICK_BUTTON') {
        try {
          const { buttonId, temporarilyDisableSelectionMode } = event.data;
          console.log('[PageRenderer] Received CLICK_BUTTON message', { buttonId, temporarilyDisableSelectionMode });
          
          // Find button element by data-element-id
          const buttonElement = document.querySelector(`[data-element-id="${buttonId}"]`) as HTMLElement;
          if (!buttonElement) {
            console.warn('[PageRenderer] CLICK_BUTTON: button element not found', { buttonId });
            return;
          }

          // Temporarily disable element selection mode if needed
          let wasSelectionModeActive = false;
          if (temporarilyDisableSelectionMode) {
            wasSelectionModeActive = document.body.getAttribute('data-selection-mode') === 'true';
            if (wasSelectionModeActive) {
              document.body.removeAttribute('data-selection-mode');
              (window as any).__elementSelectionMode = false;
              window.dispatchEvent(new CustomEvent('elementSelectionModeChanged', { detail: { enabled: false } }));
              console.log('[PageRenderer] CLICK_BUTTON: temporarily disabled element selection mode');
            }
          }

          try {
            // Simulate click
            console.log('[PageRenderer] CLICK_BUTTON: simulating click on button', { buttonId });
            buttonElement.click();
            
            // Also dispatch MouseEvent for better compatibility
            const clickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window,
            });
            buttonElement.dispatchEvent(clickEvent);
          } catch (error) {
            console.error('[PageRenderer] CLICK_BUTTON: error simulating click', error);
          } finally {
            // Restore element selection mode if it was active
            if (wasSelectionModeActive) {
              setTimeout(() => {
                document.body.setAttribute('data-selection-mode', 'true');
                (window as any).__elementSelectionMode = true;
                window.dispatchEvent(new CustomEvent('elementSelectionModeChanged', { detail: { enabled: true } }));
                console.log('[PageRenderer] CLICK_BUTTON: restored element selection mode');
              }, 100);
            }
          }
        } catch (error) {
          console.error('[PageRenderer] Failed to handle CLICK_BUTTON message', error);
        }
        return;
      }
      
      if (event.data.type === 'PAGE_CONFIG_UPDATE') {
        try {
          console.log('[PageRenderer] Processing PAGE_CONFIG_UPDATE', {
            hasConfig: !!event.data.config,
            sectionsCount: event.data.config?.sections?.length || 0,
            appId,
            pageSlug
          });
          await loadFromMessageUseCase.execute(
            event.data.config,
            appId,
            pageSlug
          );
          console.log('[PageRenderer] PAGE_CONFIG_UPDATE processed successfully');
          
          // Re-apply theme background after page config is loaded
          // This ensures theme background is visible even after page config loads
          window.dispatchEvent(new Event('appConfigLoaded'));
        } catch (error) {
          console.error('[PageRenderer] Failed to process config update from message', error);
        }
      } else if (event.data.type === 'CONFIG_UPDATE') {
        try {
          console.log('[PageRenderer] Received CONFIG_UPDATE', {
            hasConfig: !!event.data.payload?.config,
            hasOfferCards: !!event.data.payload?.offerCards,
            offerCardsCount: event.data.payload?.offerCards?.length || 0,
            selectedOfferCardId: event.data.payload?.selectedOfferCardId,
            topLevelHasSelectionMode: typeof event.data.elementSelectionMode === 'boolean',
            topLevelSelectionMode: event.data.elementSelectionMode
          });

          // 1. Load app-config (this will publish AppConfigLoadedEvent)
          // PageRendererAppConfigLoadedHandler will extract offerCards from config and update presenter
          if (event.data.payload?.config) {
            await loadAppConfigFromMessageUseCase.execute(event.data.payload.config);
          }

          // 2. Determine elementSelectionMode from either:
          //    a) config.elementSelectionMode (preferred)
          //    b) top-level event.data.elementSelectionMode (used by PageConstructorPresenter)
          //    If neither is provided, KEEP current mode (do not force-disable).
          let selectionModeValue: boolean | null = null;

          if (event.data.payload?.config) {
            const configPayload = event.data.payload.config as Record<string, unknown>;
            const rawSelectionMode = (configPayload as { elementSelectionMode?: unknown }).elementSelectionMode;
            if (typeof rawSelectionMode === 'boolean') {
              selectionModeValue = rawSelectionMode;
            } else if (rawSelectionMode !== undefined) {
              selectionModeValue = Boolean(rawSelectionMode);
            }

            console.log('[PageRenderer] Setting elementSelectionMode from CONFIG_UPDATE', {
              elementSelectionMode: selectionModeValue,
              configHasElementSelectionMode: 'elementSelectionMode' in configPayload
            });
          } else if (typeof event.data.elementSelectionMode === 'boolean') {
            selectionModeValue = event.data.elementSelectionMode;
            console.log('[PageRenderer] Setting elementSelectionMode from top-level CONFIG_UPDATE field', {
              elementSelectionMode: selectionModeValue
            });
          }

          if (selectionModeValue !== null) {
            // Apply elementSelectionMode to document.body and window flags
            if (typeof document !== 'undefined' && document.body) {
              if (selectionModeValue) {
                document.body.setAttribute('data-selection-mode', 'true');
              } else {
                document.body.removeAttribute('data-selection-mode');
              }
            }

            if (typeof window !== 'undefined') {
              (window as any).__elementSelectionMode = selectionModeValue;
              window.dispatchEvent(
                new CustomEvent('elementSelectionModeChanged', { detail: { enabled: selectionModeValue } })
              );
            }
          } else {
            console.log('[PageRenderer] CONFIG_UPDATE without elementSelectionMode - keeping current mode');
          }

          // 3. Set selected offer card ID in presenter (offerCards are updated via EventBus handler)
          //    Only set if it's explicitly provided and not null (to avoid showing offer-card when editing pages)
          if (event.data.payload?.selectedOfferCardId !== undefined && event.data.payload?.selectedOfferCardId !== null) {
            console.log('[PageRenderer] Setting selected offer card ID', { cardId: event.data.payload.selectedOfferCardId });
            presenter.setSelectedOfferCardId(event.data.payload.selectedOfferCardId);
          } else {
            // Always clear when null or undefined to prevent showing offer-card when editing pages
            presenter.setSelectedOfferCardId(null);
          }
        } catch (error) {
          console.error('[PageRenderer] Failed to process app config update from message', error);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    console.log('[PageRenderer] Message listener added');
    return () => {
      window.removeEventListener('message', handleMessage);
      console.log('[PageRenderer] Message listener removed');
    };
  }, [previewMode, appId, pageSlug]);

  // Find selected offer card for demo section
  // Use useMemo to ensure it updates when offerCards or selectedOfferCardId changes
  // IMPORTANT: All Hooks must be called before any early returns
  const selectedOfferCard = React.useMemo(() => {
    if (!vm.selectedOfferCardId || vm.offerCards.length === 0) return null;
    const card = vm.offerCards.find(card => card.id === vm.selectedOfferCardId);
    console.log('[PageRenderer] Selected offer card computed', {
      selectedOfferCardId: vm.selectedOfferCardId,
      offerCardsCount: vm.offerCards.length,
      found: !!card,
      buyButtonBg: card?.styles?.buyButton?.backgroundColor
    });
    return card || null;
  }, [vm.selectedOfferCardId, vm.offerCards]);

  // Debug logging
  useEffect(() => {
    if (previewMode) {
      console.log('[PageRenderer] Demo section debug:', {
        previewMode,
        selectedOfferCardId: vm.selectedOfferCardId,
        offerCardsCount: vm.offerCards.length,
        selectedOfferCard: selectedOfferCard ? selectedOfferCard.name : null
      });
    }
  }, [previewMode, vm.selectedOfferCardId, vm.offerCards, selectedOfferCard]);

  // Set styles for demo section when selectedOfferCard or its styles change
  useEffect(() => {
    if (previewMode && selectedOfferCard && typeof window !== 'undefined') {
      // Set styles from selected offer card
      (window as any).__offerCardStyles = {
        styles: selectedOfferCard.styles || {}
      };
      
      // Dispatch event to notify OfferCard components
      window.dispatchEvent(new Event('appConfigLoaded'));
      
      console.log('[PageRenderer] Updated window.__offerCardStyles', {
        cardId: selectedOfferCard.id,
        cardName: selectedOfferCard.name,
        buyButtonBg: selectedOfferCard.styles?.buyButton?.backgroundColor,
        styles: selectedOfferCard.styles
      });
    }
  }, [previewMode, selectedOfferCard, selectedOfferCard?.styles, selectedOfferCard?.id]);

  // Helper function to convert hex color to rgba with opacity
  const getBackgroundColorWithOpacity = (color: string | undefined, opacity: number | undefined): string | undefined => {
    if (!color) return undefined;
    if (opacity === undefined || opacity === 1) return color;
    
    // If color is already rgba/rgb, extract values
    if (color.startsWith('rgba') || color.startsWith('rgb')) {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
      if (match) {
        return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
      }
    }
    
    // Convert hex to rgba
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    // If color is a named color or other format, use opacity on the element
    return color;
  };

  // Early returns AFTER all Hooks
  if (vm.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  if (vm.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">{vm.error}</p>
        </div>
      </div>
    );
  }

  // Generate page element ID for selection
  const pageElementId = `page-${pageSlug}`;

  // Handle click for page element selection
  const handlePageClick = (e: React.MouseEvent<HTMLElement>) => {
    const previewModeValue = isPreviewMode();
    const selectionMode = elementSelectionMode;
    console.log('[PageRenderer] Page click handler check:', { previewMode: previewModeValue, selectionMode, pageSlug, pageElementId });
    
    if (previewModeValue && selectionMode && pageElementId) {
      // Only handle click if the target is the page container itself, not a child element
      const target = e.target as HTMLElement;
      const currentTarget = e.currentTarget as HTMLElement;
      
      // If clicking on a child element with data-element-id, let it handle the click
      if (target !== currentTarget && target.closest('[data-element-id]') !== currentTarget) {
        return;
      }
      
      e.preventDefault();
      e.stopPropagation();
      
      console.log('[PageRenderer] Page clicked in selection mode:', pageElementId);
      
      if (window.parent && window.parent !== window) {
        const builderOrigin = process.env.NEXT_PUBLIC_BUILDER_URL || '*';
        console.log('[PageRenderer] Sending ELEMENT_SELECTED to parent:', {
          elementId: pageElementId,
          origin: builderOrigin
        });
        
        window.parent.postMessage(
          { type: 'ELEMENT_SELECTED', elementId: pageElementId },
          builderOrigin
        );
      }
    }
  };

  // Handle mouse enter for hover effect
  const handlePageMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    const previewModeValue = isPreviewMode();
    const selectionMode = elementSelectionMode;
    
    console.log('[PageRenderer] Mouse enter check:', { 
      previewMode: previewModeValue, 
      selectionMode, 
      pageElementId,
      elementSelectionMode,
      hasWindowFlag: typeof window !== 'undefined' ? (window as any).__elementSelectionMode : false,
      bodyAttribute: typeof document !== 'undefined' && document.body ? document.body.getAttribute('data-selection-mode') : null
    });
    
    if (!previewModeValue || !selectionMode || !pageElementId) {
      console.log('[PageRenderer] Mouse enter conditions not met:', {
        previewMode: previewModeValue,
        selectionMode,
        hasPageElementId: !!pageElementId
      });
      return;
    }
    
    const target = e.currentTarget as HTMLElement;
    const eventTarget = e.target as HTMLElement;
    
    // For page container, be more lenient - only skip if we're directly over a child element with its own data-element-id
    // This allows hover to work when cursor is over padding/margin areas or empty space
    if (eventTarget !== target) {
      const childWithId = eventTarget.closest('[data-element-id]') as HTMLElement;
      // Only skip if we found a child element with data-element-id that is not the page container itself
      if (childWithId && childWithId !== target && childWithId.hasAttribute('data-element-id')) {
        const childId = childWithId.getAttribute('data-element-id');
        if (childId && childId !== pageElementId) {
          console.log('[PageRenderer] Skipping hover - child element has data-element-id:', childId);
          return;
        }
      }
    }
    
    console.log('[PageRenderer] Mouse enter on page - applying styles:', pageElementId);
    setIsHovered(true);
    
    // Apply box-shadow directly to DOM element for immediate feedback (doesn't affect layout)
    if (!target.classList.contains('preview-hover')) {
      target.classList.add('preview-hover');
    }
    target.style.setProperty('cursor', 'pointer', 'important');
    // Use box-shadow instead of outline to avoid layout shifts
    target.style.setProperty('box-shadow', '0 0 0 2px #3b82f6', 'important');
    target.style.setProperty('position', 'relative', 'important');
    
    console.log('[PageRenderer] Applied box-shadow styles to page:', {
      boxShadow: target.style.boxShadow,
      cursor: target.style.cursor,
      hasClass: target.classList.contains('preview-hover'),
      computedBoxShadow: window.getComputedStyle(target).boxShadow,
      computedCursor: window.getComputedStyle(target).cursor
    });
  };

  // Handle mouse leave for hover effect
  const handlePageMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const previewModeValue = isPreviewMode();
    const selectionMode = elementSelectionMode;
    
    if (previewModeValue && selectionMode && pageElementId) {
      console.log('[PageRenderer] Mouse leave on page:', pageElementId);
      setIsHovered(false);
      
      const target = e.currentTarget as HTMLElement;
      target.classList.remove('preview-hover');
      target.style.removeProperty('cursor');
      target.style.removeProperty('box-shadow');
      
      console.log('[PageRenderer] Removed box-shadow styles from page:', pageElementId);
    }
  };

  // For /store page, always render ProductsList
  if (pageSlug === 'store') {
    console.log('[PageRenderer] Rendering /store page with ProductsList', {
      sectionsCount: vm.sections.length,
      isLoading: vm.isLoading,
      previewMode
    });

    const pageStyle: React.CSSProperties = {
      padding: vm.pageStyles?.padding || undefined,
      gap: vm.pageStyles?.gap || undefined,
      display: vm.pageStyles?.gap ? 'flex' : undefined,
      flexDirection: vm.pageStyles?.gap ? 'column' : undefined,
      backgroundColor: getBackgroundColorWithOpacity(
        vm.pageStyles?.backgroundColor,
        vm.pageStyles?.backgroundOpacity
      ) || undefined,
      // Add box-shadow for hover in selection mode (doesn't affect layout)
      ...(isPreviewMode() && elementSelectionMode && isHovered ? {
        boxShadow: '0 0 0 2px #3b82f6',
        position: 'relative' as const,
      } : {}),
    };

    console.log('[PageRenderer] Rendering /store page sections:', { 
      sectionsCount: vm.sections.length, 
      sections: vm.sections.map(s => ({ id: s.id, type: s.type, componentsCount: s.components.length }))
    });
    
    return (
      <div 
        className="page-renderer min-h-screen" 
        style={pageStyle}
        data-element-id={pageElementId}
        onClick={handlePageClick}
        onMouseEnter={handlePageMouseEnter}
        onMouseLeave={handlePageMouseLeave}
      >
        {/* Render configured sections if available */}
        {vm.sections.length > 0 && vm.sections.map(section => {
          console.log('[PageRenderer] Rendering section:', section.id);
          return (
            <SectionRenderer
              key={section.id}
              section={section}
              theme={theme}
              actionContext={actionContext}
            />
          );
        })}
        
        {/* Always render ProductsList on /store page */}
        <ProductsList />
      </div>
    );
  }

  // For other pages, render sections if available
  // If no sections, still render empty container (for preview mode)
  // This allows elements to be selected even if no sections exist

  const pageStyle: React.CSSProperties = {
    padding: vm.pageStyles?.padding || undefined,
    gap: vm.pageStyles?.gap || undefined,
    display: vm.pageStyles?.gap ? 'flex' : undefined,
    flexDirection: vm.pageStyles?.gap ? 'column' : undefined,
    backgroundColor: getBackgroundColorWithOpacity(
      vm.pageStyles?.backgroundColor,
      vm.pageStyles?.backgroundOpacity
    ) || undefined,
    // Add box-shadow for hover in selection mode (doesn't affect layout)
    ...(isPreviewMode() && elementSelectionMode && isHovered ? {
      boxShadow: '0 0 0 2px #3b82f6',
      position: 'relative' as const,
    } : {}),
  };

  return (
    <div 
      className="page-renderer min-h-screen" 
      style={pageStyle}
      data-element-id={pageElementId}
      onClick={handlePageClick}
      onMouseEnter={handlePageMouseEnter}
      onMouseLeave={handlePageMouseLeave}
    >
      {/* Demo section for selected offer card (only when explicitly requested via URL param) */}
      {(() => {
        if (typeof window === 'undefined') return false;
        const params = new URLSearchParams(window.location.search);
        const showOfferCard = params.get('showOfferCard') === 'true';
        return previewMode && showOfferCard && selectedOfferCard;
      })() && selectedOfferCard && (
        <div key="offer-card-demo-section" className="offer-card-demo-section" style={{ padding: '20px', marginBottom: '20px' }}>
          <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 'bold' }}>
            Offer Card Preview: {selectedOfferCard.name}
          </h2>
          <div style={{ maxWidth: '400px' }}>
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
      
      {vm.sections.map(section => (
        <SectionRenderer
          key={section.id}
          section={section}
          theme={theme}
          actionContext={actionContext}
        />
      ))}
    </div>
  );
}

