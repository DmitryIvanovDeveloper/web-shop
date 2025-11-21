'use client';

import React, { useEffect, useState, useRef } from 'react';
import type { PageConstructorPresenter } from '../../presenters/page-constructor.presenter';
import { PageCanvas } from './PageCanvas';
import { SectionEditor } from './SectionEditor';
import { ComponentEditor } from './ComponentEditor';
import { OfferCardEditor } from './OfferCardEditor';
import { env } from '@/env';

interface PageConstructorProps {
  presenter: PageConstructorPresenter;
  appId: string;
  pageSlug?: string;
  pages?: string[];
}

export function PageConstructor({ presenter, appId, pageSlug = 'home', pages = [] }: PageConstructorProps): JSX.Element {
  const [vm, setVm] = useState(presenter.getViewModel());
  const [isInitialized, setIsInitialized] = useState(false);
  const [previewMode, setPreviewMode] = useState<'structure' | 'live'>('structure');
  const [viewportMode, setViewportMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [offerCards, setOfferCards] = useState(presenter.getOfferCards());
  const [selectedOfferCardId, setSelectedOfferCardId] = useState<string | null>(presenter.getSelectedOfferCardId());
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const clientUrl = env.NEXT_PUBLIC_CLIENT_URL;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    const unsubscribe = presenter.subscribe(setVm);
    return unsubscribe;
  }, [presenter]);

  // Update offer cards when they change
  useEffect(() => {
    const updateOfferCards = () => {
      const cards = presenter.getOfferCards();
      const selectedId = presenter.getSelectedOfferCardId();
      setOfferCards(cards);
      // Only update selectedOfferCardId if it's different to avoid unnecessary re-renders
      setSelectedOfferCardId(prev => prev !== selectedId ? selectedId : prev);
    };

    // Initial load
    updateOfferCards();

    // Poll for updates (could be improved with subscription pattern)
    const interval = setInterval(updateOfferCards, 500);
    return () => clearInterval(interval);
  }, [presenter]);
  
  // Sync selectedOfferCardId when offerCards change
  useEffect(() => {
    const presenterSelectedId = presenter.getSelectedOfferCardId();
    if (presenterSelectedId !== selectedOfferCardId) {
      setSelectedOfferCardId(presenterSelectedId);
    }
  }, [offerCards, presenter, selectedOfferCardId]);

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
      {/* Center Panel: Canvas/Preview */}
      <main className="flex-1 bg-gray-50 overflow-hidden flex flex-col">
        {/* Header with Preview Mode Toggle and Action Buttons */}
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

          <div className="flex gap-2 items-center">
            {/* Action Buttons */}
            <button
              onClick={() => presenter.saveDraft()}
              disabled={vm.isSaving}
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {vm.isSaving ? 'Saving...' : '💾 Save Draft'}
            </button>
            <button
              onClick={() => presenter.publish()}
              disabled={vm.isSaving || !vm.isDraft}
              className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              🚀 Publish Page
            </button>
            {!vm.isDraft && (
              <span className="text-xs text-gray-500">(Published)</span>
            )}
            
            {previewMode === 'live' && (
              <>
                {/* Viewport Switcher */}
                <div className="flex gap-0.5 border border-gray-300 rounded p-0.5 ml-2">
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
              </>
            )}
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-hidden">
          {previewMode === 'structure' ? (
            <PageCanvas
              sections={vm.sections}
              selectedSectionId={vm.selectedSection?.id}
              selectedComponentId={vm.selectedComponent?.id}
              onSelectSection={(sectionId) => {
                presenter.selectSection(sectionId);
                // Clear offer card selection when selecting section
                if (selectedOfferCardId) {
                  presenter.selectOfferCard(null);
                  setSelectedOfferCardId(null);
                }
              }}
              onSelectComponent={(sectionId, componentId) => {
                presenter.selectComponent(sectionId, componentId);
                // Clear offer card selection when selecting component
                if (selectedOfferCardId) {
                  presenter.selectOfferCard(null);
                  setSelectedOfferCardId(null);
                }
              }}
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
        {/* Page Settings - Always visible at top */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Page Settings</h3>
          
          {/* Padding */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Padding
            </label>
            <div className="flex items-center gap-2">
              {(() => {
                const parsePadding = (paddingString: string | undefined): { value: number | ''; unit: string } => {
                  if (!paddingString) {
                    return { value: '', unit: 'rem' };
                  }
                  
                  if (paddingString === '0' || paddingString === '0px' || paddingString === '0rem' || paddingString === '0em' || paddingString === '0vh' || paddingString === '0%') {
                    const match = paddingString.match(/^0\s*(rem|px|em|vh|%)?$/);
                    return { value: 0, unit: match && match[1] ? match[1] : 'rem' };
                  }
                  
                  const match = paddingString.match(/^([\d.]+)\s*(rem|px|em|vh|%)$/);
                  if (match) {
                    return { value: parseFloat(match[1]), unit: match[2] };
                  }
                  
                  return { value: '', unit: 'rem' };
                };

                const pageStyles = presenter.getPageStyles();
                const { value: paddingValue, unit: paddingUnit } = parsePadding(pageStyles.padding);

                const handlePaddingValueChange = (newValue: string): void => {
                  if (newValue === '') {
                    presenter.updatePagePadding('');
                    return;
                  }
                  
                  const numValue = parseFloat(newValue);
                  if (!isNaN(numValue) && numValue >= 0) {
                    presenter.updatePagePadding(`${newValue}${paddingUnit}`);
                  }
                };

                const handlePaddingUnitChange = (newUnit: string): void => {
                  if (paddingValue === '' || paddingValue === undefined) {
                    return;
                  }
                  presenter.updatePagePadding(`${paddingValue}${newUnit}`);
                };

                return (
                  <>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={paddingValue === '' ? '' : paddingValue}
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
                    </select>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Gap */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Gap (Spacing)
            </label>
            <div className="flex items-center gap-2">
              {(() => {
                const parseGap = (gapString: string | undefined): { value: number | ''; unit: string } => {
                  if (!gapString) {
                    return { value: '', unit: 'rem' };
                  }
                  
                  if (gapString === '0' || gapString === '0px' || gapString === '0rem' || gapString === '0em' || gapString === '0vh' || gapString === '0%') {
                    const match = gapString.match(/^0\s*(rem|px|em|vh|%)?$/);
                    return { value: 0, unit: match && match[1] ? match[1] : 'rem' };
                  }
                  
                  const match = gapString.match(/^([\d.]+)\s*(rem|px|em|vh|%)$/);
                  if (match) {
                    return { value: parseFloat(match[1]), unit: match[2] };
                  }
                  
                  return { value: '', unit: 'rem' };
                };

                const pageStyles = presenter.getPageStyles();
                const { value: gapValue, unit: gapUnit } = parseGap(pageStyles.gap);

                const handleGapValueChange = (newValue: string): void => {
                  if (newValue === '') {
                    presenter.updatePageGap('');
                    return;
                  }
                  
                  const numValue = parseFloat(newValue);
                  if (!isNaN(numValue) && numValue >= 0) {
                    presenter.updatePageGap(`${newValue}${gapUnit}`);
                  }
                };

                const handleGapUnitChange = (newUnit: string): void => {
                  if (gapValue === '' || gapValue === undefined) {
                    return;
                  }
                  presenter.updatePageGap(`${gapValue}${newUnit}`);
                };

                return (
                  <>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={gapValue === '' ? '' : gapValue}
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
                    </select>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {selectedOfferCardId && (() => {
          const selectedCard = offerCards.find(card => card.id === selectedOfferCardId);
          if (!selectedCard) {
            // Try to get from presenter as fallback
            const presenterCard = presenter.getSelectedOfferCard();
            if (!presenterCard) return null;
            return (
              <OfferCardEditor
                card={presenterCard}
                onUpdate={async (updatedCard) => {
                  await presenter.updateOfferCard(selectedOfferCardId, updatedCard);
                  setOfferCards(presenter.getOfferCards());
                }}
              />
            );
          }
          
          return (
            <OfferCardEditor
              card={selectedCard}
              onUpdate={async (updatedCard) => {
                await presenter.updateOfferCard(selectedOfferCardId, updatedCard);
                setOfferCards(presenter.getOfferCards());
                setSelectedOfferCardId(presenter.getSelectedOfferCardId());
              }}
            />
          );
        })()}

        {!selectedOfferCardId && !vm.selectedSection && !vm.selectedComponent && (
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

        {!selectedOfferCardId && vm.selectedSection && !vm.selectedComponent && (
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

        {!selectedOfferCardId && vm.selectedComponent && vm.selectedSection && (
          <ComponentEditor
            component={vm.selectedComponent}
            onUpdate={(props) => 
              presenter.updateComponent(vm.selectedSection!.id, vm.selectedComponent!.id, props)
            }
            onRemove={() => {
              presenter.removeComponent(vm.selectedSection!.id, vm.selectedComponent!.id);
            }}
            pages={pages}
          />
        )}
      </aside>
    </div>
  );
}

