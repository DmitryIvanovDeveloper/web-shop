'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { BackgroundEditor } from '../components/BackgroundEditor';
import { ElementTreeSelector } from '../components/ElementTreeSelector';
import { LeftSidebarEditor } from '../components/LeftSidebarEditor';
import { ColorInput } from '../components/ColorInput';
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
import { CreateTemplateModal } from '../components/CreateTemplateModal';
import { GrapesJsEditor } from '../components/GrapesJsEditor';
import { TemplatesGrapeList } from '../components/TemplatesGrapeList';
import type { SidebarElement } from '../../../domain/types/sidebar-element.types';
import type { AppConfigStructure } from '../../../domain/entities/app-config.entity';
import type { PageConstructorPresenter } from '../../presenters/page-constructor.presenter';
import type { TemplatesPresenter } from '../../presenters/templates.presenter';
import type { UserAppConfig } from '../../../domain/entities/user-app-config.entity';
import { env } from '@/env';
import { container } from '@/infrastructure/bootstrap/container';
import { UI_BUILDER_TYPES } from '../../../infrastructure/bootstrap/types';

interface UIBuilderPageProps {
  presenter: any; 
  appId: string;
}

type SidebarSectionKey = 'sidebar' | 'rightSidebar';

interface UiLayoutNodeStyles {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  gap?: string;
  padding?: string;
  width?: string;
  maxHeight?: string;
  textAlign?: string;
  borderRadius?: string;
  backgroundOpacity?: string;
}

interface UiLayoutNode {
  id: string;
  type?: string;
  props?: {
    text?: string;
    children?: string;
    pageSlug?: string;
    icon?: string;
  };
  styles?: UiLayoutNodeStyles;
  children?: UiLayoutNode[];
}

interface UiSidebarSectionConfig {
  version?: string;
  theme?: unknown;
  layout?: UiLayoutNode;
}

interface UiRendererModules {
  uiRenderer?: Record<SidebarSectionKey, UiSidebarSectionConfig | undefined>;
}

interface UiThemeConfig {
  background?: Record<string, string>;
  buttonStyling?: {
    backgroundColor?: string;
    hoverBackgroundColor?: string;
  };
}

type UiAppConfig = AppConfigStructure & {
  theme?: UiThemeConfig;
  modules?: UiRendererModules & Record<string, unknown>;
};

