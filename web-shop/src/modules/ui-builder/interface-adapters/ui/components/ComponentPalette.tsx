'use client';

import React from 'react';

interface ComponentPaletteProps {
  selectedSectionId?: string;
  onAddComponent: (type: string) => void;
}

const components = [
  { type: 'Text', icon: '📝', name: 'Text', category: 'Content' },
  { type: 'Button', icon: '🔘', name: 'Button', category: 'Content' },
  { type: 'Image', icon: '🖼️', name: 'Image', category: 'Media' },
  { type: 'Video', icon: '🎥', name: 'Video', category: 'Media' },
  { type: 'ProductsList', icon: '🛍️', name: 'Products', category: 'Commerce' },
  { type: 'OffersList', icon: '🎁', name: 'Offers', category: 'Commerce' },
  { type: 'Container', icon: '📦', name: 'Container', category: 'Layout' },
];

export function ComponentPalette({ selectedSectionId, onAddComponent }: ComponentPaletteProps): JSX.Element {
  if (!selectedSectionId) {
    return (
      <div className="p-4 border-t border-gray-200">
        <div className="text-center py-8">
          <div className="text-gray-400 text-3xl mb-2">👆</div>
          <p className="text-sm text-gray-500">
            Select a section first
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Then add components to it
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-gray-200">
      <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
        Add Component
      </h3>
      
      <div className="grid grid-cols-2 gap-2">
        {components.map(component => (
          <button
            key={component.type}
            onClick={() => onAddComponent(component.type)}
            className="p-3 border border-gray-300 rounded-lg text-center hover:bg-blue-50 hover:border-blue-400 transition-colors group"
            title={`Add ${component.name} (${component.category})`}
          >
            <div className="text-2xl mb-1">{component.icon}</div>
            <div className="text-xs font-medium text-gray-700 group-hover:text-blue-600">
              {component.name}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              {component.category}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

