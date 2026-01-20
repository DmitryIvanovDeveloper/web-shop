'use client';

import React from 'react';
import type { SelectedElement } from '../../../domain/types/sidebar-element.types';
import { ButtonEditor } from './ButtonEditor';
import { ColorInput } from './ColorInput';

interface SidebarColorEditorProps {
  element: SelectedElement | null;
  onChange: (elementId: string, colors: Record<string, string>) => void;
  onGapChange?: (elementId: string, gap: string) => void;
  onPaddingChange?: (elementId: string, padding: string) => void;
  onWidthChange?: (elementId: string, width: string) => void;
  onMaxHeightChange?: (elementId: string, maxHeight: string) => void;
  onBorderRadiusChange?: (elementId: string, borderRadius: string) => void;
  onLabelChange?: (elementId: string, label: string) => void;
  onTextAlignChange?: (elementId: string, textAlign: string) => void;
  onFlexDirectionChange?: (elementId: string, flexDirection: string) => void;
  onIconChange?: (elementId: string, icon: string | null) => void;
  onBackgroundOpacityChange?: (elementId: string, opacity: string) => void;
  onPageSlugChange?: (elementId: string, pageSlug: string | null) => void;
  pages?: string[];
}

export function SidebarColorEditor({
  element,
  onChange,
  onGapChange,
  onPaddingChange,
  onWidthChange,
  onMaxHeightChange,
  onBorderRadiusChange,
  onLabelChange,
  onTextAlignChange,
  onFlexDirectionChange,
  onIconChange,
  onBackgroundOpacityChange,
  onPageSlugChange,
  pages = [],
}: SidebarColorEditorProps): JSX.Element {
  if (!element) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="text-center text-gray-500 py-6">
          <p className="text-xs font-medium text-gray-600">Select an element to edit</p>
          <p className="text-xs mt-1 text-gray-500">Click in tree or preview</p>
        </div>
      </div>
    );
  }

  const isContainer = element.type === 'Container' || element.id.includes('container');
  const isButton = element.type === 'Button' || element.id.includes('button');

  const handleColorChange = (colorKey: string, newColor: string) => {
    const updatedColors = {
      ...(element.colors ?? {}),
      [colorKey]: newColor,
    };
    onChange(element.id, updatedColors);
  };

  const handleBackgroundOpacityChangeInternal = (value: string) => {
    if (!onBackgroundOpacityChange) return;
    const numeric = Number.parseFloat(value);
    if (Number.isNaN(numeric)) return;
    const clamped = Math.min(1, Math.max(0, numeric));
    onBackgroundOpacityChange(element.id, clamped.toString());
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900">Properties</h3>
        <p className="text-xs text-gray-500 mt-0.5 font-mono">{element.id}</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Button editor when element is a button */}
        {isButton && (
          <ButtonEditor
            backgroundColor={element.colors?.backgroundColor || '#ffc629'}
            textColor={element.colors?.textColor || '#ffffff'}
            borderColor={element.colors?.borderColor || '#ffffff'}
            hoverBackgroundColor={element.colors?.hoverBackgroundColor}
            onColorChange={(colorKey, newColor) => handleColorChange(colorKey, newColor)}
            label={element.label || ''}
            onLabelChange={(value) => onLabelChange?.(element.id, value)}
            icon={element.icon || null}
            onIconChange={(value) => onIconChange?.(element.id, value)}
            pageSlug={(element as any).pageSlug || null}
            onPageSlugChange={(value) => onPageSlugChange?.(element.id, value)}
            pages={pages}
            borderRadius={element.borderRadius}
            onBorderRadiusChange={(value) => onBorderRadiusChange?.(element.id, value)}
            padding={element.padding}
            onPaddingChange={(value) => onPaddingChange?.(element.id, value)}
            width={element.width}
            onWidthChange={(value) => onWidthChange?.(element.id, value)}
            maxHeight={element.maxHeight}
            onMaxHeightChange={(value) => onMaxHeightChange?.(element.id, value)}
            textAlign={element.textAlign}
            onTextAlignChange={(value) => onTextAlignChange?.(element.id, value)}
          />
        )}

        {/* Generic colors editor for non-button elements */}
        {!isButton && element.colors && Object.keys(element.colors).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Colors
            </h4>
            <div className="space-y-3">
              {Object.entries(element.colors).map(([key, value]) => (
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

        {/* Layout for container-like elements */}
        {isContainer &&
          (onGapChange || onPaddingChange || onFlexDirectionChange || onBackgroundOpacityChange) && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Layout
              </h4>

              {onBackgroundOpacityChange && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Background Opacity
                  </label>
                  <input
                    type="text"
                    value={element.backgroundOpacity ?? '1'}
                    onChange={(e) => handleBackgroundOpacityChangeInternal(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                    placeholder="0–1"
                  />
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
}

