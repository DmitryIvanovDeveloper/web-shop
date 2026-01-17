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
import { selectionOverlay } from '../../../../../infrastructure/services/ui-renderer/selection-overlay.service';

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
  const router = useRouter();
  const [vm, setVm] = useState<PageRendererViewModel>({
    sections: [],
    isLoading: true,
    error: null,
    selectedElementId: null,
    selectedOfferCardId: null,
    offerCards: []
  });
  
  const actionContext = {
    navigate: (url: string) => {
      router.push(url);
    }
  };

  const [isHovered, setIsHovered] = useState(false);
  const [elementSelectionMode, setElementSelectionMode] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const selectedElementIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleModeChange = (event: CustomEvent) => {
      const enabled = event.detail?.enabled ?? false;
      setElementSelectionMode(enabled);
    };

    const initialMode = readSelectionModeFlag();
    setElementSelectionMode(initialMode);

    const checkInterval = setInterval(() => {
      const currentMode = readSelectionModeFlag();
      setElementSelectionMode((prevMode) => {
        if (currentMode !== prevMode) {
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

    const unsubscribe = presenter.subscribe((newVm) => {
      setVm((prev) => {
        const selId = selectedElementIdRef.current;

        if (!selId) {
          return { ...newVm, selectedElementId: null };
        }

        const pageStyles =
          !selId || newVm.pageId === selId ? newVm.pageStyles : prev.pageStyles;

        const sections = newVm.sections.map((sec) => {
          const matchesSection = sec.id === selId;
          const matchesComponent = sec.components?.some((c) => c.id === selId);
          if (matchesSection || matchesComponent) {
            return sec;
          }
          const prevSec = prev.sections.find((s) => s.id === sec.id);
          return prevSec ?? sec;
        });

        return {
          ...newVm,
          sections,
          pageStyles,
          selectedElementId: selId
        };
      });
    });

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

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.querySelectorAll('[data-element-id]').forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.classList.remove('preview-selected');
      htmlEl.style.removeProperty('box-shadow');
    });

    if (!selectedElementId) {
      selectionOverlay.hide();
      return;
    }

    const timeoutId = setTimeout(() => {
      const targetElement = document.querySelector(
        `[data-element-id="${selectedElementId}"]`
      ) as HTMLElement | null;

      if (!targetElement) {
        selectionOverlay.hide();
        return;
      }

      const rect = targetElement.getBoundingClientRect();
      selectionOverlay.show({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      }, selectedElementId, true);
    }, 50);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [selectedElementId, pageSlug]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlPreviewMode = urlParams.get('previewMode') === 'true' || urlParams.get('uibuilder') === 'true';
    const effectivePreviewMode = previewMode || urlPreviewMode;
    
    if (!effectivePreviewMode) {
      return;
    }
    const presenter = container.get<PageRendererPresenter>(PAGE_RENDERER_TYPES.PageRendererPresenter);
    const loadFromMessageUseCase = container.get<LoadPageConfigFromMessageUseCase>(
      PAGE_RENDERER_TYPES.LoadPageConfigFromMessageUseCase
    );
    const loadAppConfigFromMessageUseCase = container.get<LoadAppConfigFromMessageUseCase>(
      TYPES.LoadAppConfigFromMessage
    );

    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === 'SELECT_ELEMENT') {
        const elementId = event.data.payload?.elementId || null;
        setSelectedElementId(elementId);
        return;
      }
      
      if (event.data.type === 'CLICK_BUTTON') {
        try {
          const { buttonId, temporarilyDisableSelectionMode } = event.data;
          
          const buttonElement = document.querySelector(`[data-element-id="${buttonId}"]`) as HTMLElement;
          if (!buttonElement) {
            return;
          }

          let wasSelectionModeActive = false;
          if (temporarilyDisableSelectionMode) {
            wasSelectionModeActive = document.body.getAttribute('data-selection-mode') === 'true';
            if (wasSelectionModeActive) {
              document.body.removeAttribute('data-selection-mode');
              (window as any).__elementSelectionMode = false;
              window.dispatchEvent(new CustomEvent('elementSelectionModeChanged', { detail: { enabled: false } }));
            }
          }

          try {
            buttonElement.click();
            
            const clickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window,
            });
            buttonElement.dispatchEvent(clickEvent);
          } catch (error) {
          } finally {
            if (wasSelectionModeActive) {
              setTimeout(() => {
                document.body.setAttribute('data-selection-mode', 'true');
                (window as any).__elementSelectionMode = true;
                window.dispatchEvent(new CustomEvent('elementSelectionModeChanged', { detail: { enabled: true } }));
              }, 100);
            }
          }
        } catch (error) {
        }
        return;
      }
      
      if (event.data.type === 'PAGE_CONFIG_UPDATE') {
        try {
          await loadFromMessageUseCase.execute(
            event.data.config,
            appId,
            pageSlug
          );
          
          window.dispatchEvent(new Event('appConfigLoaded'));
        } catch (error) {
        }
      } else if (event.data.type === 'CONFIG_UPDATE') {
        try {
          if (event.data.payload?.selectedElementId !== undefined) {
            const selId = event.data.payload.selectedElementId || null;
            setSelectedElementId(selId);
            selectedElementIdRef.current = selId;
          }

          if (event.data.payload?.config) {
            await loadAppConfigFromMessageUseCase.execute(event.data.payload.config);
          }

          let selectionModeValue: boolean | null = null;

          if (event.data.payload?.config) {
            const configPayload = event.data.payload.config as Record<string, unknown>;
            const rawSelectionMode = (configPayload as { elementSelectionMode?: unknown }).elementSelectionMode;
            if (typeof rawSelectionMode === 'boolean') {
              selectionModeValue = rawSelectionMode;
            } else if (rawSelectionMode !== undefined) {
              selectionModeValue = Boolean(rawSelectionMode);
            }
          } else if (typeof event.data.elementSelectionMode === 'boolean') {
            selectionModeValue = event.data.elementSelectionMode;
          }

          if (selectionModeValue !== null) {
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
          }

          if (event.data.payload?.selectedOfferCardId !== undefined && event.data.payload?.selectedOfferCardId !== null) {
            presenter.setSelectedOfferCardId(event.data.payload.selectedOfferCardId);
          } else {
            presenter.setSelectedOfferCardId(null);
          }
        } catch (error) {
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [previewMode, appId, pageSlug]);

  const selectedOfferCard = React.useMemo(() => {
    if (!vm.selectedOfferCardId || vm.offerCards.length === 0) return null;
    const card = vm.offerCards.find(card => card.id === vm.selectedOfferCardId);
    return card || null;
  }, [vm.selectedOfferCardId, vm.offerCards]);

  useEffect(() => {
    if (previewMode && selectedOfferCard && typeof window !== 'undefined') {
      (window as any).__offerCardStyles = {
        styles: selectedOfferCard.styles || {}
      };
      
      window.dispatchEvent(new Event('appConfigLoaded'));
    }
  }, [previewMode, selectedOfferCard, selectedOfferCard?.styles, selectedOfferCard?.id]);
  const getBackgroundColorWithOpacity = (color: string | undefined, opacity: number | undefined): string | undefined => {
    if (!color) return undefined;
    if (opacity === undefined || opacity === 1) return color;
    
    if (color.startsWith('rgba') || color.startsWith('rgb')) {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
      if (match) {
        return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
      }
    }
    
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    return color;
  };

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

  const pageElementId = vm.pageId ?? `page-${pageSlug}`;

  const handlePageClick = (e: React.MouseEvent<HTMLElement>) => {
    const previewModeValue = isPreviewMode();
    const selectionMode = elementSelectionMode;
    
    if (previewModeValue && selectionMode && pageElementId) {
      const target = e.target as HTMLElement;
      const currentTarget = e.currentTarget as HTMLElement;
      
      if (target !== currentTarget && target.closest('[data-element-id]') !== currentTarget) {
        return;
      }
      
      e.preventDefault();
      e.stopPropagation();
      
      if (window.parent && window.parent !== window) {
        const builderOrigin = process.env.NEXT_PUBLIC_BUILDER_URL || '*';
        
        window.parent.postMessage(
          { type: 'ELEMENT_SELECTED', elementId: pageElementId },
          builderOrigin
        );
      }
    }
  };

  const handlePageMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    const previewModeValue = isPreviewMode();
    const selectionMode = elementSelectionMode;
    
    if (!previewModeValue || !selectionMode || !pageElementId) {
      return;
    }
    
    if (typeof document !== 'undefined') {
      const sidebarElements = document.querySelectorAll<HTMLElement>('[data-element-id*="sidebar"]');
      const hasVisibleSidebar = Array.from(sidebarElements).some((el) => {
        const rect = el.getBoundingClientRect();
        const isVisible =
          rect.width > 0 &&
          rect.height > 0 &&
          rect.bottom > 0 &&
          rect.right > 0 &&
          rect.left < window.innerWidth &&
          rect.top < window.innerHeight &&
          window.getComputedStyle(el).display !== 'none' &&
          window.getComputedStyle(el).visibility !== 'hidden';
        return isVisible;
      });

      if (hasVisibleSidebar) {
        return;
      }
    }
    
    const target = e.currentTarget as HTMLElement;
    const eventTarget = e.target as HTMLElement;
    
    if (eventTarget !== target) {
      const childWithId = eventTarget.closest('[data-element-id]') as HTMLElement;
      if (childWithId && childWithId !== target && childWithId.hasAttribute('data-element-id')) {
        const childId = childWithId.getAttribute('data-element-id');
        if (childId && childId !== pageElementId) {
          return;
        }
      }
    }
    
    if (typeof document !== 'undefined') {
      const hoveredChild = document.querySelector('[data-element-id].preview-hover') as HTMLElement;
      if (hoveredChild && hoveredChild !== target && target.contains(hoveredChild)) {
        const hoveredChildId = hoveredChild.getAttribute('data-element-id');
        if (hoveredChildId && hoveredChildId !== pageElementId) {
          return;
        }
      }
    }
    
    setIsHovered(true);
    
    if (typeof document !== 'undefined') {
      const childElements = target.querySelectorAll('[data-element-id]');
      childElements.forEach((child) => {
        const childEl = child as HTMLElement;
        if (childEl !== target && childEl.hasAttribute('data-element-id')) {
          const childId = childEl.getAttribute('data-element-id');
          if (childId && childId !== pageElementId) {
            selectionOverlay.hide(childId);
            childEl.classList.remove('preview-hover');
          }
        }
      });
    }
    
    if (!target.classList.contains('preview-hover')) {
      target.classList.add('preview-hover');
    }
    target.style.setProperty('cursor', 'pointer', 'important');
    
    const isSelected = selectedElementId === pageElementId;
    if (!isSelected) {
      const rect = target.getBoundingClientRect();
      selectionOverlay.show({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      }, pageElementId, false);
    }
  };

  const handlePageMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const previewModeValue = isPreviewMode();
    const selectionMode = elementSelectionMode;
    
    if (previewModeValue && selectionMode && pageElementId) {
      setIsHovered(false);
      
      const target = e.currentTarget as HTMLElement;
      target.classList.remove('preview-hover');
      target.style.removeProperty('cursor');
      
      const isSelected = selectedElementId === pageElementId;
      if (!isSelected) {
        selectionOverlay.hide(pageElementId);
      }
    }
  };

  if (pageSlug === 'store') {
    const pageStyle: React.CSSProperties = {
      padding: vm.pageStyles?.padding || undefined,
      gap: vm.pageStyles?.gap || undefined,
      display: vm.pageStyles?.gap ? 'flex' : undefined,
      flexDirection: vm.pageStyles?.gap ? 'column' : undefined,
      backgroundColor: getBackgroundColorWithOpacity(
        vm.pageStyles?.backgroundColor,
        vm.pageStyles?.backgroundOpacity
      ) || undefined,
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
        {vm.sections.length > 0 && vm.sections.map(section => {
          return (
            <SectionRenderer
              key={section.id}
              section={section}
              theme={theme}
            />
          );
        })}
        
        <ProductsList />
      </div>
    );
  }

  const pageStyle: React.CSSProperties = {
    padding: vm.pageStyles?.padding || undefined,
    gap: vm.pageStyles?.gap || undefined,
    display: vm.pageStyles?.gap ? 'flex' : undefined,
    flexDirection: vm.pageStyles?.gap ? 'column' : undefined,
    backgroundColor: getBackgroundColorWithOpacity(
      vm.pageStyles?.backgroundColor,
      vm.pageStyles?.backgroundOpacity
    ) || undefined,
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
        />
      ))}
    </div>
  );
}
