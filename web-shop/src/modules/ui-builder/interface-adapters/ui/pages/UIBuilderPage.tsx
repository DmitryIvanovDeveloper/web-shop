'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { BackgroundEditor } from '../components/BackgroundEditor';
import { ElementTreeSelector } from '../components/ElementTreeSelector';
import { SidebarColorEditor } from '../components/SidebarColorEditor';
import { AuthEditor } from '../components/AuthEditor';
import { PageConstructor } from '../components/PageConstructor';
import { OfferCardsManager } from '../components/OfferCardsManager';
import { OfferCardEditor } from '../components/OfferCardEditor';
import { PhoneMockup, type DeviceType, type Orientation } from '../components/PhoneMockup';
import { DeviceControls } from '../components/DeviceControls';
import { FullscreenPreview } from '../components/FullscreenPreview';
import { Tabs, type Tab } from '../components/Tabs';
import { SlideOutSidebar } from '../components/SlideOutSidebar';
import { SectionPalette } from '../components/SectionPalette';
import type { SidebarElement } from '../../../domain/types/sidebar-element.types';
import type { AppConfigStructure } from '../../../domain/entities/app-config.entity';
import type { PageConstructorPresenter } from '../../presenters/page-constructor.presenter';
import { env } from '@/env';
import { container } from '@/infrastructure/bootstrap/container';
import { UI_BUILDER_TYPES } from '../../../infrastructure/bootstrap/types';

interface UIBuilderPageProps {
  presenter: any; // Will be typed properly when presenter hook is created
  appId: string;
}

