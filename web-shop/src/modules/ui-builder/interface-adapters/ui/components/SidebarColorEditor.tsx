'use client';

import React, { useState } from 'react';
import type { SelectedElement } from '../../../domain/types/sidebar-element.types';

interface SidebarColorEditorProps {
  element: SelectedElement | null;
  onChange: (elementId: string, colors: Record<string, string>) => void;
  onGapChange?: (elementId: string, gap: string) => void;
  onPaddingChange?: (elementId: string, padding: string) => void;
  onBorderRadiusChange?: (elementId: string, borderRadius: string) => void;
  onLabelChange?: (elementId: string, label: string) => void;
  onTextAlignChange?: (elementId: string, textAlign: string) => void;
  onFlexDirectionChange?: (elementId: string, flexDirection: string) => void;
  onIconChange?: (elementId: string, icon: string | null) => void;
  onBackgroundOpacityChange?: (elementId: string, opacity: string) => void;
  onPageSlugChange?: (elementId: string, pageSlug: string | null) => void;
  pages?: string[];
}

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };

    reader.onerror = () => {
      reject(reader.error ?? new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};

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

export function SidebarColorEditor({ element, onChange, onGapChange, onPaddingChange, onBorderRadiusChange, onLabelChange, onTextAlignChange, onFlexDirectionChange, onIconChange, onBackgroundOpacityChange, onPageSlugChange, pages = [] }: SidebarColorEditorProps): JSX.Element {
  const [isIconUploading, setIsIconUploading] = useState(false);

  if (!element) {
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

  const handleColorChange = (colorKey: string, newColor: string) => {
    const updatedColors = {
      ...(element.colors ?? {}),
      [colorKey]: newColor,
    };
    onChange(element.id, updatedColors);
  };

  // Parse gap value and unit
  const parseGap = (gapString: string | number | undefined): { value: number; unit: string } => {
    if (!gapString) return { value: 0.5, unit: 'rem' };
    const gap = typeof gapString === 'number' ? `${gapString}px` : gapString;
    const match = gap.match(/^([\d.]+)(rem|px)$/);
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
  const parseBorderRadius = (borderRadiusString: string | number | undefined): { value: number; unit: string } => {
    if (!borderRadiusString) return { value: 0.5, unit: 'rem' };
    const borderRadius = typeof borderRadiusString === 'number' ? `${borderRadiusString}px` : borderRadiusString;
    const match = borderRadius.match(/^([\d.]+)(rem|px)$/);
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

  // Parse padding value and unit
  const parsePadding = (paddingString: string | number | undefined): { value: number; unit: string } => {
    if (!paddingString) return { value: 1, unit: 'rem' };
    const padding = typeof paddingString === 'number' ? `${paddingString}px` : paddingString;
    const match = padding.match(/^([\d.]+)(rem|px)$/);
    if (match) {
      return { value: parseFloat(match[1]), unit: match[2] };
    }
    return { value: 1, unit: 'rem' };
  };

  const { value: paddingValue, unit: paddingUnit } = parsePadding(element.padding || '1rem');

  const handlePaddingValueChange = (newValue: string) => {
    if (onPaddingChange) {
      onPaddingChange(element.id, `${newValue}${paddingUnit}`);
    }
  };

  const handlePaddingUnitChange = (newUnit: string) => {
    if (onPaddingChange) {
      onPaddingChange(element.id, `${paddingValue}${newUnit}`);
    }
  };

  const handleIconValueChange = (value: string) => {
    if (onIconChange) {
      const normalized = value.trim();
      onIconChange(element.id, normalized.length > 0 ? normalized : null);
    }
  };

  const handleIconFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!onIconChange) {
      return;
    }

    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsIconUploading(true);

    try {
      const base64 = await readFileAsDataUrl(file);
      onIconChange(element.id, base64);
    } catch {
      // ignore upload errors for now
    } finally {
      setIsIconUploading(false);
      event.target.value = '';
    }
  };

  const handleIconClear = () => {
    if (onIconChange) {
      onIconChange(element.id, null);
    }
  };

  const isContainer = element.type === 'Container' || element.id.includes('container');
  const isButton = element.type === 'Button' || element.id.includes('button');
  const hasImageIcon = Boolean(element.icon && element.icon.startsWith('data:image'));
  const backgroundOpacityRaw = element.backgroundOpacity ?? '1';
  const parsedBackgroundOpacity = Number.parseFloat(backgroundOpacityRaw);
  const backgroundOpacity = Number.isNaN(parsedBackgroundOpacity) ? 1 : parsedBackgroundOpacity;

  const handleBackgroundOpacityChange = (newValue: string) => {
    if (onBackgroundOpacityChange) {
      const numeric = Number.parseFloat(newValue);
      if (Number.isNaN(numeric)) {
        return;
      }
      const clamped = Math.min(1, Math.max(0, numeric));
      onBackgroundOpacityChange(element.id, clamped.toString());
    }
  };

  const renderIconEditor = (): JSX.Element | null => {
    if (!onIconChange) {
      return null;
    }

    return (
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          Icon
        </h4>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Icon Value
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={element.icon || ''}
              onChange={(e) => handleIconValueChange(e.target.value)}
              className="w-48 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Emoji or data URL"
            />
            {element.icon && (
              <button
                type="button"
                onClick={handleIconClear}
                className="px-2 py-1 border border-gray-300 rounded text-xs text-gray-500 hover:bg-gray-50"
                title="Remove icon"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Icon Upload
          </label>
          <div className="flex items-center gap-2">
            <label
              className={`inline-flex px-3 py-2 border border-gray-300 rounded text-xs ${
                isIconUploading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
              }`}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isIconUploading}
                onChange={handleIconFileUpload}
              />
              {isIconUploading ? '📤 Uploading…' : '📤 Upload Icon'}
            </label>
            {element.icon && (
              hasImageIcon ? (
                <img
                  src={element.icon}
                  alt="Icon preview"
                  className="w-10 h-10 object-contain rounded border border-gray-200"
                />
              ) : (
                <span className="text-xl leading-none">{element.icon}</span>
              )
            )}
          </div>
          <p className="text-[10px] text-gray-500">
            Можно использовать emoji, текстовые символы или загрузить PNG/SVG — изображение сохраняется как base64 в конфиге.
          </p>
        </div>
      </div>
    );
  };

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

        {/* Layout editor for containers */}
        {isContainer && (onGapChange || onPaddingChange || onFlexDirectionChange || onBackgroundOpacityChange) && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Layout</h4>
            {onBackgroundOpacityChange && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Background Opacity
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={backgroundOpacity}
                    onChange={(e) => handleBackgroundOpacityChange(e.target.value)}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={backgroundOpacity.toFixed(2)}
                    onChange={(e) => handleBackgroundOpacityChange(e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                  />
                </div>
                <p className="text-[10px] text-gray-500">
                  Значение от 0 до 1. Применяется только к фону контейнера, не затрагивает вложенные элементы.
                </p>
              </div>
            )}
            {onGapChange && (
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
            )}

            {onPaddingChange && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Padding
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={paddingValue}
                    onChange={(e) => handlePaddingValueChange(e.target.value)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="1"
                  />
                  <select
                    value={paddingUnit}
                    onChange={(e) => handlePaddingUnitChange(e.target.value)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                  >
                    <option value="rem">rem</option>
                    <option value="px">px</option>
                  </select>
                </div>
              </div>
            )}

            {onFlexDirectionChange && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Direction
                </label>
                <select
                  value={element.flexDirection || 'row'}
                  onChange={(e) => onFlexDirectionChange(element.id, e.target.value)}
                  className="w-48 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="row">Horizontal (row)</option>
                  <option value="column">Vertical (column)</option>
                </select>
              </div>
            )}
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

        {/* Spacing editor for buttons */}
        {isButton && onPaddingChange && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Spacing</h4>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Padding
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={paddingValue}
                  onChange={(e) => handlePaddingValueChange(e.target.value)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="1"
                />
                <select
                  value={paddingUnit}
                  onChange={(e) => handlePaddingUnitChange(e.target.value)}
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
        {isButton && (onLabelChange || onTextAlignChange || onPageSlugChange) && (
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

            {/* Navigate to Page */}
            {onPageSlugChange && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Navigate to Page
                </label>
                <select
                  value={(element as any).pageSlug || ''}
                  onChange={(e) => onPageSlugChange(element.id, e.target.value || null)}
                  className="w-48 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="">No navigation</option>
                  {pages.map((pageSlug) => (
                    <option key={pageSlug} value={pageSlug}>
                      {pageSlug}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-1">
                  Select a page to navigate to when button is clicked. URL will be /{'{'}pageSlug{'}'}
                </p>
              </div>
            )}
          </div>
        )}

        {renderIconEditor()}
      </div>
    </div>
  );
}












