'use client';

import React from 'react';
import type { PageSection, ComponentNode } from '../../../domain/entities/page-section.entity';

interface PageCanvasProps {
  sections: PageSection[];
  selectedSectionId?: string;
  selectedComponentId?: string;
  onSelectSection: (sectionId: string) => void;
  onSelectComponent: (sectionId: string, componentId: string) => void;
}

function getGridTemplate(grid: string): string {
  const map: Record<string, string> = {
    '1-column': '1fr',
    '2-column': '1fr 1fr',
    '3-column': '1fr 1fr 1fr',
    '4-column': '1fr 1fr 1fr 1fr',
  };
  return map[grid] || '1fr';
}

export function PageCanvas({
  sections,
  selectedSectionId,
  selectedComponentId,
  onSelectSection,
  onSelectComponent,
}: PageCanvasProps): JSX.Element {
  if (sections.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Start building your page
          </h3>
          <p className="text-sm text-gray-500">
            Add a section from the left panel to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {sections.map(section => {
          const isSelected = section.id === selectedSectionId;
          
          return (
            <div
              key={section.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectSection(section.id);
              }}
              className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 bg-white shadow-lg'
                  : 'border-dashed border-gray-300 bg-white hover:border-blue-300 hover:shadow-md'
              }`}
              style={{
                backgroundColor: (section.styles?.backgroundColor as string) || '#ffffff',
                padding: (section.styles?.padding as string) || '1.5rem',
              }}
            >
              {}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {section.type}
                  </span>
                  {isSelected && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                      Selected
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {section.components?.length || 0} component(s)
                </div>
              </div>

              {}
              {section.components && section.components.length > 0 ? (
                <div
                  className="gap-4"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: getGridTemplate(section.layout?.grid || '1-column'),
                    gap: section.layout?.gap || '1rem',
                    alignItems: section.layout?.align || 'start',
                  }}
                >
                  {section.components.map(component => {
                    const isComponentSelected = component.id === selectedComponentId && isSelected;
                    
                    return (
                      <div
                        key={component.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectComponent(section.id, component.id);
                        }}
                        className={`border rounded-lg p-4 transition-all ${
                          isComponentSelected
                            ? 'border-green-500 bg-green-50 shadow-md'
                            : 'border-gray-200 bg-gray-50 hover:border-green-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{getComponentIcon(component.type)}</span>
                          <span className="text-xs font-semibold text-gray-700">
                            {component.type}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 font-mono truncate">
                          {component.id}
                        </div>
                        {component.props && Object.keys(component.props).length > 0 && (
                          <div className="mt-2 text-xs text-gray-500">
                            {renderComponentPreview(component)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                  No components yet. Click "Add Component" to add one.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getComponentIcon(type: string): string {
  const icons: Record<string, string> = {
    Text: '📝',
    Button: '🔘',
    Image: '🖼️',
    Video: '🎥',
    ProductsList: '🛍️',
    OffersList: '🎁',
    Container: '📦',
  };
  return icons[type] || '📦';
}

function renderComponentPreview(component: ComponentNode): string {
  if (component.type === 'Text' && component.props?.text) {
    return String(component.props.text).substring(0, 50);
  }
  if (component.type === 'Button' && component.props?.text) {
    return `Button: "${component.props.text}"`;
  }
  if (component.type === 'Image' && component.props?.alt) {
    return `Image: ${component.props.alt}`;
  }
  return 'Click to edit properties';
}

