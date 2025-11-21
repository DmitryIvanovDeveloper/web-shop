'use client';

import React from 'react';

interface SectionPaletteProps {
  onAddSection: (type: 'header' | 'content' | 'footer') => void;
    selectedSectionId?: string | null;
  onAddComponent?: (sectionId: string, componentType: string) => void;
}

const sections = [
  { type: 'header' as const, icon: '⬆️', name: 'Header', description: 'Top section of the page' },
  { type: 'content' as const, icon: '📄', name: 'Content', description: 'Main content area' },
  { type: 'footer' as const, icon: '⬇️', name: 'Footer', description: 'Bottom section of the page' },
];

const components = [
  { type: 'Text', icon: '📝', name: 'Text', description: 'Text element' },
  { type: 'Button', icon: '🔘', name: 'Button', description: 'Button element' },
  { type: 'Image', icon: '🖼️', name: 'Image', description: 'Image element' },
  { type: 'Video', icon: '🎥', name: 'Video', description: 'Video element' },
  { type: 'Container', icon: '📦', name: 'Container', description: 'Container element' },
];

export function SectionPalette({ onAddSection, selectedSectionId, onAddComponent }: SectionPaletteProps): JSX.Element {
  return (
    <div className="p-4 border-b border-gray-200">
      <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
        Add Section
      </h3>
      
      <div className="space-y-2 mb-4">
        {sections.map(section => (
          <button
            key={section.type}
            onClick={() => onAddSection(section.type)}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg flex items-center gap-3 hover:bg-blue-50 hover:border-blue-400 transition-colors group"
            title={section.description}
          >
            <span className="text-xl">{section.icon}</span>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                {section.name}
              </div>
              <div className="text-xs text-gray-500">
                {section.description}
              </div>
            </div>
            <span className="text-gray-400 group-hover:text-blue-500 text-lg">+</span>
          </button>
        ))}
      </div>

      {/* Show components only if a section is selected */}
      {selectedSectionId && onAddComponent && (
        <>
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3 mt-4">
            Add Component
          </h3>
          <div className="space-y-2">
            {components.map(component => (
              <button
                key={component.type}
                onClick={() => onAddComponent(selectedSectionId, component.type)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg flex items-center gap-3 hover:bg-green-50 hover:border-green-400 transition-colors group"
                title={component.description}
              >
                <span className="text-lg">{component.icon}</span>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900 group-hover:text-green-600">
                    {component.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {component.description}
                  </div>
                </div>
                <span className="text-gray-400 group-hover:text-green-500 text-lg">+</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

