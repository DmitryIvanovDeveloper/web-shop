'use client';

import React from 'react';
import type { SelectedElement } from '../../../domain/types/sidebar-element.types';

interface SidebarColorEditorProps {
  element: SelectedElement | null;
  onChange: (elementId: string, colors: Record<string, string>) => void;
}

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorInput({ label, value, onChange }: ColorInputProps): JSX.Element {
  const displayLabel = label.replace(/([A-Z])/g, ' $1').trim();
  const capitalizedLabel = displayLabel.charAt(0).toUpperCase() + displayLabel.slice(1);

  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 items-center">
      <label className="text-sm font-medium text-gray-700">
        {capitalizedLabel}
      </label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-8 rounded border border-gray-300 cursor-pointer flex-shrink-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-xs"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

export function SidebarColorEditor({ element, onChange }: SidebarColorEditorProps): JSX.Element {
  console.log('[SidebarColorEditor] Rendering with element:', element);
  
  if (!element) {
    console.log('[SidebarColorEditor] No element, showing placeholder');
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="text-center text-gray-500 py-6">
          <svg
            className="mx-auto h-10 w-10 text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
          <p className="text-xs font-medium text-gray-600">Select an element to edit</p>
          <p className="text-xs mt-1 text-gray-500">Click in tree or preview</p>
        </div>
      </div>
    );
  }
  
  console.log('[SidebarColorEditor] Rendering editor for element:', element.id);

  const handleColorChange = (colorKey: string, newColor: string) => {
    const updatedColors = {
      ...(element.colors ?? {}),
      [colorKey]: newColor,
    };
    onChange(element.id, updatedColors);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="mb-3 pb-3 border-b border-gray-200">
        <h3 className="text-sm font-bold text-gray-900">Edit Colors</h3>
        <p className="text-xs text-gray-500 mt-0.5 font-mono">{element.id}</p>
      </div>

      {Object.keys(element.colors ?? {}).length > 0 ? (
        <div className="space-y-2">
          {Object.entries(element.colors ?? {}).map(([key, value]) => (
            <ColorInput
              key={key}
              label={key}
              value={value}
              onChange={(newColor) => handleColorChange(key, newColor)}
            />
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-xs py-3 text-center">
          No color properties available
        </div>
      )}
    </div>
  );
}