export function UIBuilderPage({ presenter, appId }: UIBuilderPageProps): JSX.Element {
  const [viewModel, setViewModel] = useState(presenter.getViewModel());
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const rightSidebarRef = useRef<HTMLElement>(null);
  const [viewportMode, setViewportMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [device, setDevice] = useState<DeviceType>('iphone-15-pro');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const clientUrl = (() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const override = params.get('previewHost');
      if (override) return override;
    }
    return env.NEXT_PUBLIC_CLIENT_URL;
  })();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  const [activeSection, setActiveSection] = useState<
    'background' | 'sidebar' | 'leftSidebar' | 'rightSidebar' | 'authButton' | 'authPopup' | 'pageConstructor' | 'offerCards' | 'templates' | 'grapesjs' | 'grapeTemplates'
  >('leftSidebar');
  const [activeTab, setActiveTab] = useState<string>('leftSidebar');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isSlideOutSidebarOpen, setIsSlideOutSidebarOpen] = useState(false);
  const [isElementSelectionMode, setIsElementSelectionMode] = useState(
    () => (typeof presenter.getElementSelectionMode === 'function' ? presenter.getElementSelectionMode() : false)
  );
  const [isCreateTemplateModalOpen, setIsCreateTemplateModalOpen] = useState(false);
  const [createTemplateType, setCreateTemplateType] = useState<'base' | 'current'>('base');
  const ensuredSectionsRef = useRef<Set<'sidebar' | 'rightSidebar'>>(new Set());

  useEffect(() => {
    if (activeSection === 'background') {
      setActiveTab('theme');
    } else if (activeSection === 'sidebar' || activeSection === 'leftSidebar') {
      setActiveTab('leftSidebar');
    } else if (activeSection === 'rightSidebar') {
      setActiveTab('rightSidebar');
    } else if (activeSection === 'authButton' || activeSection === 'authPopup') {
      setActiveTab('authentication');
    } else if (activeSection === 'pageConstructor') {
      setActiveTab('pages');
    } else if (activeSection === 'offerCards') {
      setActiveTab('offerCards');
    } else if (activeSection === 'templates') {
      setActiveTab('templates');
    } else if (activeSection === 'grapesjs') {
      setActiveTab('grapesjs');
    } else if (activeSection === 'grapeTemplates') {
      setActiveTab('grapeTemplates');
    }
  }, [activeSection]);

  const getPageSlugFromUrl = (): string => {
    if (typeof window === 'undefined') return 'home';
    const params = new URLSearchParams(window.location.search);
    return params.get('pageSlug') || 'home';
  };
  
  const [selectedPageSlug, setSelectedPageSlug] = useState<string>(getPageSlugFromUrl());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pageSlug = params.get('pageSlug') || 'home';
       const role = params.get('role');
      setSelectedPageSlug(pageSlug);
      setIsAdmin(role === 'admin');
    }
  }, []);

  const pageConstructorPresenter = React.useMemo(() => {
    return container.get<PageConstructorPresenter>(UI_BUILDER_TYPES.PageConstructorPresenter);
  }, []);

  const templatesPresenter = React.useMemo(() => {
    return container.get<TemplatesPresenter>(UI_BUILDER_TYPES.TemplatesPresenter);
  }, []);

  const [templatesVm, setTemplatesVm] = useState(templatesPresenter.getViewModel());

  useEffect(() => {
    const unsubscribe = templatesPresenter.subscribe(setTemplatesVm);
    
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const role = params.get('role');
      const admin = role === 'admin';
      setIsAdmin(admin);
      templatesPresenter.setAdmin(admin);
      templatesPresenter.setAppId(appId);
    } else {
      templatesPresenter.setAdmin(false);
      templatesPresenter.setAppId(appId);
    }

    templatesPresenter.loadTemplates().catch(() => {
      
    });

    return unsubscribe;
  }, [templatesPresenter, isAdmin, presenter, pageConstructorPresenter]);

  const [offerCards, setOfferCards] = useState(pageConstructorPresenter.getOfferCards());
  const [selectedOfferCardId, setSelectedOfferCardId] = useState<string | null>(pageConstructorPresenter.getSelectedOfferCardId());

  const [pageConstructorVm, setPageConstructorVm] = useState(pageConstructorPresenter.getViewModel());

  useEffect(() => {
    const unsubscribe = pageConstructorPresenter.subscribe(setPageConstructorVm);
    return unsubscribe;
  }, [pageConstructorPresenter]);

  useEffect(() => {
    const initializeOfferCards = async () => {
      await pageConstructorPresenter.initialize(appId, selectedPageSlug);
      setOfferCards(pageConstructorPresenter.getOfferCards());
      setSelectedOfferCardId(pageConstructorPresenter.getSelectedOfferCardId());
      setPageConstructorVm(pageConstructorPresenter.getViewModel());
    };
    initializeOfferCards();
  }, [appId, selectedPageSlug, pageConstructorPresenter]);

  useEffect(() => {
    const updateOfferCards = () => {
      setOfferCards(pageConstructorPresenter.getOfferCards());
      setSelectedOfferCardId(pageConstructorPresenter.getSelectedOfferCardId());
    };
    const interval = setInterval(updateOfferCards, 500);
    return () => clearInterval(interval);
  }, [pageConstructorPresenter]);

  const iframeSrc = React.useMemo(() => {
    if (!clientUrl) return null;
    const targetSlug = activeSection === 'pageConstructor' ? 'home' : (selectedPageSlug || 'home');
    return `${clientUrl.replace(/\/$/, '')}/${targetSlug}?appId=${appId}&previewMode=true&uibuilder=true`;
  }, [activeSection, appId, clientUrl, selectedPageSlug]);

  const handleIframeRef = useCallback(
    (el: HTMLIFrameElement | null) => {
      if (!el) {
        return;
      }

      (iframeRef as React.MutableRefObject<HTMLIFrameElement | null>).current = el;
      const previewComm = presenter.getPreviewCommunication();

      if (previewComm && typeof previewComm.setIframeRef === 'function') {
        previewComm.setIframeRef(el);
      }
    },
    [presenter]
  );

  useEffect(() => {
    const unsubscribe = presenter.subscribe((vm: any) => {
      setViewModel(vm);

      if (typeof vm.elementSelectionMode === 'boolean') {
        setIsElementSelectionMode(vm.elementSelectionMode);

        if (typeof pageConstructorPresenter.setElementSelectionMode === 'function') {
          pageConstructorPresenter.setElementSelectionMode(vm.elementSelectionMode);
        }
      }

      if (vm.selectedElement?.id && vm.selectedElement.id.startsWith('page-')) {
        const pageSlug = vm.selectedElement.id.replace('page-', '');

        setActiveTab('pages');
        setActiveSection('pageConstructor');

        pageConstructorPresenter.selectSection(null);
        pageConstructorPresenter.selectComponent(null, null);
        pageConstructorPresenter.selectOfferCard(null);
        setSelectedOfferCardId(null);
      }
    });

    return unsubscribe;
  }, [presenter, pageConstructorPresenter]);

  useEffect(() => {
    const config = viewModel.config as AppConfigStructure | null;
    pageConstructorPresenter.updateAppConfigSnapshot(config);
  }, [viewModel.config, pageConstructorPresenter]);

  useEffect(() => {
    ensuredSectionsRef.current.clear();
  }, [viewModel.config]);

  const lastTemplateAutosaveRef = useRef<{
    templateId: string | null;
    lastModified: number;
    configSnapshot: string | null; 
  }>({
    templateId: null,
    lastModified: 0,
    configSnapshot: null,
  });

  const autosaveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    if (!templatesVm.selectedTemplateId) {
      return;
    }
    if (!viewModel.config) {
      return;
    }

    const last = lastTemplateAutosaveRef.current;
    const currentConfigSnapshot = JSON.stringify(viewModel.config);

    if (last.templateId !== templatesVm.selectedTemplateId) {
      lastTemplateAutosaveRef.current = {
        templateId: templatesVm.selectedTemplateId,
        lastModified: viewModel.lastModified,
        configSnapshot: currentConfigSnapshot,
      };
      return;
    }

    if (last.configSnapshot === currentConfigSnapshot) {
      return;
    }

    if (autosaveTimeoutRef.current) {
      window.clearTimeout(autosaveTimeoutRef.current);
    }

    lastTemplateAutosaveRef.current = {
      templateId: templatesVm.selectedTemplateId,
      lastModified: viewModel.lastModified,
      configSnapshot: currentConfigSnapshot,
    };

    autosaveTimeoutRef.current = window.setTimeout(() => {
      void templatesPresenter.saveSelectedTemplateFromCurrentConfig();
      autosaveTimeoutRef.current = null;
    }, 2000);

    return () => {
      if (autosaveTimeoutRef.current) {
        window.clearTimeout(autosaveTimeoutRef.current);
        autosaveTimeoutRef.current = null;
      }
    };
  }, [isAdmin, viewModel.lastModified]);

  useEffect(() => {
    if (!iframeRef.current?.contentWindow || !isClient) return;

    const deviceToViewportMode = (deviceType: DeviceType): 'mobile' | 'tablet' | 'desktop' => {
      if (deviceType === 'ipad') return 'tablet';
      return 'mobile';
    };

    const sendViewportModeUpdate = () => {
        const iframeWindow = iframeRef.current?.contentWindow;

      if (!iframeWindow) {
        return;
      }

      if (!clientUrl || !iframeWindow.postMessage) {
        return;
      }

            const mappedViewportMode = deviceToViewportMode(device);

            iframeWindow.postMessage(
              {
                type: 'VIEWPORT_MODE_UPDATE',
                payload: { viewportMode: mappedViewportMode },
              },
              clientUrl
            );
    };

    sendViewportModeUpdate();

    const timeoutId = setTimeout(sendViewportModeUpdate, 500);

    return () => clearTimeout(timeoutId);
  }, [device, orientation, isClient]);

  useEffect(() => {
    
    presenter.initialize(appId, false);
    presenter.loadPages();
  }, [presenter, appId]);

  useEffect(() => {
    if (!viewModel.config) {
      return;
    }

    (['sidebar', 'rightSidebar'] as const).forEach(section => {
      const config = viewModel.config as UiAppConfig;
      const hasLayout = config.modules?.uiRenderer?.[section]?.layout;
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
    const confirmed = window.confirm(
      'Are you sure you want to publish these changes? This will update the live configuration for all users.'
    );

    if (!confirmed) return;

    const success = await presenter.publishDraft();

    if (success) {

      if (isAdmin && templatesVm.selectedTemplateId) {
        const result = await templatesPresenter.markSelectedTemplatePublished();
        if (result.isFailure) {
          alert(`Config published, but template publish failed: ${result.error?.message ?? 'Unknown error'}`);
          return;
        }
      }

      alert('Configuration published successfully!');
    } else if (viewModel.error) {
      alert(`Failed to publish: ${viewModel.error}`);
    }
  };

  const handleSidebarElementSelect = (elementId: string | null, section: 'sidebar' | 'rightSidebar', shiftKey = false): void => {
    const ensuredRootId = presenter.ensureSidebarLayout(section);
    let normalizedId = elementId || '';

    if (!normalizedId && viewModel.config) {
      normalizedId = ensuredRootId || '';
      if (!normalizedId) {
        const config = viewModel.config as UiAppConfig;
        const rootNode = config.modules?.uiRenderer?.[section]?.layout;
        if (rootNode?.id) {
          normalizedId = rootNode.id as string;
        }
      }
    }
 
    if (normalizedId && selectedOfferCardId) {
      pageConstructorPresenter.selectOfferCard(null);
      setSelectedOfferCardId(null);
    }

    if (activeSection !== section) {
      setActiveSection(section);
    }

    if (section === 'sidebar') {
      setActiveTab('leftSidebar');
    } else if (section === 'rightSidebar') {
      setActiveTab('rightSidebar');
    }
    presenter.selectElement(normalizedId, shiftKey, section);
  };

  useEffect(() => {

  }, [viewModel.selectedElement?.id]);

  useEffect(() => {
    const unsubscribe = pageConstructorPresenter.subscribe((pageVm) => {
      const previewComm = presenter.getPreviewCommunication();
      if (!previewComm || !previewComm.selectElement) {
        return;
      }

      if (pageVm.selectedComponent && pageVm.selectedSection) {
        
        previewComm.selectElement(pageVm.selectedComponent.id);
      } else if (pageVm.selectedSection) {
        
        previewComm.selectElement(pageVm.selectedSection.id);
      } else {
        
        previewComm.selectElement(null);
      }
    });

    return unsubscribe;
  }, [pageConstructorPresenter, presenter]);

  const handleElementColorChange = (elementId: string, colors: Record<string, string>) => {
    presenter.updateElementColors(elementId, colors);
  };

  const extractSidebarElements = (layoutKey: 'sidebar' | 'rightSidebar'): SidebarElement[] => {
    if (!viewModel.config) return [];

    const config = viewModel.config as UiAppConfig;
    const sidebarConfig = config.modules?.uiRenderer?.[layoutKey];

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

  const getElementColorsFromConfig = (elementId: string): Record<string, string> | null => {
    if (!viewModel.config) return null;
    const config = viewModel.config as UiAppConfig;
    const sidebarConfig = config.modules?.uiRenderer?.sidebar;
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

  const findSidebarButtonByPageSlug = (pageSlug: string): string | null => {
    if (!viewModel.config) {
      return null;
    }
    const config = viewModel.config as UiAppConfig;
    const sidebarConfig = config.modules?.uiRenderer?.sidebar;
    if (!sidebarConfig?.layout) {
      return null;
    }

    const findButton = (node: any): any | null => {
      
      if (node.type === 'Button' && node.props?.pageSlug === pageSlug) {
        return node;
      }
      
      if (Array.isArray(node.children)) {
        for (const c of node.children) {
          const found = findButton(c);
          if (found) return found;
        }
      }
      return null;
    };

    const buttonNode = findButton(sidebarConfig.layout);
    if (buttonNode && buttonNode.id) {
      return buttonNode.id;
    }

    return null;
  };

  const simulateSidebarButtonClick = (buttonId: string): void => {
    const iframe = iframeRef.current;

    if (!iframe || !iframe.contentWindow) {
      return;
    }

    iframe.contentWindow.postMessage(
      {
        type: 'CLICK_BUTTON',
        buttonId: buttonId,
        temporarilyDisableSelectionMode: isElementSelectionMode
      },
      clientUrl || '*'
    );
  };

  useEffect(() => {
    const previewComm = presenter.getPreviewCommunication();
    if (previewComm && previewComm.onElementSelected) {
      previewComm.onElementSelected((elementId: string | null) => {
        if (!elementId) {
          presenter.selectElement(null);
          pageConstructorPresenter.selectSection(null);
          pageConstructorPresenter.selectComponent(null, null);
          return;
        }

        const area = presenter.findElementArea(elementId, pageConstructorPresenter);

        if (area === 'sidebar') {
          
          setSelectedOfferCardId((prev) => {
            if (prev) {
              pageConstructorPresenter.selectOfferCard(null);
              return null;
            }
            return prev;
          });
          handleSidebarElementSelect(elementId, 'sidebar');
        } else if (area === 'rightSidebar') {
          
          setSelectedOfferCardId((prev) => {
            if (prev) {
              pageConstructorPresenter.selectOfferCard(null);
              return null;
            }
            return prev;
          });
          handleSidebarElementSelect(elementId, 'rightSidebar');
        } else if (area === 'offerCard') {
          
          const offerCardId = elementId.startsWith('offer-card-') ? elementId : elementId;

          setActiveTab('offerCards');
          setActiveSection('offerCards');

          pageConstructorPresenter.selectOfferCard(offerCardId);
          setSelectedOfferCardId(offerCardId);

          presenter.selectElement(null);
        } else if (area === 'authButton') {
          
          setActiveTab('authentication');
          setActiveSection('authButton');

          presenter.selectElement(null);
          pageConstructorPresenter.selectSection(null);
          pageConstructorPresenter.selectComponent(null, null);
          if (selectedOfferCardId) {
            pageConstructorPresenter.selectOfferCard(null);
            setSelectedOfferCardId(null);
          }
        } else if (area === 'authPopup') {
          
          setActiveTab('authentication');
          setActiveSection('authPopup');

          presenter.selectElement(null);
          pageConstructorPresenter.selectSection(null);
          pageConstructorPresenter.selectComponent(null, null);
          if (selectedOfferCardId) {
            pageConstructorPresenter.selectOfferCard(null);
            setSelectedOfferCardId(null);
          }
        } else if (area === 'page') {
          
          if (elementId.startsWith('page-')) {
            const pageSlug = elementId.replace('page-', '');
            
            setActiveTab('pages');
            setActiveSection('pageConstructor');

            pageConstructorPresenter.selectOfferCard(null);
            setSelectedOfferCardId(null);

            pageConstructorPresenter.selectSection(null);
            pageConstructorPresenter.selectComponent(null, null);

            return;
          }

          const pageVm = pageConstructorPresenter.getViewModel();
          let foundSectionId: string | null = null;
          let foundComponentId: string | null = null;

          if (pageVm?.sections) {
            
            for (const section of pageVm.sections) {
              if (section.id === elementId) {
                foundSectionId = section.id;
                  foundComponentId = null;
                break;
              }
            }

            if (!foundSectionId) {
              for (const section of pageVm.sections) {
                
                const foundComponent = section.components?.find(comp => comp.id === elementId);
                if (foundComponent) {
                  foundSectionId = section.id;
                  foundComponentId = foundComponent.id;
                  break;
                }
              }
            }
          }

          if (foundSectionId) {
            
            setActiveTab('pages');
            setActiveSection('pageConstructor');

            presenter.selectElement(null);
            pageConstructorPresenter.selectOfferCard(null);
            setSelectedOfferCardId(null);

            pageConstructorPresenter.selectSection(foundSectionId);
            if (foundComponentId && foundComponentId !== foundSectionId) {
              pageConstructorPresenter.selectComponent(foundSectionId, foundComponentId);
            } else {
              pageConstructorPresenter.selectComponent(foundSectionId, null);
            }
          }
        }
      });
    }
  }, [presenter, pageConstructorPresenter]);

  useEffect(() => {
    const previewComm = presenter.getPreviewCommunication();
    if (!previewComm) return;

    const handlePreviewReady = () => {
    };

    if (previewComm.onPreviewReady) {
      previewComm.onPreviewReady(handlePreviewReady);
    }
  }, [presenter]);

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

  const theme = (viewModel.config as UiAppConfig).theme;
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
    if (activeSection === 'grapesjs') {
      return 'GrapeJS Visual Editor';
    }
    if (activeSection === 'grapeTemplates') {
      return 'GrapeJS Templates Gallery';
    }
    return 'Left Sidebar Editor';
  })();

  const tabs: Tab[] = [
    { id: 'theme', label: 'Theme' },
    { id: 'leftSidebar', label: 'Left Sidebar' },
    { id: 'rightSidebar', label: 'Right Sidebar' },
    { id: 'authentication', label: 'Authentication' },
    { id: 'pages', label: 'Pages' },
    { id: 'grapeTemplates', label: 'GrapeJS Templates' },
    { id: 'offerCards', label: 'Offer Cards' },
    { id: 'templates', label: 'Templates' },
    { id: 'grapesjs', label: 'GrapeJS' },
  ];

  const handleTabChange = (tabId: string) => {
    console.log('handleTabChange called with:', tabId);
    setActiveTab(tabId);

    switch (tabId) {
      case 'theme':
        setActiveSection('background');
        break;
      case 'leftSidebar':
        setActiveSection('leftSidebar');
        
        const leftElements = extractSidebarElements('sidebar');
        if (leftElements.length > 0 && leftElements[0]) {
          handleSidebarElementSelect(leftElements[0].id, 'sidebar');
        }
        break;
      case 'rightSidebar':
        setActiveSection('rightSidebar');
        
        const rightElements = extractSidebarElements('rightSidebar');
        if (rightElements.length > 0 && rightElements[0]) {
          handleSidebarElementSelect(rightElements[0].id, 'rightSidebar');
        }
        break;
      case 'authentication': {
        
        setActiveSection('authPopup');
        presenter.previewAuthPopup(true);
        
        presenter.selectElement(null);
        pageConstructorPresenter.selectSection(null);
        pageConstructorPresenter.selectComponent(null, null);
        pageConstructorPresenter.selectOfferCard(null);
        setSelectedOfferCardId(null);
        break;
      }
      case 'pages':
        setActiveSection('pageConstructor');
        
        if (selectedOfferCardId) {
          pageConstructorPresenter.selectOfferCard(null);
          setSelectedOfferCardId(null);
        }
        break;
      case 'offerCards':
        setActiveSection('offerCards');
        
        pageConstructorPresenter.selectSection(null);
        pageConstructorPresenter.selectComponent(null, null);
        
        if (viewModel.selectedElement) {
          presenter.selectElement(null);
        }
        break;
      case 'templates':
        setActiveSection('templates');
        
        presenter.selectElement(null);
        pageConstructorPresenter.selectSection(null);
        pageConstructorPresenter.selectComponent(null, null);
        pageConstructorPresenter.selectOfferCard(null);
        setSelectedOfferCardId(null);
        break;
      case 'grapesjs':
        setActiveSection('grapesjs');

        presenter.selectElement(null);
        pageConstructorPresenter.selectSection(null);
        pageConstructorPresenter.selectComponent(null, null);
        pageConstructorPresenter.selectOfferCard(null);
        setSelectedOfferCardId(null);
        break;
      case 'grapeTemplates':
        setActiveSection('grapeTemplates');

        presenter.selectElement(null);
        pageConstructorPresenter.selectSection(null);
        pageConstructorPresenter.selectComponent(null, null);
        pageConstructorPresenter.selectOfferCard(null);
        setSelectedOfferCardId(null);
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
          <div className="p-3 space-y-4">
            {}
            <div className="bg-white rounded-lg shadow p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Button Styling</h4>
              <div className="space-y-3">
                <ColorInput
                  label="Button Background"
                  value={(viewModel.config as UiAppConfig)?.theme?.buttonStyling?.backgroundColor || '#1d4ed8'}
                  onChange={(color) => {
                    presenter.updateButtonStyling({
                      backgroundColor: color,
                    });
                  }}
                />
                <ColorInput
                  label="Button Hover Background"
                  value={(viewModel.config as UiAppConfig)?.theme?.buttonStyling?.hoverBackgroundColor || '#1e40af'}
                  onChange={(color) => {
                    presenter.updateButtonStyling({
                      hoverBackgroundColor: color,
                    });
                  }}
                />
              </div>
            </div>

            {}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-900">Manage Buttons</span>
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
                selectedIds={viewModel.selectedElementIds}
                onSelect={(elementId, shiftKey) => {
                  handleSidebarElementSelect(elementId, 'sidebar', shiftKey);
                  setActiveTab('leftSidebar');
                }}
                onDelete={(elementId) => presenter.removeSidebarButton(elementId)}
                onReorder={(fromIndex, toIndex) => presenter.reorderSidebarButtons(fromIndex, toIndex, 'sidebar')}
              />
            </div>
          </div>
        );

      case 'rightSidebar':
        return (
          <div className="p-3">
            <ElementTreeSelector
              elements={extractSidebarElements('rightSidebar')}
              selectedId={viewModel.selectedElement?.area === 'rightSidebar' ? (viewModel.selectedElement?.id || null) : null}
              selectedIds={viewModel.selectedElementIds}
              onSelect={(elementId, shiftKey) => {
                handleSidebarElementSelect(elementId, 'rightSidebar', shiftKey);
                setActiveTab('rightSidebar');
              }}
              onDelete={(elementId) => presenter.removeSidebarButton(elementId)}
              onReorder={(fromIndex, toIndex) => presenter.reorderSidebarButtons(fromIndex, toIndex, 'rightSidebar')}
            />
          </div>
        );

      case 'authentication':
        return (
          <div className="p-3">
            <div className="flex flex-col gap-1">
              <div className="text-[11px] text-gray-500 mb-1">Authentication elements</div>
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
                  onClick={async () => {
                    setActiveSection('pageConstructor');
                    setSelectedPageSlug(pageSlug);
                    setActiveTab('pages');
                    const url = new URL(window.location.href);
                    url.searchParams.set('pageSlug', pageSlug);
                    window.history.replaceState({}, '', url.toString());

                    const buttonId = findSidebarButtonByPageSlug(pageSlug);
                    if (buttonId) {
                      setTimeout(() => {
                        simulateSidebarButtonClick(buttonId);
                      }, 100);
                    }

                    await pageConstructorPresenter.initialize(appId, pageSlug);
                    setOfferCards(pageConstructorPresenter.getOfferCards());
                    setSelectedOfferCardId(pageConstructorPresenter.getSelectedOfferCardId());
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

      case 'templates':
        return (
          <div className="p-3 text-[11px] text-gray-500">
            Use the Templates list in the left sidebar to create and select templates. Details and
            Apply button are shown in the right panel.
          </div>
        );

      case 'grapesjs':
        return (
          <div className="p-3 space-y-3">
            <div className="mb-1">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">GrapeJS Editor</h3>
            </div>
            <div className="text-[11px] text-gray-500 space-y-2">
              <p>Visual editor для создания layouts с drag & drop</p>
              <div className="bg-blue-50 p-2 rounded">
                <p className="font-semibold text-blue-900 mb-1">💡 Консоль браузера:</p>
                <code className="text-[10px] block bg-white p-1 rounded">window.gjsEditor</code>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-gray-700">Методы:</p>
                <ul className="text-[10px] space-y-0.5 ml-3">
                  <li>• getProjectData() - JSON</li>
                  <li>• loadProjectData(json)</li>
                  <li>• getHtml() / getCss()</li>
                  <li>• addComponents()</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'grapeTemplates':
        return (
          <div className="p-3 text-[11px] text-gray-500">
            Browse and manage GrapeJS templates from database. Select a template to view details.
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-screen flex bg-gray-100">
      {}
      <SlideOutSidebar
        isOpen={isSlideOutSidebarOpen}
        onClose={() => setIsSlideOutSidebarOpen(false)}
        appId={appId}
        isAdmin={isAdmin}
      />

      {}
      <button
        onClick={() => setIsSlideOutSidebarOpen(true)}
        className="fixed top-4 left-4 z-30 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        title="Open menu"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <aside className="w-72 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
        <div className="p-3">
          {}
          {activeTab === 'pages' && activeSection === 'pageConstructor' && (() => {
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

          {}
          {activeTab === 'offerCards' && (
            <div className="mb-4">
              <OfferCardsManager
                offerCards={offerCards}
                selectedCardId={selectedOfferCardId}
                onSelect={(cardId) => {
                  pageConstructorPresenter.selectOfferCard(cardId);
                  setSelectedOfferCardId(cardId);
                  setActiveTab('offerCards');
                  
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
          )}

          {}
          {activeTab === 'templates' && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-gray-500">Templates</span>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCreateTemplateType('base');
                        setIsCreateTemplateModalOpen(true);
                      }}
                      className="px-2 py-1 text-[11px] rounded bg-emerald-500 text-white hover:bg-emerald-600"
                    >
                      Base
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCreateTemplateType('current');
                        setIsCreateTemplateModalOpen(true);
                      }}
                      className="px-2 py-1 text-[11px] rounded bg-blue-500 text-white hover:bg-blue-600"
                    >
                      Current
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                {templatesVm.templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      void templatesPresenter.selectTemplate(tpl.id);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                      templatesVm.selectedTemplateId === tpl.id
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{tpl.name}</span>
                      {tpl.updatedAt && (
                        <span className="text-[10px] text-gray-400">
                          {tpl.updatedAt.toLocaleDateString?.() ?? ''}
                        </span>
                      )}
                    </div>
                    {tpl.description && (
                      <div className="text-[10px] text-gray-500 truncate">{tpl.description}</div>
                    )}
                  </button>
                ))}
                {templatesVm.templates.length === 0 && !templatesVm.isLoadingList && (
                  <div className="text-[11px] text-gray-400 italic">
                    No templates yet. Use buttons above to create one.
                  </div>
                )}
              </div>

              {}
              {!isAdmin && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-gray-500">Your Saved Configs</span>
                    <button
                      type="button"
                      onClick={async () => {
                        const name = prompt('Enter a name for this configuration:');
                        if (name) {
                          await templatesPresenter.saveCurrentConfigAsUserAppConfig(name);
                        }
                      }}
                      className="px-2 py-1 text-[11px] rounded bg-green-500 text-white hover:bg-green-600"
                    >
                      Save Current
                    </button>
                  </div>
                  <div className="space-y-1">
                    {templatesVm.userAppConfigs.map((config) => (
                      <button
                        key={config.id}
                        type="button"
                        onClick={() => {
                          void templatesPresenter.applyUserAppConfig(config.id);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                          templatesVm.selectedUserAppConfigId === config.id
                            ? 'bg-green-500 text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                void templatesPresenter.updateUserAppConfigStatus(config.id, !config.isActive);
                              }}
                              className={`w-3 h-3 rounded-full border-2 transition-colors ${
                                config.isActive
                                  ? 'bg-green-500 border-green-500'
                                  : 'bg-white border-gray-300 hover:border-gray-400'
                              }`}
                              title={config.isActive ? 'Deactivate config' : 'Activate config'}
                            />
                            <span>{config.name || `Config v${config.version}`}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                              config.isActive
                                ? 'bg-green-100 text-green-700'
                                : config.isDraft
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-gray-100 text-gray-600'
                            }`}>
                              {config.isActive ? 'Active' : config.isDraft ? 'Draft' : 'Inactive'}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {config.updatedAt.toLocaleDateString?.() ?? ''}
                          </span>
                        </div>
                      </button>
                    ))}
                    {templatesVm.userAppConfigs.length === 0 && !templatesVm.isLoadingUserAppConfigs && (
                      <div className="text-[11px] text-gray-400 italic">
                        No saved configs yet. Use "Save Current" to save your configuration.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {}
          {activeTab !== 'pages' && activeTab !== 'offerCards' && activeTab !== 'templates' && activeTab !== 'authentication' && activeTab !== 'grapesjs' && activeTab !== 'grapeTemplates' && activeSection !== 'pageConstructor' && (
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
                onReorder={(fromIndex, toIndex) => presenter.reorderSidebarButtons(fromIndex, toIndex, 'sidebar')}
              />
            </div>
          )}
        </div>
      </aside>

      {}
      <div className="flex-1 flex flex-col overflow-hidden bg-white border-l border-r border-gray-200">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange}>
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b border-gray-200 px-4 py-3 flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-bold text-gray-900">Live Preview</h3>
              <div className="flex items-center gap-2">
                {}
                {isClient && iframeSrc && (
                  <button
                    onClick={() => {
                      const newMode = !isElementSelectionMode;
                      setIsElementSelectionMode(newMode);
                      if (typeof presenter.setElementSelectionMode === 'function') {
                        presenter.setElementSelectionMode(newMode);
                      }
                      
                      if (typeof pageConstructorPresenter.setElementSelectionMode === 'function') {
                        pageConstructorPresenter.setElementSelectionMode(newMode);
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
            {activeTab === 'grapesjs' ? (
              <div className="flex-1 flex overflow-hidden bg-white">
                <GrapesJsEditor 
                  onChange={(projectData) => {
                    console.log('GrapeJS project changed:', projectData);
                  }}
                  onReady={(editor) => {
                    console.log('GrapeJS ready:', editor);
                  }}
                />
              </div>
            ) : activeTab === 'grapeTemplates' ? (
              <div className="flex-1 overflow-y-auto bg-white">
                <TemplatesGrapeList />
              </div>
            ) : (
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
            )}
          </div>
        </Tabs>
      </div>

      {}
      <aside ref={rightSidebarRef} className="w-80 bg-white border-l border-gray-200 flex flex-col flex-shrink-0 overflow-hidden">
        {}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex flex-col gap-2">
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
              <div className="flex flex-wrap gap-2 items-center">
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
            {activeSection === 'pageConstructor' && (
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  onClick={() => pageConstructorPresenter.saveDraft()}
                  disabled={pageConstructorVm.isSaving}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  title="Save page as draft"
                >
                  {pageConstructorVm.isSaving ? 'Saving...' : '💾 Save Draft'}
                </button>
                <button
                  onClick={async () => {
                    const success = await pageConstructorPresenter.publish();
                    if (success) {
                      
                      const shouldReload = window.confirm(
                        'Page published successfully! Do you want to reload the published page to see the changes?'
                      );
                      if (shouldReload) {
                        
                        const pageUrl = `/home`;
                        window.open(pageUrl, '_blank');
                      }
                    } else {
                      alert(`Failed to publish: ${pageConstructorVm.error || 'Unknown error'}`);
                    }
                  }}
                  disabled={pageConstructorVm.isSaving || !pageConstructorVm.isDraft}
                  className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  title={!pageConstructorVm.isDraft ? 'Already published' : 'Publish this page'}
                >
                  🚀 Publish Page
                </button>
                {!pageConstructorVm.isDraft && (
                  <span className="text-xs text-gray-500">(Published)</span>
                )}
              </div>
            )}
          </div>
        </header>

        {}
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
              title="Scroll to top"
            >
              ⬆️ Up
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
                        
                        setActiveSection('pageConstructor');
                        setActiveTab('pages');

                        const buttonId = findSidebarButtonByPageSlug(pageSlug);
                        if (buttonId) {
                          setTimeout(() => {
                            simulateSidebarButtonClick(buttonId);
                          }, 100);
                        }
                        
                        await pageConstructorPresenter.initialize(appId, pageSlug);
                        setOfferCards(pageConstructorPresenter.getOfferCards());
                        setSelectedOfferCardId(pageConstructorPresenter.getSelectedOfferCardId());

                        if (typeof pageConstructorPresenter.setElementSelectionMode === 'function') {
                          pageConstructorPresenter.setElementSelectionMode(isElementSelectionMode);
                        }
                        
                        if (typeof presenter.forceSendConfigToIframe === 'function') {
                          presenter.forceSendConfigToIframe();
                        }
                      }}
                      className={`
                        px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap
                        ${selectedPageSlug === pageSlug
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                      title={`Edit page: ${pageSlug}`}
                    >
                      {pageSlug}
                    </button>
                  ))
                ) : (
                  <span className="px-3 py-1.5 text-xs text-gray-500">No pages</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-4">
            {}
            {activeSection === 'background' && (
              <BackgroundEditor
                value={backgroundSettings}
                onChange={(updates) => presenter.updateBackground(updates)}
              />
            )}

            {}
            {activeSection === 'leftSidebar' && (
              <div className="space-y-4">
                {}
              </div>
            )}

            {}
            {(() => {
              const shouldShowOfferCardEditor =
                selectedOfferCardId && activeTab === 'offerCards' && activeSection === 'offerCards';
              return shouldShowOfferCardEditor;
            })() &&
              (() => {
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

            {}
            {(activeSection === 'sidebar' || activeSection === 'rightSidebar') && !selectedOfferCardId && (
              <LeftSidebarEditor
                element={viewModel.selectedElement}
                onChange={handleElementColorChange}
                onGapChange={(elementId, gap) => presenter.updateContainerGap(elementId, gap)}
                onPaddingChange={(elementId, padding) => presenter.updateContainerPadding(elementId, padding)}
                onWidthChange={(elementId, width) => presenter.updateButtonWidth(elementId, width)}
                onMaxHeightChange={(elementId, maxHeight) => presenter.updateButtonMaxHeight(elementId, maxHeight)}
                onBorderRadiusChange={(elementId, borderRadius) => presenter.updateButtonBorderRadius(elementId, borderRadius)}
                onLabelChange={(elementId, label) => presenter.updateButtonLabel(elementId, label)}
                onTextAlignChange={(elementId, textAlign) => presenter.updateButtonTextAlign(elementId, textAlign)}
                onFlexDirectionChange={(elementId, flexDirection) => {
                  // Use updateButtonFlexDirection for buttons, updateContainerFlexDirection for containers
                  if (viewModel.selectedElement?.type === 'Button') {
                    presenter.updateButtonFlexDirection(elementId, flexDirection);
                  } else {
                    presenter.updateContainerFlexDirection(elementId, flexDirection);
                  }
                }}
                onIconChange={(elementId, icon) => presenter.updateButtonIcon(elementId, icon)}
                onIconSizeChange={(elementId, iconSize) => presenter.updateButtonIconSize(elementId, iconSize)}
                onIconGapChange={(elementId, iconGap) => presenter.updateButtonIconGap(elementId, iconGap)}
                onBackgroundOpacityChange={(elementId, opacity) => presenter.updateContainerBackgroundOpacity(elementId, opacity)}
                onPageSlugChange={(elementId, pageSlug) => presenter.updateButtonPageSlug(elementId, pageSlug)}
                pages={viewModel.pages}
              />
            )}

            {activeSection === 'authButton' && (
              <AuthEditor
                value={viewModel.config}
                onUpdateButton={(input) => presenter.updateLoginButton(input)}
                onUpdatePopup={(input) => presenter.updateAuthPopup(input)}
                tab="button"
              />
            )}

            {activeSection === 'authPopup' && (
              <AuthEditor
                value={viewModel.config}
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

            {activeSection === 'templates' && (
              <div className="bg-white rounded-lg shadow p-4 space-y-3">
                <h4 className="text-xs font-semibold text-gray-800 mb-1">Template details</h4>
                {templatesVm.selectedTemplate ? (
                  <>
                    <div className="space-y-2">
                      <div>
                        <div className="text-[11px] text-gray-500 mb-0.5">Name</div>
                        {isAdmin ? (
                          <input
                            type="text"
                            defaultValue={templatesVm.selectedTemplate.name}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                            onBlur={(e) => {
                              const value = e.target.value.trim();
                              if (!templatesVm.selectedTemplate) return;
                              if (value && value !== templatesVm.selectedTemplate.name) {
                                void templatesPresenter.updateTemplate({
                                  id: templatesVm.selectedTemplate.id,
                                  name: value,
                                });
                              }
                            }}
                          />
                        ) : (
                          <div className="text-xs font-medium text-gray-900">
                            {templatesVm.selectedTemplate.name}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-[11px] text-gray-500 mb-0.5">Description</div>
                        {isAdmin ? (
                          <textarea
                            defaultValue={templatesVm.selectedTemplate.metadata?.description ?? ''}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded resize-none"
                            rows={3}
                            onBlur={(e) => {
                              const value = e.target.value;
                              if (!templatesVm.selectedTemplate) return;
                              void templatesPresenter.updateTemplate({
                                id: templatesVm.selectedTemplate.id,
                                description: value || undefined,
                              });
                            }}
                          />
                        ) : (
                          <div className="text-xs text-gray-800">
                            {templatesVm.selectedTemplate.metadata?.description || '—'}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => {
                          void templatesPresenter.applySelectedTemplateToBuilder();
                        }}
                        className="px-3 py-1.5 text-xs rounded bg-gray-700 text-white hover:bg-gray-800"
                      >
                        Apply Template
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete template "${templatesVm.selectedTemplate?.name}"? This action cannot be undone.`)) {
                              void templatesPresenter.deleteTemplate(templatesVm.selectedTemplate!.id);
                            }
                          }}
                          className="px-3 py-1.5 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                        >
                          Delete Template
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-[11px] text-gray-500">
                    Select a template from the list on the left to see details and apply it.
                  </div>
                )}
              </div>
            )}

            {}
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

            {activeSection === 'grapeTemplates' && (
              <div className="bg-white rounded-lg shadow p-4 space-y-3">
                <h4 className="text-xs font-semibold text-gray-800 mb-2">GrapeJS Templates</h4>
                <div className="text-[11px] text-gray-600">
                  <p>Select a template from the list to view its details and load it into the GrapeJS editor.</p>
                </div>
              </div>
            )}

            {activeSection === 'grapesjs' && (
              <div className="bg-white rounded-lg shadow p-4 space-y-3">
                <h4 className="text-xs font-semibold text-gray-800 mb-2">GrapeJS Controls</h4>
                <div className="space-y-3 text-xs text-gray-700">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="font-semibold text-blue-900 mb-2">💡 Консоль:</p>
                    <code className="block bg-white p-2 rounded text-[11px] font-mono">
                      window.gjsEditor
                    </code>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-semibold">Export/Import:</p>
                    <button
                      onClick={() => {
                        const editor = (window as any).gjsEditor;
                        if (editor) {
                          const json = editor.getProjectData();
                          const blob = new Blob([JSON.stringify(json, null, 2)], 
                            { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `grapesjs-${Date.now()}.json`;
                          a.click();
                        }
                      }}
                      className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs font-medium"
                    >
                      📥 Export JSON
                    </button>
                    
                    <button
                      onClick={() => {
                        const editor = (window as any).gjsEditor;
                        if (editor) {
                          const json = editor.getProjectData();
                          navigator.clipboard.writeText(JSON.stringify(json, null, 2));
                          alert('✅ JSON скопирован в буфер обмена!');
                        }
                      }}
                      className="w-full px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs font-medium"
                    >
                      📋 Copy JSON
                    </button>
                  </div>
                  
                  <div className="border-t pt-3">
                    <p className="font-semibold mb-2">📚 API Methods:</p>
                    <ul className="text-[11px] space-y-1 text-gray-600">
                      <li>• <code>getProjectData()</code> - весь проект</li>
                      <li>• <code>loadProjectData(json)</code> - загрузить</li>
                      <li>• <code>getHtml()</code> - только HTML</li>
                      <li>• <code>getCss()</code> - только CSS</li>
                      <li>• <code>addComponents()</code> - добавить</li>
                      <li>• <code>getComponents()</code> - компоненты</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {}
      {isFullscreen && isClient && iframeSrc && (
        <FullscreenPreview
          iframeSrc={iframeSrc}
          device={device}
          orientation={orientation}
          onClose={() => setIsFullscreen(false)}
          onIframeRef={handleIframeRef}
        />
      )}

      {}
      <CreateTemplateModal
        isOpen={isCreateTemplateModalOpen}
        onClose={() => {
          setIsCreateTemplateModalOpen(false);
          setCreateTemplateType('base');
        }}
        onCreate={async (name, description) => {
          try {
            if (createTemplateType === 'base') {
              await templatesPresenter.createBaseTemplate(name, { description });
            } else {
              await templatesPresenter.createTemplateFromCurrentConfig(name, { description });
            }
            setIsCreateTemplateModalOpen(false);
            setCreateTemplateType('base');
          } catch (error) {
          }
        }}
        templateType={createTemplateType}
        isLoading={templatesVm.isSaving}
      />
    </div>
  );
}