export function UIBuilderPage({ presenter, appId }: UIBuilderPageProps): JSX.Element {
  const [viewModel, setViewModel] = useState(presenter.getViewModel());
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const rightSidebarRef = useRef<HTMLElement>(null);
  const [viewportMode, setViewportMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [device, setDevice] = useState<DeviceType>('iphone-15-pro');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const clientUrl = env.NEXT_PUBLIC_CLIENT_URL;
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  const [activeSection, setActiveSection] = useState<'background' | 'sidebar' | 'rightSidebar' | 'authButton' | 'authPopup' | 'pageConstructor' | 'offerCards'>('sidebar');
  const [activeTab, setActiveTab] = useState<string>('leftSidebar');
  const [isSlideOutSidebarOpen, setIsSlideOutSidebarOpen] = useState(false);
  const [isElementSelectionMode, setIsElementSelectionMode] = useState(
    () => (typeof presenter.getElementSelectionMode === 'function' ? presenter.getElementSelectionMode() : false)
  );
  const ensuredSectionsRef = useRef<Set<'sidebar' | 'rightSidebar'>>(new Set());

  // Auto-switch tab based on activeSection
  useEffect(() => {
    if (activeSection === 'background') {
      setActiveTab('theme');
    } else if (activeSection === 'sidebar') {
      setActiveTab('leftSidebar');
    } else if (activeSection === 'rightSidebar') {
      setActiveTab('rightSidebar');
    } else if (activeSection === 'authButton' || activeSection === 'authPopup') {
      setActiveTab('authentication');
    } else if (activeSection === 'pageConstructor') {
      setActiveTab('pages');
    } else if (activeSection === 'offerCards') {
      setActiveTab('offerCards');
    }
  }, [activeSection]);
  
  // Get pageSlug from URL or default to 'home'
  const getPageSlugFromUrl = (): string => {
    if (typeof window === 'undefined') return 'home';
    const params = new URLSearchParams(window.location.search);
    return params.get('pageSlug') || 'home';
  };
  
  const [selectedPageSlug, setSelectedPageSlug] = useState<string>(getPageSlugFromUrl());
  
  // Update selectedPageSlug when URL changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pageSlug = params.get('pageSlug') || 'home';
      setSelectedPageSlug(pageSlug);
    }
  }, []);
  
  // Get PageConstructorPresenter from DI container
  const pageConstructorPresenter = React.useMemo(() => {
    return container.get<PageConstructorPresenter>(UI_BUILDER_TYPES.PageConstructorPresenter);
  }, []);

  // Offer Cards state
  const [offerCards, setOfferCards] = useState(pageConstructorPresenter.getOfferCards());
  const [selectedOfferCardId, setSelectedOfferCardId] = useState<string | null>(pageConstructorPresenter.getSelectedOfferCardId());

  // Initialize pageConstructorPresenter and load offer cards
  useEffect(() => {
    const initializeOfferCards = async () => {
      await pageConstructorPresenter.initialize(appId, selectedPageSlug);
      setOfferCards(pageConstructorPresenter.getOfferCards());
      setSelectedOfferCardId(pageConstructorPresenter.getSelectedOfferCardId());
    };
    initializeOfferCards();
  }, [appId, selectedPageSlug, pageConstructorPresenter]);

  // Update offer cards periodically
  useEffect(() => {
    const updateOfferCards = () => {
      setOfferCards(pageConstructorPresenter.getOfferCards());
      setSelectedOfferCardId(pageConstructorPresenter.getSelectedOfferCardId());
    };
    const interval = setInterval(updateOfferCards, 500);
    return () => clearInterval(interval);
  }, [pageConstructorPresenter]);

  // Calculate iframe src based on active section
  const iframeSrc = React.useMemo(() => {
    if (!clientUrl) return null;
    if (activeSection === 'pageConstructor') {
      return `${clientUrl}/${selectedPageSlug}?appId=${appId}&previewMode=true&uibuilder=true`;
    }
    return `${clientUrl}/?appId=${appId}&previewMode=true&uibuilder=true`;
  }, [activeSection, appId, clientUrl, selectedPageSlug]);

  // Callback to set iframe ref when PhoneMockup mounts
  const handleIframeRef = useCallback((el: HTMLIFrameElement | null) => {
    if (el) {
      (iframeRef as React.MutableRefObject<HTMLIFrameElement | null>).current = el;
      const previewComm = presenter.getPreviewCommunication();
      if (previewComm && previewComm.setIframeRef) {
        console.log('[UIBuilderPage] Calling setIframeRef with ref:', el);
        previewComm.setIframeRef(el);
      }
    }
  }, [presenter]);

  useEffect(() => {
    const unsubscribe = presenter.subscribe((vm: any) => {
      console.log('[UIBuilderPage] ViewModel updated:', {
        selectedElement: vm.selectedElement,
        activeSection
      });
      setViewModel(vm);
      if (typeof vm.elementSelectionMode === 'boolean') {
        setIsElementSelectionMode(vm.elementSelectionMode);
      }
    });

    return unsubscribe;
  }, [presenter, activeSection]);

  useEffect(() => {
    const config = viewModel.config as AppConfigStructure | null;
    pageConstructorPresenter.updateAppConfigSnapshot(config);
  }, [viewModel.config, pageConstructorPresenter]);

  useEffect(() => {
    ensuredSectionsRef.current.clear();
  }, [viewModel.config]);

  // Send viewport mode update to iframe when device or orientation changes
  useEffect(() => {
    if (!iframeRef.current?.contentWindow || !isClient) return;
    
    // Map device to viewport mode for backward compatibility
    const deviceToViewportMode = (deviceType: DeviceType): 'mobile' | 'tablet' | 'desktop' => {
      if (deviceType === 'ipad') return 'tablet';
      return 'mobile';
    };

    const sendViewportModeUpdate = () => {
      try {
        const iframeWindow = iframeRef.current?.contentWindow;
        if (iframeWindow) {
          const clientUrl = env.NEXT_PUBLIC_CLIENT_URL;
          if (clientUrl && iframeWindow.postMessage) {
            const mappedViewportMode = deviceToViewportMode(device);
            iframeWindow.postMessage(
              {
                type: 'VIEWPORT_MODE_UPDATE',
                payload: { viewportMode: mappedViewportMode },
              },
              clientUrl
            );
            console.log('[UIBuilderPage] Sent VIEWPORT_MODE_UPDATE:', mappedViewportMode);
          }
        }
      } catch (error) {
        console.error('[UIBuilderPage] Failed to send VIEWPORT_MODE_UPDATE:', error);
      }
    };

    // Send immediately when device or orientation changes
    sendViewportModeUpdate();

    // Also send after a short delay to ensure iframe is ready
    const timeoutId = setTimeout(sendViewportModeUpdate, 500);

    return () => clearTimeout(timeoutId);
  }, [device, orientation, isClient]);

  // Initialize and load full config from Supabase on mount
  useEffect(() => {
    presenter.initialize(appId);
    presenter.loadPages();
  }, [presenter, appId]);

  useEffect(() => {
    if (!viewModel.config) {
      return;
    }

    (['sidebar', 'rightSidebar'] as const).forEach(section => {
      const config = viewModel.config as any;
      const hasLayout = config?.modules?.uiRenderer?.[section]?.layout;
      if (!hasLayout && !ensuredSectionsRef.current.has(section)) {
        const rootId = presenter.ensureSidebarLayout(section);
        ensuredSectionsRef.current.add(section);

        if (section === 'rightSidebar' && activeSection === 'rightSidebar' && rootId) {
          presenter.selectElement(rootId);
        }
      }
    });
  }, [viewModel.config, presenter, activeSection]);

  const handleThemeChange = (colors: Record<string, string>) => {
    presenter.updateTheme(colors);
  };

  const handleSaveDraft = async () => {
    const success = await presenter.saveDraft();
    if (success) {
      alert('Draft saved successfully!');
    } else if (viewModel.error) {
      alert(`Failed to save draft: ${viewModel.error}`);
    }
  };

  const handlePublish = async () => {
    // Confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to publish these changes? This will update the live configuration for all users.'
    );

    if (!confirmed) return;

    const success = await presenter.publishDraft();
    if (success) {
      alert('Configuration published successfully!');
    } else if (viewModel.error) {
      alert(`Failed to publish: ${viewModel.error}`);
    }
  };

  const handleSidebarElementSelect = (elementId: string | null, section: 'sidebar' | 'rightSidebar') => {
    console.log('[UIBuilderPage] handleElementSelect called:', { elementId, section, selectedOfferCardId, activeSection });
    const ensuredRootId = presenter.ensureSidebarLayout(section);
    let normalizedId = elementId || '';

    if (!normalizedId && viewModel.config) {
      normalizedId = ensuredRootId || '';
      if (!normalizedId) {
        const config = viewModel.config as any;
        const rootNode = config?.modules?.uiRenderer?.[section]?.layout;
        if (rootNode?.id) {
          normalizedId = rootNode.id as string;
        }
      }
    }
 
    if (normalizedId && selectedOfferCardId) {
      console.log('[UIBuilderPage] Clearing selectedOfferCardId:', selectedOfferCardId);
      pageConstructorPresenter.selectOfferCard(null);
      setSelectedOfferCardId(null);
    }

    if (activeSection !== section) {
      console.log('[UIBuilderPage] Setting activeSection:', section);
      setActiveSection(section);
    }

    // Auto-switch to corresponding tab
    if (section === 'sidebar') {
      console.log('[UIBuilderPage] Setting activeTab to leftSidebar');
      setActiveTab('leftSidebar');
    } else if (section === 'rightSidebar') {
      console.log('[UIBuilderPage] Setting activeTab to rightSidebar');
      setActiveTab('rightSidebar');
    }

    console.log('[UIBuilderPage] Calling presenter.selectElement:', normalizedId);
    presenter.selectElement(normalizedId);
  };

  // Force re-render when selectedElement changes
  useEffect(() => {
    // This effect ensures UI updates when selectedElement changes
    // even if activeSection doesn't change
  }, [viewModel.selectedElement?.id]);

  const handleElementColorChange = (elementId: string, colors: Record<string, string>) => {
    presenter.updateElementColors(elementId, colors);
  };

  // Extract sidebar elements from config
  const extractSidebarElements = (layoutKey: 'sidebar' | 'rightSidebar'): SidebarElement[] => {
    if (!viewModel.config) return [];

    const config = viewModel.config as any;
    const sidebarConfig = config?.modules?.uiRenderer?.[layoutKey];

    if (!sidebarConfig?.layout) return [];

    const convertToSidebarElement = (node: any): SidebarElement => {
      return {
        id: node.id,
        name: node.props?.text || node.id,
        type: node.type || 'Unknown',
        label: node.props?.text || node.id,
        colors: {
          backgroundColor: node.styles?.backgroundColor,
          textColor: node.styles?.textColor,
          borderColor: node.styles?.borderColor,
        },
        children: node.children?.map(convertToSidebarElement) || [],
      };
    };

    return [convertToSidebarElement(sidebarConfig.layout)];
  };

  // Helper: read element colors from current config
  const getElementColorsFromConfig = (elementId: string): Record<string, string> | null => {
    if (!viewModel.config) return null;
    const config = viewModel.config as any;
    const sidebarConfig = config?.modules?.uiRenderer?.sidebar;
    if (!sidebarConfig?.layout) return null;

    const find = (node: any): any | null => {
      if (node.id === elementId) return node;
      if (Array.isArray(node.children)) {
        for (const c of node.children) {
          const f = find(c);
          if (f) return f;
        }
      }
      return null;
    };

    const node = find(sidebarConfig.layout);
    if (!node) return null;
    const s = node.styles || {};
    const colors: Record<string, string> = {};
    if (s.backgroundColor) colors.background = s.backgroundColor;
    if (s.textColor) colors.textColor = s.textColor;
    if (s.borderColor) colors.borderColor = s.borderColor;
    return colors;
  };

  // Setup element selection listener from preview
  useEffect(() => {
    const previewComm = presenter.getPreviewCommunication();
    if (previewComm && previewComm.onElementSelected) {
      previewComm.onElementSelected((elementId: string | null) => {
        if (!elementId) {
          // Clear selection
          presenter.selectElement(null);
          pageConstructorPresenter.selectSection(null);
          pageConstructorPresenter.selectComponent(null, null);
          return;
        }

        console.log('[UIBuilderPage] Element selected from iframe:', { elementId });
        
        // Find the area where the element is located (using UUID ID directly)
        const area = presenter.findElementArea(elementId, pageConstructorPresenter);
        console.log('[UIBuilderPage] Element area determined:', { elementId, area });
        
        // Debug: log page sections structure when area is null
        if (!area && pageConstructorPresenter) {
          const pageVm = pageConstructorPresenter.getViewModel();
          console.log('[UIBuilderPage] Element not found, checking page sections:', {
            elementId,
            sectionsCount: pageVm?.sections?.length,
            sections: pageVm?.sections?.map(s => ({
              id: s.id,
              type: s.type,
              componentsCount: s.components?.length,
              componentIds: s.components?.map(c => c.id)
            }))
          });
          
          // Also log sidebar structure for debugging
          const config = viewModel.config as any;
          const sidebarLayout = config?.modules?.uiRenderer?.sidebar?.layout;
          if (sidebarLayout) {
            const collectIds = (node: any, depth: number = 0): any[] => {
              if (!node) return [];
              const result: any[] = [{ id: node.id, type: node.type, text: node.props?.text, depth }];
              if (Array.isArray(node.children)) {
                node.children.forEach((child: any) => {
                  result.push(...collectIds(child, depth + 1));
                });
              }
              return result;
            };
            console.log('[UIBuilderPage] Sidebar layout structure:', {
              layoutId: sidebarLayout.id,
              children: collectIds(sidebarLayout)
            });
          }
        }
        
        // Debug: log page sections structure
        if (pageConstructorPresenter) {
          const pageVm = pageConstructorPresenter.getViewModel();
          console.log('[UIBuilderPage] Page sections structure:', {
            sectionsCount: pageVm?.sections?.length,
            sections: pageVm?.sections?.map(s => ({
              id: s.id,
              type: s.type,
              hasLayout: !!s.layout,
              layoutGrid: s.layout?.grid,
              componentsCount: s.components?.length
            }))
          });
        }

        if (area === 'sidebar') {
          // Clear offer card selection first to ensure editor switches
          setSelectedOfferCardId((prev) => {
            if (prev) {
              pageConstructorPresenter.selectOfferCard(null);
              return null;
            }
            return prev;
          });
          handleSidebarElementSelect(elementId, 'sidebar');
        } else if (area === 'rightSidebar') {
          // Clear offer card selection first to ensure editor switches
          setSelectedOfferCardId((prev) => {
            if (prev) {
              pageConstructorPresenter.selectOfferCard(null);
              return null;
            }
            return prev;
          });
          handleSidebarElementSelect(elementId, 'rightSidebar');
        } else if (area === 'offerCard') {
          // Extract offer card ID from elementId (e.g., "offer-card-123" or just use elementId)
          const offerCardId = elementId.startsWith('offer-card-') ? elementId : elementId;
          
          // Switch to Offer Cards tab
          setActiveTab('offerCards');
          setActiveSection('offerCards');
          
          // Select the offer card
          pageConstructorPresenter.selectOfferCard(offerCardId);
          setSelectedOfferCardId(offerCardId);
          
          // Clear sidebar selection if any
          presenter.selectElement(null);
        } else if (area === 'authButton') {
          // Switch to Authentication tab
          setActiveTab('authentication');
          setActiveSection('authButton');
          
          // Clear other selections
          presenter.selectElement(null);
          pageConstructorPresenter.selectSection(null);
          pageConstructorPresenter.selectComponent(null, null);
          if (selectedOfferCardId) {
            pageConstructorPresenter.selectOfferCard(null);
            setSelectedOfferCardId(null);
          }
        } else if (area === 'authPopup') {
          // Switch to Authentication tab
          setActiveTab('authentication');
          setActiveSection('authPopup');
          
          // Clear other selections
          presenter.selectElement(null);
          pageConstructorPresenter.selectSection(null);
          pageConstructorPresenter.selectComponent(null, null);
          if (selectedOfferCardId) {
            pageConstructorPresenter.selectOfferCard(null);
            setSelectedOfferCardId(null);
          }
        } else if (area === 'page') {
          // Check if elementId is a page container (page-{pageSlug})
          if (elementId.startsWith('page-')) {
            const pageSlug = elementId.replace('page-', '');
            console.log('[UIBuilderPage] Page container selected:', { elementId, pageSlug });
            
            // Switch to Pages tab and open page editor
            setActiveTab('pages');
            setActiveSection('pageConstructor');
            
            // Clear other selections
            presenter.selectElement(null);
            pageConstructorPresenter.selectOfferCard(null);
            setSelectedOfferCardId(null);
            
            // Clear section/component selection to show page-level editor
            pageConstructorPresenter.selectSection(null);
            pageConstructorPresenter.selectComponent(null, null);
            
            return;
          }
          
          // Find which section contains this element
          const pageVm = pageConstructorPresenter.getViewModel();
          let foundSectionId: string | null = null;
          let foundComponentId: string | null = null;

          console.log('[UIBuilderPage] Searching for element in page sections:', { elementId, sectionsCount: pageVm?.sections?.length });

          if (pageVm?.sections) {
            // First check if elementId matches a section ID
            for (const section of pageVm.sections) {
              if (section.id === elementId) {
                foundSectionId = section.id;
                foundComponentId = null; // Selecting the section itself
                console.log('[UIBuilderPage] Found element as section:', { elementId, sectionId: section.id });
                break;
              }
            }

            // If not found as section, search in components
            if (!foundSectionId) {
              for (const section of pageVm.sections) {
                // Search directly in section.components array
                const foundComponent = section.components.find(comp => comp.id === elementId);
                if (foundComponent) {
                  foundSectionId = section.id;
                  foundComponentId = foundComponent.id;
                  console.log('[UIBuilderPage] Found element in section components:', { elementId, sectionId: section.id, componentId: foundComponent.id });
                  break;
                }
              }
            }
          }

          if (foundSectionId) {
            console.log('[UIBuilderPage] Opening page editor:', { foundSectionId, foundComponentId });
            // Switch to Pages tab
            setActiveTab('pages');
            setActiveSection('pageConstructor');
            
            // Clear other selections
            presenter.selectElement(null);
            pageConstructorPresenter.selectOfferCard(null);
            setSelectedOfferCardId(null);
            
            // Select the section and component
            pageConstructorPresenter.selectSection(foundSectionId);
            if (foundComponentId && foundComponentId !== foundSectionId) {
              pageConstructorPresenter.selectComponent(foundSectionId, foundComponentId);
            } else {
              pageConstructorPresenter.selectComponent(foundSectionId, null);
            }
          } else {
            console.warn('[UIBuilderPage] Element found in page area but section not found:', elementId);
          }
        } else {
          console.warn('[UIBuilderPage] Element not found in any area:', elementId);
        }
      });
    }
  }, [presenter, pageConstructorPresenter]);

  // Send initial theme and sidebar colors when preview signals ready or when config changes
  // Temporarily disabled postMessage - using only Supabase Realtime
  // useEffect(() => {
  //   const previewComm = presenter.getPreviewCommunication();
  //   if (!previewComm) return;

  //   const sendInitial = () => {
  //     try {
  //       // Delay to ensure iframe is ready
  //       setTimeout(() => {
  //         // send theme
  //         const themeColors = ((viewModel.config as any)?.theme?.colors || {}) as Record<string, string>;
  //         if (themeColors) {
  //           previewComm.sendThemeUpdate(themeColors);
  //         }
  //         // send store-button colors (and others later if needed)
  //         const storeColors = getElementColorsFromConfig('store-button');
  //         if (storeColors) {
  //           previewComm.sendSidebarUpdate({ elementId: 'store-button', colors: storeColors });
  //         }

  //         // send current left sidebar structure so new buttons appear without reload
  //         const layout = (viewModel.config as any)?.modules?.uiRenderer?.sidebar?.layout;
  //         if (layout && previewComm.sendSidebarStructure) {
  //           previewComm.sendSidebarStructure(layout);
  //         }
  //       }, 100);
  //     } catch {}
  //   };

  //   if (previewComm.onPreviewReady) {
  //     previewComm.onPreviewReady(sendInitial);
  //   }

  //   // also send once when config is ready (in case iframe was already ready)
  //   if (viewModel.config) {
  //     sendInitial();
  //   }
  // }, [presenter, viewModel.config]);

  if (viewModel.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (viewModel.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-bold mb-2">Error</h3>
          <p className="text-red-600">{viewModel.error}</p>
        </div>
      </div>
    );
  }

  if (!viewModel.config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">No configuration loaded</p>
      </div>
    );
  }

  const theme = viewModel.config.theme as any;
  const backgroundSettings = theme?.background;

  const headerTitle = (() => {
    if (activeSection === 'pageConstructor') {
      return 'Page Builder';
    }
    if (activeSection === 'authButton') {
      return 'Auth Button Editor';
    }
    if (activeSection === 'authPopup') {
      return 'Auth Popup Editor';
    }
    if (selectedOfferCardId) {
      return 'Offer Card Editor';
    }
    if (viewModel.selectedElement) {
      if (viewModel.selectedElement.area === 'rightSidebar') {
        return `Right Sidebar — ${viewModel.selectedElement.id}`;
      }
      if (viewModel.selectedElement.area === 'sidebar') {
        return `Left Sidebar — ${viewModel.selectedElement.id}`;
      }
      return `Editing: ${viewModel.selectedElement.id}`;
    }
    if (activeSection === 'rightSidebar') {
      return 'Right Sidebar Editor';
    }
    return 'Left Sidebar Editor';
  })();

  const tabs: Tab[] = [
    { id: 'theme', label: 'Theme' },
    { id: 'leftSidebar', label: 'Left Sidebar' },
    { id: 'rightSidebar', label: 'Right Sidebar' },
    { id: 'authentication', label: 'Authentication' },
    { id: 'pages', label: 'Pages' },
    { id: 'offerCards', label: 'Offer Cards' },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    
    // Set activeSection based on tab
    switch (tabId) {
      case 'theme':
        setActiveSection('background');
        break;
      case 'leftSidebar':
        setActiveSection('sidebar');
        // Select first element if available
        const leftElements = extractSidebarElements('sidebar');
        if (leftElements.length > 0 && leftElements[0]) {
          handleSidebarElementSelect(leftElements[0].id, 'sidebar');
        }
        break;
      case 'rightSidebar':
        setActiveSection('rightSidebar');
        // Select first element if available
        const rightElements = extractSidebarElements('rightSidebar');
        if (rightElements.length > 0 && rightElements[0]) {
          handleSidebarElementSelect(rightElements[0].id, 'rightSidebar');
        }
        break;
      case 'authentication':
        setActiveSection('authButton');
        break;
      case 'pages':
        setActiveSection('pageConstructor');
        break;
      case 'offerCards':
        // Don't change activeSection for offer cards, just show the manager
        break;
      default:
        break;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'theme':
        return (
          <div className="p-3">
            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  setActiveSection('background');
                  setActiveTab('theme');
                }}
                className={`text-left px-2 py-1.5 rounded text-xs transition-colors ${
                  activeSection === 'background' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Application Background
              </button>
            </div>
          </div>
        );

      case 'leftSidebar':
        return (
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-gray-500">Manage buttons</span>
              <button
                onClick={() => {
                  presenter.addSidebarButton('New Button');
                }}
                className="px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
                title="Add new button to Left Sidebar"
              >
                + Add Button
              </button>
            </div>
            <ElementTreeSelector
              elements={extractSidebarElements('sidebar')}
              selectedId={viewModel.selectedElement?.area === 'sidebar' ? (viewModel.selectedElement?.id || null) : null}
              onSelect={(elementId) => {
                handleSidebarElementSelect(elementId, 'sidebar');
                setActiveTab('leftSidebar');
              }}
              onDelete={(elementId) => presenter.removeSidebarButton(elementId)}
            />
          </div>
        );

      case 'rightSidebar':
        return (
          <div className="p-3">
            <ElementTreeSelector
              elements={extractSidebarElements('rightSidebar')}
              selectedId={viewModel.selectedElement?.area === 'rightSidebar' ? (viewModel.selectedElement?.id || null) : null}
              onSelect={(elementId) => {
                handleSidebarElementSelect(elementId, 'rightSidebar');
                setActiveTab('rightSidebar');
              }}
            />
          </div>
        );

      case 'authentication':
        return (
          <div className="p-3">
            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  setActiveSection('authPopup');
                  presenter.previewAuthPopup(true);
                  setActiveTab('authentication');
                }}
                className={`text-left px-2 py-1.5 rounded text-xs transition-colors ${
                  activeSection === 'authPopup' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Popup
              </button>
              <button
                onClick={() => {
                  setActiveSection('authButton');
                  presenter.previewAuthPopup(false);
                  setActiveTab('authentication');
                }}
                className={`text-left px-2 py-1.5 rounded text-xs transition-colors ${
                  activeSection === 'authButton' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Button
              </button>
            </div>
          </div>
        );

      case 'pages':
        return (
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Pages</h3>
              <button
                onClick={async () => {
                  const pageSlug = prompt('Enter page slug (e.g., "about", "contact"):');
                  if (!pageSlug) return;
                  const normalizedSlug = pageSlug.trim().toLowerCase().replace(/\s+/g, '-');
                  const success = await presenter.createPage(normalizedSlug);
                  if (success) {
                    setActiveSection('pageConstructor');
                    setSelectedPageSlug(normalizedSlug);
                    setActiveTab('pages');
                    const url = new URL(window.location.href);
                    url.searchParams.set('pageSlug', normalizedSlug);
                    window.history.replaceState({}, '', url.toString());
                  }
                }}
                className="px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
              >
                + Add
              </button>
            </div>
            <div className="space-y-1">
              {viewModel.pages.map((pageSlug: string) => (
                <button
                  key={pageSlug}
                  onClick={() => {
                    setActiveSection('pageConstructor');
                    setSelectedPageSlug(pageSlug);
                    setActiveTab('pages');
                    const url = new URL(window.location.href);
                    url.searchParams.set('pageSlug', pageSlug);
                    window.history.replaceState({}, '', url.toString());
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                    selectedPageSlug === pageSlug 
                      ? 'bg-blue-500 text-white' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {pageSlug}
                </button>
              ))}
            </div>
          </div>
        );

      case 'offerCards':
        return (
          <div className="p-3">
            <OfferCardsManager
              offerCards={offerCards}
              selectedCardId={selectedOfferCardId}
              onSelect={(cardId) => {
                pageConstructorPresenter.selectOfferCard(cardId);
                setSelectedOfferCardId(cardId);
                setActiveTab('offerCards');
                // Clear sidebar element selection when selecting offer card
                if (viewModel.selectedElement) {
                  handleSidebarElementSelect(null, 'sidebar');
                }
              }}
              onMigrate={async () => {
                if (window.confirm('Migrate all offer cards to Figma styles? This will update existing styles but preserve your customizations.')) {
                  await pageConstructorPresenter.migrateOfferCardsToFigmaStyles();
                  setOfferCards(pageConstructorPresenter.getOfferCards());
                }
              }}
              onAdd={async () => {
                await pageConstructorPresenter.addOfferCard();
                setOfferCards(pageConstructorPresenter.getOfferCards());
                setSelectedOfferCardId(pageConstructorPresenter.getSelectedOfferCardId());
              }}
              onDelete={async (cardId) => {
                await pageConstructorPresenter.removeOfferCard(cardId);
                setOfferCards(pageConstructorPresenter.getOfferCards());
                setSelectedOfferCardId(pageConstructorPresenter.getSelectedOfferCardId());
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-screen flex bg-gray-100">
      {/* Slide Out Sidebar */}
      <SlideOutSidebar
        isOpen={isSlideOutSidebarOpen}
        onClose={() => setIsSlideOutSidebarOpen(false)}
        appId={appId}
      />

      {/* Main Menu Button */}
      <button
        onClick={() => setIsSlideOutSidebarOpen(true)}
        className="fixed top-4 left-4 z-30 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        title="Open menu"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Left Sidebar - список компонентов для редактирования */}
      <aside className="w-72 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
        <div className="p-3">
          {/* Page Builder - Add Section (only when pageConstructor is active) */}
          {activeSection === 'pageConstructor' && (() => {
            const pageVm = pageConstructorPresenter.getViewModel();
            const selectedSectionId = pageVm?.selectedSection?.id || null;
            return (
              <div className="mb-4 pb-4 border-b border-gray-200">
                <SectionPalette 
                  onAddSection={(type) => pageConstructorPresenter.addSection(type)}
                  selectedSectionId={selectedSectionId}
                  onAddComponent={(sectionId, componentType) => {
                    pageConstructorPresenter.addComponent(sectionId, componentType);
                  }}
                />
              </div>
            );
          })()}

          {/* Left Sidebar Elements (only when not in pageConstructor) */}
          {activeSection !== 'pageConstructor' && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-gray-500">Manage buttons</span>
                <button
                  onClick={() => {
                    presenter.addSidebarButton('New Button');
                  }}
                  className="px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"                                                                  
                  title="Add new button to Left Sidebar"
                >
                  + Add Button
                </button>
              </div>
              <ElementTreeSelector
                elements={extractSidebarElements('sidebar')}
                selectedId={viewModel.selectedElement?.area === 'sidebar' ? (viewModel.selectedElement?.id || null) : null}
                onSelect={(elementId) => handleSidebarElementSelect(elementId, 'sidebar')}
                onDelete={(elementId) => presenter.removeSidebarButton(elementId)}
              />
            </div>
          )}
        </div>
      </aside>

      {/* Center - Live Preview */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white border-l border-r border-gray-200">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange}>
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b border-gray-200 px-4 py-3 flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-bold text-gray-900">Live Preview</h3>
              <div className="flex items-center gap-2">
                {/* Element Selection Mode Toggle */}
                {isClient && iframeSrc && (
                  <button
                    onClick={() => {
                      const newMode = !isElementSelectionMode;
                      setIsElementSelectionMode(newMode);
                      if (typeof presenter.setElementSelectionMode === 'function') {
                        presenter.setElementSelectionMode(newMode);
                      }
                    }}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      isElementSelectionMode
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    title={isElementSelectionMode ? 'Exit element selection mode' : 'Enable element selection mode'}
                  >
                    {isElementSelectionMode ? '✓ Select Mode' : 'Select Element'}
                  </button>
                )}
                {isClient && iframeSrc && (
                  <DeviceControls
                    device={device}
                    orientation={orientation}
                    onDeviceChange={setDevice}
                    onOrientationChange={setOrientation}
                    onFullscreen={() => setIsFullscreen(true)}
                    onRefresh={() => iframeRef.current?.contentWindow?.location.reload()}
                    onOpenInNewTab={() => window.open(`${clientUrl}/?appId=${appId}&previewMode=false`, '_blank')}
                  />
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 flex items-center justify-center">
              {isClient && iframeSrc ? (
                <PhoneMockup
                  iframeSrc={iframeSrc}
                  device={device}
                  orientation={orientation}
                  onIframeRef={handleIframeRef}
                />
              ) : (
                <div className="text-center p-8">
                  <p className="text-sm text-gray-500 mb-2">Preview not available</p>
                  <p className="text-xs text-gray-400">
                    {!clientUrl ? 'NEXT_PUBLIC_CLIENT_URL is not configured' : 'Loading...'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Tabs>
      </div>

      {/* Right Sidebar - Editing Panels */}
      <aside ref={rightSidebarRef} className="w-80 bg-white border-l border-gray-200 flex flex-col flex-shrink-0 overflow-hidden">
        {/* Compact Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-base font-bold text-gray-900">
                {headerTitle}
              </h1>
              {activeSection !== 'pageConstructor' && (
                <p className="text-gray-500 text-xs mt-0.5">
                  <span className="font-mono">{viewModel.appId}</span>
                  {viewModel.version && (
                    <span className="ml-2">
                      v{viewModel.version}
                      {viewModel.isDraft ? (
                        <span className="ml-1 text-orange-600 font-semibold">Draft</span>
                      ) : (
                        <span className="ml-1 text-green-600 font-semibold">Published</span>
                      )}
                    </span>
                  )}
                </p>
              )}
            </div>
            {activeSection !== 'pageConstructor' && (
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => presenter.resetToActive(appId)}
                  disabled={viewModel.isSaving || !viewModel.isDraft}
                  className="px-3 py-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs"
                  title={!viewModel.isDraft ? 'No draft changes to reset' : 'Reset to last published version'}
                >
                  🔄 Reset to Active
                </button>
                <button
                  onClick={handleSaveDraft}
                  disabled={viewModel.isSaving || !viewModel.isDraft}
                  className="px-3 py-1.5 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs"
                  title={!viewModel.isDraft ? 'No unsaved changes' : 'Save as draft in Supabase'}
                >
                  {viewModel.isSaving ? 'Saving...' : '💾 Save Draft'}
                </button>
                <button
                  onClick={handlePublish}
                  disabled={viewModel.isSaving || !viewModel.isDraft}
                  className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs"
                  title={!viewModel.isDraft ? 'Already published' : 'Publish to all users'}
                >
                  {viewModel.isSaving ? 'Publishing...' : '✓ Publish'}
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Selection Tabs */}
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (rightSidebarRef.current) {
                  const contentArea = rightSidebarRef.current.querySelector('.flex-1.overflow-y-auto');
                  if (contentArea) {
                    contentArea.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }
              }}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors flex-shrink-0"
              title="Прокрутить вверх"
            >
              ⬆️ Наверх
            </button>
            <div className="flex-1 overflow-x-auto">
              <div className="flex gap-1 min-w-max">
                {viewModel.pages && viewModel.pages.length > 0 ? (
                  viewModel.pages.map((pageSlug: string) => (
                    <button
                      key={pageSlug}
                      onClick={async () => {
                        setSelectedPageSlug(pageSlug);
                        const url = new URL(window.location.href);
                        url.searchParams.set('pageSlug', pageSlug);
                        window.history.pushState({}, '', url);
                        // Switch to pageConstructor section to show the editor
                        setActiveSection('pageConstructor');
                        setActiveTab('pages');
                        await pageConstructorPresenter.initialize(appId, pageSlug);
                        setOfferCards(pageConstructorPresenter.getOfferCards());
                        setSelectedOfferCardId(pageConstructorPresenter.getSelectedOfferCardId());
                        // Force send CONFIG_UPDATE with elementSelectionMode to iframe
                        // This ensures that element selection mode is properly set in iframe after page switch
                        if (typeof presenter.forceSendConfigToIframe === 'function') {
                          presenter.forceSendConfigToIframe();
                        } else if (typeof presenter.setElementSelectionMode === 'function') {
                          // Fallback: toggle and restore to force send
                          const currentMode = isElementSelectionMode;
                          presenter.setElementSelectionMode(!currentMode);
                          presenter.setElementSelectionMode(currentMode);
                        }
                      }}
                      className={`
                        px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap
                        ${selectedPageSlug === pageSlug
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                      title={`Редактировать страницу: ${pageSlug}`}
                    >
                      {pageSlug}
                    </button>
                  ))
                ) : (
                  <span className="px-3 py-1.5 text-xs text-gray-500">Нет страниц</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-4">
            {/* Background Editor */}
            {activeSection === 'background' && (
              <BackgroundEditor
                value={backgroundSettings}
                onChange={(updates) => presenter.updateBackground(updates)}
              />
            )}

            {/* Offer Card Editor */}
            {(() => {
              const shouldShowOfferCardEditor = selectedOfferCardId && 
                activeTab === 'offerCards' && 
                activeSection === 'offerCards';
              if (shouldShowOfferCardEditor) {
                console.log('[UIBuilderPage] Rendering OfferCardEditor', { selectedOfferCardId, activeTab, activeSection });
              } else {
                console.log('[UIBuilderPage] NOT rendering OfferCardEditor', { selectedOfferCardId, activeTab, activeSection });
              }
              return shouldShowOfferCardEditor;
            })() && (() => {
              const selectedCard = offerCards.find(card => card.id === selectedOfferCardId) || pageConstructorPresenter.getSelectedOfferCard();
              if (!selectedCard) return null;
              
              return (
                <div className="bg-white rounded-lg shadow">
                  <OfferCardEditor
                    card={selectedCard}
                    onUpdate={async (updatedCard) => {
                      if (selectedOfferCardId) {
                        await pageConstructorPresenter.updateOfferCard(selectedOfferCardId, updatedCard);
                        setOfferCards(pageConstructorPresenter.getOfferCards());
                      }
                    }}
                  />
                </div>
              );
            })()}

            {/* Color Editor for Selected Element */}
            {(activeSection === 'sidebar' || activeSection === 'rightSidebar') && !selectedOfferCardId && (
              <SidebarColorEditor
                element={viewModel.selectedElement}
                onChange={handleElementColorChange}
                onGapChange={(elementId, gap) => presenter.updateContainerGap(elementId, gap)}
                onPaddingChange={(elementId, padding) => presenter.updateContainerPadding(elementId, padding)}
                onBorderRadiusChange={(elementId, borderRadius) => presenter.updateButtonBorderRadius(elementId, borderRadius)}
                onLabelChange={(elementId, label) => presenter.updateButtonLabel(elementId, label)}
                onTextAlignChange={(elementId, textAlign) => presenter.updateButtonTextAlign(elementId, textAlign)}
                onFlexDirectionChange={(elementId, flexDirection) => presenter.updateContainerFlexDirection(elementId, flexDirection)}
                onIconChange={(elementId, icon) => presenter.updateButtonIcon(elementId, icon)}
                onBackgroundOpacityChange={(elementId, opacity) => presenter.updateContainerBackgroundOpacity(elementId, opacity)}
                onPageSlugChange={(elementId, pageSlug) => presenter.updateButtonPageSlug(elementId, pageSlug)}
                pages={viewModel.pages}
              />
            )}

            {activeSection === 'authButton' && (
              <AuthEditor
                value={viewModel.config as any}
                onUpdateButton={(input) => presenter.updateLoginButton(input)}
                onUpdatePopup={(input) => presenter.updateAuthPopup(input)}
                tab="button"
              />
            )}

            {activeSection === 'authPopup' && (
              <AuthEditor
                value={viewModel.config as any}
                onUpdateButton={(input) => presenter.updateLoginButton(input)}
                onUpdatePopup={(input) => presenter.updateAuthPopup(input)}
                tab="popup"
              />
            )}

            {activeSection === 'pageConstructor' && (
              <PageConstructor
                presenter={pageConstructorPresenter}
                appId={appId}
                pageSlug={selectedPageSlug}
                pages={viewModel.pages}
              />
            )}

            {/* Validation Errors */}
            {viewModel.validationErrors.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <h4 className="font-semibold text-yellow-800 text-xs mb-1">Validation Warnings:</h4>
                <ul className="list-disc list-inside space-y-0.5">
                  {viewModel.validationErrors.map((error: any, idx: number) => (
                    <li key={idx} className="text-yellow-700 text-xs">
                      <span className="font-mono">{error.path}</span>: {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Fullscreen Preview Modal */}
      {isFullscreen && isClient && iframeSrc && (
        <FullscreenPreview
          iframeSrc={iframeSrc}
          device={device}
          orientation={orientation}
          onClose={() => setIsFullscreen(false)}
          onIframeRef={handleIframeRef}
        />
      )}
    </div>
  );
}











