'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ThemeEditor } from '../components/ThemeEditor';
import { ElementTreeSelector } from '../components/ElementTreeSelector';
import { SidebarColorEditor } from '../components/SidebarColorEditor';
import { AuthEditor } from '../components/AuthEditor';
import { PageConstructor } from '../components/PageConstructor';
import type { SidebarElement } from '../../../domain/types/sidebar-element.types';
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
  const [viewportMode, setViewportMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const clientUrl = env.NEXT_PUBLIC_CLIENT_URL;
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  const [activeSection, setActiveSection] = useState<'sidebar' | 'authButton' | 'authPopup' | 'pageConstructor'>('sidebar');
  
  // Get PageConstructorPresenter from DI container
  const pageConstructorPresenter = React.useMemo(() => {
    return container.get<PageConstructorPresenter>(UI_BUILDER_TYPES.PageConstructorPresenter);
  }, []);

  // Calculate iframe src based on active section
  const iframeSrc = React.useMemo(() => {
    if (!clientUrl) return null;
    if (activeSection === 'pageConstructor') {
      const pageSlug = pageConstructorPresenter.getPageSlug();
      return `${clientUrl}/${pageSlug}?appId=${appId}&previewMode=true&uibuilder=true`;
    }
    return `${clientUrl}/?appId=${appId}&previewMode=true&uibuilder=true`;
  }, [activeSection, appId, clientUrl, pageConstructorPresenter]);

  // Callback ref to set iframe ref when iframe mounts
  const handleIframeRef = useCallback((el: HTMLIFrameElement | null) => {
    // TypeScript expects us to use the ref object directly
    if (el) {
      (iframeRef as React.MutableRefObject<HTMLIFrameElement | null>).current = el;
    }
    const previewComm = presenter.getPreviewCommunication();
    if (previewComm && previewComm.setIframeRef && el) {
      console.log('[UIBuilderPage] Calling setIframeRef with ref:', el);
      previewComm.setIframeRef(el);
    }
  }, [presenter]);

  useEffect(() => {
    const unsubscribe = presenter.subscribe((vm: any) => {
      console.log('[UIBuilderPage] ViewModel updated:', {
        selectedElement: vm.selectedElement,
        activeSection
      });
      setViewModel(vm);
    });

    // Initialize and load full config from Supabase on mount
    presenter.initialize(appId);

    return unsubscribe;
  }, [presenter, appId]);

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

  const handleElementSelect = (elementId: string) => {
    console.log('[UIBuilderPage] handleElementSelect called:', elementId);
    // Ensure we're on sidebar section
    if (activeSection !== 'sidebar') {
      setActiveSection('sidebar');
    }
    presenter.selectElement(elementId);
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
  const extractSidebarElements = (): SidebarElement[] => {
    if (!viewModel.config) return [];

    const config = viewModel.config as any;
    const sidebarConfig = config?.modules?.uiRenderer?.sidebar;

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
      previewComm.onElementSelected(handleElementSelect);
    }
  }, [presenter]);

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

  return (
    <div className="w-full h-screen flex bg-gray-100">
      {/* Edit Elements Sidebar - список компонентов для редактирования */}
      <aside className="w-72 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
        <div className="p-3">
          <h2 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">Components</h2>
          
          {/* Left Sidebar Elements */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Left Sidebar</h3>
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
              elements={extractSidebarElements()}
              selectedId={viewModel.selectedElement?.id || null}
              onSelect={handleElementSelect}
              onDelete={(elementId) => presenter.removeSidebarButton(elementId)}
            />
          </div>

          {/* Authentication section */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Authentication</h3>
            <div className="flex flex-col gap-1 pl-2">
              <button
                onClick={() => {
                  setActiveSection('authPopup');
                  presenter.previewAuthPopup(true);
                }}
                className={`text-left px-2 py-1 rounded text-xs ${activeSection === 'authPopup' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              >
                Popup
              </button>
              <button
                onClick={() => {
                  setActiveSection('authButton');
                  presenter.previewAuthPopup(false);
                }}
                className={`text-left px-2 py-1 rounded text-xs ${activeSection === 'authButton' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              >
                Button
              </button>
            </div>
          </div>

          {/* Pages section */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Pages</h3>
            <div className="flex flex-col gap-1 pl-2">
              <button
                onClick={() => {
                  setActiveSection('pageConstructor');
                }}
                className={`text-left px-2 py-1 rounded text-xs ${activeSection === 'pageConstructor' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              >
                Page Builder
              </button>
            </div>
          </div>

          {/* Placeholder for future components */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">Right Sidebar</h3>
            <p className="text-[10px] text-gray-400 italic pl-2">Coming soon...</p>
          </div>
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">Offer Card</h3>
            <p className="text-[10px] text-gray-400 italic pl-2">Coming soon...</p>
          </div>
        </div>
      </aside>

      {/* Selected Editing Panels - правая панель */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Compact Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-base font-bold text-gray-900">
                {activeSection === 'pageConstructor' ? 'Page Builder' : 
                 activeSection === 'authButton' ? 'Auth Button Editor' :
                 activeSection === 'authPopup' ? 'Auth Popup Editor' :
                 viewModel.selectedElement ? `Editing: ${viewModel.selectedElement.id}` : 'Left Sidebar Editor'}
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-4">
            {/* Color Editor for Selected Element */}
            {activeSection === 'sidebar' && (
              <SidebarColorEditor
                element={viewModel.selectedElement}
                onChange={handleElementColorChange}
                onGapChange={(elementId, gap) => presenter.updateContainerGap(elementId, gap)}
                onPaddingChange={(elementId, padding) => presenter.updateContainerPadding(elementId, padding)}
                onBorderRadiusChange={(elementId, borderRadius) => presenter.updateButtonBorderRadius(elementId, borderRadius)}
                onLabelChange={(elementId, label) => presenter.updateButtonLabel(elementId, label)}
                onTextAlignChange={(elementId, textAlign) => presenter.updateButtonTextAlign(elementId, textAlign)}
                onFlexDirectionChange={(elementId, flexDirection) => presenter.updateContainerFlexDirection(elementId, flexDirection)}
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
                pageSlug="home"
              />
            )}

            {/* Live Preview Section */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-gray-900">Live Preview</h3>
                <div className="flex gap-1.5 items-center">
                  {/* Viewport Switcher */}
                  <div className="flex gap-0.5 border border-gray-300 rounded p-0.5">
                    <button
                      onClick={() => setViewportMode('mobile')}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        viewportMode === 'mobile'
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      title="Mobile (375px)"
                    >
                      📱
                    </button>
                    <button
                      onClick={() => setViewportMode('tablet')}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        viewportMode === 'tablet'
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      title="Tablet (768px)"
                    >
                      📱
                    </button>
                    <button
                      onClick={() => setViewportMode('desktop')}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        viewportMode === 'desktop'
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      title="Desktop (Full Width)"
                    >
                      🖥️
                    </button>
                  </div>
                  <button
                    onClick={() => iframeRef.current?.contentWindow?.location.reload()}
                    className="p-1.5 text-gray-600 hover:text-gray-900 text-sm"
                    title="Refresh preview"
                  >
                    ↻
                  </button>
                  <button
                    onClick={() => window.open(`${clientUrl}/?appId=${appId}&previewMode=false`, '_blank')}
                    className="p-1.5 text-gray-600 hover:text-gray-900 text-sm"
                    title="Open in new tab"
                  >
                    ↗
                  </button>
                </div>
              </div>
              <div className="relative flex justify-center">
                {isClient && iframeSrc ? (
                  <iframe
                    ref={handleIframeRef}
                    src={iframeSrc}
                    className={`border border-gray-300 rounded transition-all duration-300 ${
                      viewportMode === 'mobile' ? 'w-[375px]' : 
                      viewportMode === 'tablet' ? 'w-[768px]' : 
                      'w-full'
                    }`}
                    style={{ height: 'calc(100vh - 200px)' }}
                    title="Live Preview"
                    sandbox="allow-scripts allow-same-origin"
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
      </div>
    </div>
  );
}









