'use client';

import React from 'react';
import type { SelectedElement } from '../../../domain/types/sidebar-element.types';

interface SidebarColorEditorProps {
  element: SelectedElement | null;
  onChange: (elementId: string, colors: Record<string, string>) => void;
  onGapChange?: (elementId: string, gap: string) => void;
  onBorderRadiusChange?: (elementId: string, borderRadius: string) => void;
  onLabelChange?: (elementId: string, label: string) => void;
  onTextAlignChange?: (elementId: string, textAlign: string) => void;
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
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
        {capitalizedLabel}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 rounded border border-gray-300 cursor-pointer flex-shrink-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

export function SidebarColorEditor({ element, onChange, onGapChange, onBorderRadiusChange, onLabelChange, onTextAlignChange }: SidebarColorEditorProps): JSX.Element {
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

  // Parse gap value and unit
  const parseGap = (gapString: string): { value: number; unit: string } => {
    const match = gapString?.match(/^([\d.]+)(rem|px)$/);
    if (match) {
      return { value: parseFloat(match[1]), unit: match[2] };
    }
    return { value: 0.5, unit: 'rem' };
  };

  const { value: gapValue, unit: gapUnit } = parseGap(element.gap || '0.5rem');

  const handleGapValueChange = (newValue: string) => {
    if (onGapChange) {
      onGapChange(element.id, `${newValue}${gapUnit}`);
    }
  };

  const handleGapUnitChange = (newUnit: string) => {
    if (onGapChange) {
      onGapChange(element.id, `${gapValue}${newUnit}`);
    }
  };

  // Parse borderRadius value and unit
  const parseBorderRadius = (borderRadiusString: string): { value: number; unit: string } => {
    const match = borderRadiusString?.match(/^([\d.]+)(rem|px)$/);
    if (match) {
      return { value: parseFloat(match[1]), unit: match[2] };
    }
    return { value: 0.5, unit: 'rem' };
  };

  const { value: borderRadiusValue, unit: borderRadiusUnit } = parseBorderRadius(element.borderRadius || '0.5rem');

  const handleBorderRadiusValueChange = (newValue: string) => {
    if (onBorderRadiusChange) {
      onBorderRadiusChange(element.id, `${newValue}${borderRadiusUnit}`);
    }
  };

  const handleBorderRadiusUnitChange = (newUnit: string) => {
    if (onBorderRadiusChange) {
      onBorderRadiusChange(element.id, `${borderRadiusValue}${newUnit}`);
    }
  };

  const isContainer = element.type === 'Container' || element.id.includes('container');
  const isButton = element.type === 'Button' || element.id.includes('button');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900">Properties</h3>
        <p className="text-xs text-gray-500 mt-0.5 font-mono">{element.id}</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Colors Section */}
        {Object.keys(element.colors ?? {}).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Colors</h4>
            <div className="space-y-3">
              {Object.entries(element.colors ?? {}).map(([key, value]) => (
                <ColorInput
                  key={key}
                  label={key}
                  value={value}
                  onChange={(newColor) => handleColorChange(key, newColor)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Gap editor for containers */}
        {isContainer && onGapChange && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Layout</h4>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Gap (Spacing)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={gapValue}
                  onChange={(e) => handleGapValueChange(e.target.value)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="0.5"
                />
                <select
                  value={gapUnit}
                  onChange={(e) => handleGapUnitChange(e.target.value)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="rem">rem</option>
                  <option value="px">px</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* BorderRadius editor for buttons */}
        {isButton && onBorderRadiusChange && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Border</h4>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Border Radius
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={borderRadiusValue}
                  onChange={(e) => handleBorderRadiusValueChange(e.target.value)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="0.5"
                />
                <select
                  value={borderRadiusUnit}
                  onChange={(e) => handleBorderRadiusUnitChange(e.target.value)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="rem">rem</option>
                  <option value="px">px</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Content editor for buttons */}
        {isButton && (onLabelChange || onTextAlignChange) && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Content</h4>
            
            {/* Label */}
            {onLabelChange && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Button Text
                </label>
                <input
                  type="text"
                  value={element.label || ''}
                  onChange={(e) => onLabelChange(element.id, e.target.value)}
                  className="w-48 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Enter button text"
                />
              </div>
            )}

            {/* Text Align */}
            {onTextAlignChange && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Text Alignment
                </label>
                <select
                  value={element.textAlign || 'center'}
                  onChange={(e) => onTextAlignChange(element.id, e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}












