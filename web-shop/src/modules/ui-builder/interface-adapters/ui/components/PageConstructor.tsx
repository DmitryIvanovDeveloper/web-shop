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

  const handleSaveDraft = async (): Promise<void> => {
    await presenter.saveDraft();
  };

  const handlePublish = async (): Promise<void> => {
    // Confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to publish this page? This will update the live page configuration for all users.'
    );

    if (!confirmed) return;

    await presenter.publish();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with actions */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-900">Page Builder</h1>
          <span className="text-xs text-gray-500">/</span>
          <span className="text-sm text-gray-600">{pageSlug}</span>
          {vm.isDraft ? (
            <span className="ml-2 text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded font-medium">
              Draft
            </span>
          ) : (
            <span className="ml-2 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded font-medium">
              Published
            </span>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={handleSaveDraft}
            disabled={vm.isSaving || !vm.isDraft}
            className="px-3 py-1.5 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs"
            title={!vm.isDraft ? 'No unsaved changes' : 'Save as draft in Supabase'}
          >
            {vm.isSaving ? 'Saving...' : '💾 Save Draft'}
          </button>
          <button
            onClick={handlePublish}
            disabled={vm.isSaving || !vm.isDraft}
            className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs"
            title={!vm.isDraft ? 'Already published' : 'Publish to all users'}
          >
            {vm.isSaving ? 'Publishing...' : '✓ Publish'}
          </button>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
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
        {/* Page Settings */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Page Settings
          </h3>
          
          {/* Page Padding */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Page Padding
            </label>
            <div className="flex items-center gap-2">
              {(() => {
                // Parse padding value and unit
                const parsePadding = (paddingString: string | number | undefined): { value: number; unit: string } => {
                  if (!paddingString) return { value: 2, unit: 'rem' };
                  const padding = typeof paddingString === 'number' ? `${paddingString}px` : paddingString;
                  
                  // Try to match simple single value (e.g., "2rem", "20px")
                  const match = padding.match(/^([\d.]+)\s*(rem|px|em|vh|%)$/);
                  if (match) {
                    return { value: parseFloat(match[1]), unit: match[2] };
                  }
                  
                  // Default fallback
                  return { value: 2, unit: 'rem' };
                };

                const { value: paddingValue, unit: paddingUnit } = parsePadding(vm.pageStyles?.padding);

                const handlePaddingValueChange = (newValue: string): void => {
                  if (newValue) {
                    presenter.updatePagePadding(`${newValue}${paddingUnit}`);
                  } else {
                    presenter.updatePagePadding('');
                  }
                };

                const handlePaddingUnitChange = (newUnit: string): void => {
                  presenter.updatePagePadding(`${paddingValue}${newUnit}`);
                };

                return (
                  <>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={paddingValue}
                      onChange={(e) => handlePaddingValueChange(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                      placeholder="2"
                    />
                    <select
                      value={paddingUnit}
                      onChange={(e) => handlePaddingUnitChange(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="px">px</option>
                      <option value="rem">rem</option>
                      <option value="em">em</option>
                      <option value="vh">vh</option>
                      <option value="%">%</option>
                    </select>
                  </>
                );
              })()}
            </div>
            <p className="text-xs text-gray-400 mt-1">Examples: 2rem, 20px, 1em, 5vh</p>
          </div>
          
          {/* Page Gap */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Page Gap
            </label>
            <div className="flex items-center gap-2">
              {(() => {
                // Parse gap value and unit
                const parseGap = (gapString: string | number | undefined): { value: number; unit: string } => {
                  if (!gapString) return { value: 1, unit: 'rem' };
                  const gap = typeof gapString === 'number' ? `${gapString}px` : gapString;
                  
                  // Try to match simple single value (e.g., "1rem", "20px")
                  const match = gap.match(/^([\d.]+)\s*(rem|px|em|vh|%)$/);
                  if (match) {
                    return { value: parseFloat(match[1]), unit: match[2] };
                  }
                  
                  // Default fallback
                  return { value: 1, unit: 'rem' };
                };

                const { value: gapValue, unit: gapUnit } = parseGap(vm.pageStyles?.gap);

                const handleGapValueChange = (newValue: string): void => {
                  if (newValue) {
                    presenter.updatePageGap(`${newValue}${gapUnit}`);
                  } else {
                    presenter.updatePageGap('');
                  }
                };

                const handleGapUnitChange = (newUnit: string): void => {
                  presenter.updatePageGap(`${gapValue}${newUnit}`);
                };

                return (
                  <>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={gapValue}
                      onChange={(e) => handleGapValueChange(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                      placeholder="1"
                    />
                    <select
                      value={gapUnit}
                      onChange={(e) => handleGapUnitChange(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="px">px</option>
                      <option value="rem">rem</option>
                      <option value="em">em</option>
                      <option value="vh">vh</option>
                      <option value="%">%</option>
                    </select>
                  </>
                );
              })()}
            </div>
            <p className="text-xs text-gray-400 mt-1">Examples: 1rem, 20px, 2em</p>
          </div>
        </div>

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
    </div>
  );
}

