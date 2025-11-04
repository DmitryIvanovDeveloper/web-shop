'use client';

import React, { useEffect, useState, useRef } from 'react';
import type { PageConstructorPresenter } from '../../presenters/page-constructor.presenter';
import { SectionPalette } from './SectionPalette';
import { ComponentPalette } from './ComponentPalette';
import { PageCanvas } from './PageCanvas';
import { SectionEditor } from './SectionEditor';
import { ComponentEditor } from './ComponentEditor';
import { env } from '@/env';

interface PageConstructorProps {
  presenter: PageConstructorPresenter;
  appId: string;
  pageSlug?: string;
}

export function PageConstructor({ presenter, appId, pageSlug = 'home' }: PageConstructorProps): JSX.Element {
  const [vm, setVm] = useState(presenter.getViewModel());
  const [isInitialized, setIsInitialized] = useState(false);
  const [previewMode, setPreviewMode] = useState<'structure' | 'live'>('structure');
  const [viewportMode, setViewportMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const clientUrl = env.NEXT_PUBLIC_CLIENT_URL;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    const unsubscribe = presenter.subscribe(setVm);
    return unsubscribe;
  }, [presenter]);

  useEffect(() => {
    if (!isInitialized) {
      presenter.initialize(appId, pageSlug);
      setIsInitialized(true);
    }
  }, [presenter, appId, pageSlug, isInitialized]);

  if (vm.isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading page configuration...</p>
        </div>
      </div>
    );
  }

  if (vm.error) {
    return (
      <div className="flex h-full items-center justify-center bg-red-50">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
          <p className="text-sm text-red-700">{vm.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left Panel: Palettes */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
        <SectionPalette onAddSection={(type) => presenter.addSection(type)} />
        <ComponentPalette
          selectedSectionId={vm.selectedSection?.id}
          onAddComponent={(type) => {
            if (vm.selectedSection) {
              presenter.addComponent(vm.selectedSection.id, type);
            }
          }}
        />
        
        {/* Actions */}
        <div className="p-4 border-t border-gray-200 mt-auto">
          <button
            onClick={() => presenter.saveDraft()}
            disabled={vm.isSaving}
            className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium mb-2"
          >
            {vm.isSaving ? 'Saving...' : '💾 Save Draft'}
          </button>
          <button
            onClick={() => presenter.publish()}
            disabled={vm.isSaving || !vm.isDraft}
            className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
          >
            🚀 Publish Page
          </button>
          {!vm.isDraft && (
            <p className="text-xs text-center text-gray-500 mt-2">
              Page is already published
            </p>
          )}
        </div>
      </aside>

      {/* Center Panel: Canvas/Preview */}
      <main className="flex-1 bg-gray-50 overflow-hidden flex flex-col">
        {/* Preview Mode Toggle */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setPreviewMode('structure')}
              className={`px-3 py-1.5 text-xs rounded ${
                previewMode === 'structure'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📐 Structure
            </button>
            <button
              onClick={() => setPreviewMode('live')}
              className={`px-3 py-1.5 text-xs rounded ${
                previewMode === 'live'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🎨 Live Preview
            </button>
          </div>

          {previewMode === 'live' && (
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
                onClick={() => window.open(`${clientUrl}/?appId=${appId}&pageSlug=${pageSlug}&pagePreview=true&previewMode=true`, '_blank')}
                className="p-1.5 text-gray-600 hover:text-gray-900 text-sm"
                title="Open in new tab"
              >
                ↗
              </button>
            </div>
          )}
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-hidden">
          {previewMode === 'structure' ? (
            <PageCanvas
              sections={vm.sections}
              selectedSectionId={vm.selectedSection?.id}
              selectedComponentId={vm.selectedComponent?.id}
              onSelectSection={(sectionId) => presenter.selectSection(sectionId)}
              onSelectComponent={(sectionId, componentId) => 
                presenter.selectComponent(sectionId, componentId)
              }
            />
          ) : (
            <div className="h-full flex items-center justify-center p-4">
              {isClient && (
                <iframe
                  ref={iframeRef}
                  src={`${clientUrl}/?appId=${appId}&pageSlug=${pageSlug}&pagePreview=true&previewMode=true`}
                  className={`border border-gray-300 rounded transition-all duration-300 ${
                    viewportMode === 'mobile' ? 'w-[375px]' : 
                    viewportMode === 'tablet' ? 'w-[768px]' : 
                    'w-full'
                  }`}
                  style={{ height: 'calc(100vh - 120px)' }}
                  title="Live Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              )}
            </div>
          )}
        </div>
      </main>

      {/* Right Panel: Editor */}
      <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
        {!vm.selectedSection && !vm.selectedComponent && (
          <div className="p-4 text-center py-12">
            <div className="text-gray-400 text-3xl mb-2">👈</div>
            <p className="text-sm text-gray-500">
              Select a section or component
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Click on the canvas to edit
            </p>
          </div>
        )}

        {vm.selectedSection && !vm.selectedComponent && (
          <SectionEditor
            section={vm.selectedSection}
            onUpdateLayout={(layout) => 
              presenter.updateSectionLayout(vm.selectedSection!.id, layout)
            }
            onUpdateStyles={(styles) => 
              presenter.updateSectionStyles(vm.selectedSection!.id, styles)
            }
            onRemove={() => {
              presenter.removeSection(vm.selectedSection!.id);
            }}
          />
        )}

        {vm.selectedComponent && vm.selectedSection && (
          <ComponentEditor
            component={vm.selectedComponent}
            onUpdate={(props) => 
              presenter.updateComponent(vm.selectedSection!.id, vm.selectedComponent!.id, props)
            }
            onRemove={() => {
              presenter.removeComponent(vm.selectedSection!.id, vm.selectedComponent!.id);
            }}
          />
        )}
      </aside>
    </div>
  );
}

