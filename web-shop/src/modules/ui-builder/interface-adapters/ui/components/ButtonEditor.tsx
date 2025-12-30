'use client';

import React, { useState } from 'react';
import { ColorInput } from './ColorInput';

// Generic size helpers (px / rem)
const parseSize = (
  size: string | number | undefined,
  defaultUnit: 'px' | 'rem' = 'px'
): { value: string; unit: 'px' | 'rem' } => {
  if (size === undefined || size === null || size === '') {
    return { value: '', unit: defaultUnit };
  }
  const str = typeof size === 'number' ? `${size}${defaultUnit}` : size.toString().trim();
  const match = str.match(/^([\d.,]+)\s*(px|rem)?$/i);
  if (match) {
    return {
      value: match[1],
      unit: (match[2]?.toLowerCase() as 'px' | 'rem') || defaultUnit,
    };
  }
  const numericMatch = str.match(/([\d.,]+)/);
  return {
    value: numericMatch ? numericMatch[1] : '',
    unit: defaultUnit,
  };
};

const buildSize = (value: string, unit: 'px' | 'rem'): string => {
  const normalized = value.trim();
  if (!normalized) return '';
  return `${normalized.replace(',', '.')}${unit}`;
};

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

export interface ButtonEditorProps {
  // Colors
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  hoverBackgroundColor?: string;
  onColorChange: (colorKey: 'backgroundColor' | 'textColor' | 'borderColor' | 'hoverBackgroundColor', value: string) => void;

  // Content
  label: string;
  onLabelChange: (value: string) => void;

  // Icon
  icon?: string | null;
  onIconChange?: (value: string | null) => void;

  // Navigation
  pageSlug?: string | null;
  onPageSlugChange?: (value: string | null) => void;
  pages?: string[];

  // Action
  onClick?: string;
  onActionChange?: (value: string) => void;

  // Layout (for sidebar buttons)
  borderRadius?: string;
  onBorderRadiusChange?: (value: string) => void;
  padding?: string;
  onPaddingChange?: (value: string) => void;
  width?: string;
  onWidthChange?: (value: string) => void;
  maxHeight?: string;
  onMaxHeightChange?: (value: string) => void;
  textAlign?: string;
  onTextAlignChange?: (value: string) => void;

  // Typography
  fontSize?: string;
  onFontSizeChange?: (value: string) => void;
  fontWeight?: string;
  onFontWeightChange?: (value: string) => void;
  minHeight?: string;
  onMinHeightChange?: (value: string) => void;

  // Sections are shown automatically if corresponding handlers are provided
  // No need for showLayout/showPadding/showAction flags
}

export function ButtonEditor({
  backgroundColor,
  textColor,
  borderColor,
  hoverBackgroundColor,
  onColorChange,
  label,
  onLabelChange,
  icon,
  onIconChange,
  pageSlug,
  onPageSlugChange,
  pages = [],
  onClick,
  onActionChange,
  borderRadius,
  onBorderRadiusChange,
  padding,
  onPaddingChange,
  width,
  onWidthChange,
  maxHeight,
  onMaxHeightChange,
  textAlign,
  onTextAlignChange,
  fontSize,
  onFontSizeChange,
  fontWeight,
  onFontWeightChange,
  minHeight,
  onMinHeightChange,
}: ButtonEditorProps): JSX.Element {
  const [isIconUploading, setIsIconUploading] = useState(false);
  const hasImageIcon = Boolean(icon && icon.startsWith('data:image'));

  const handleIconValueChange = (value: string) => {
    if (onIconChange) {
      const normalized = value.trim();
      onIconChange(normalized.length > 0 ? normalized : null);
    }
  };

  const handleIconFileUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
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
      onIconChange(base64);
    } catch {
      // ignore upload errors for now
    } finally {
      setIsIconUploading(false);
      event.target.value = '';
    }
  };

  const handleIconClear = () => {
    if (onIconChange) {
      onIconChange(null);
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

  const { value: borderRadiusValue, unit: borderRadiusUnit } = parseBorderRadius(borderRadius || '0.5rem');

  const handleBorderRadiusValueChange = (newValue: string) => {
    if (onBorderRadiusChange) {
      onBorderRadiusChange(`${newValue}${borderRadiusUnit}`);
    }
  };

  const handleBorderRadiusUnitChange = (newUnit: string) => {
    if (onBorderRadiusChange) {
      onBorderRadiusChange(`${borderRadiusValue}${newUnit}`);
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

  const { value: paddingValue, unit: paddingUnit } = parsePadding(padding || '1rem');

  const handlePaddingValueChange = (newValue: string) => {
    if (onPaddingChange) {
      onPaddingChange(`${newValue}${paddingUnit}`);
    }
  };

  const handlePaddingUnitChange = (newUnit: string) => {
    if (onPaddingChange) {
      onPaddingChange(`${paddingValue}${newUnit}`);
    }
  };

  // Parse width value and unit
  const parseWidth = (widthString: string | number | undefined): { value: number; unit: string } => {
    if (!widthString || widthString === '') return { value: 100, unit: '%' };
    const width = typeof widthString === 'number' ? `${widthString}px` : widthString;
    const match = width.match(/^([\d.]+)(rem|px|%|vw|vh)$/);
    if (match) {
      return { value: parseFloat(match[1]), unit: match[2] };
    }
    return { value: 100, unit: '%' };
  };

  const { value: widthValue, unit: widthUnit } = parseWidth(width);

  const handleWidthValueChange = (newValue: string) => {
    if (onWidthChange) {
      onWidthChange(`${newValue}${widthUnit}`);
    }
  };

  const handleWidthUnitChange = (newUnit: string) => {
    if (onWidthChange) {
      onWidthChange(`${widthValue}${newUnit}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Colors Section */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Colors</h4>
        <div className="space-y-3">
          <ColorInput
            label="backgroundColor"
            value={backgroundColor}
            onChange={(newColor) => onColorChange('backgroundColor', newColor)}
          />
          <ColorInput
            label="textColor"
            value={textColor}
            onChange={(newColor) => onColorChange('textColor', newColor)}
          />
          <ColorInput
            label="borderColor"
            value={borderColor}
            onChange={(newColor) => onColorChange('borderColor', newColor)}
          />
          {hoverBackgroundColor !== undefined && (
            <ColorInput
              label="hoverBackgroundColor"
              value={hoverBackgroundColor}
              onChange={(newColor) => onColorChange('hoverBackgroundColor', newColor)}
            />
          )}
        </div>
      </div>

      {/* Border Radius */}
      {onBorderRadiusChange && (
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

      {/* Spacing */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Spacing</h4>
        <div className="space-y-3">
          {/* Width */}
          {onWidthChange && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Width
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={widthValue}
                  onChange={(e) => handleWidthValueChange(e.target.value)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="200"
                />
                <select
                  value={widthUnit}
                  onChange={(e) => handleWidthUnitChange(e.target.value)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="px">px</option>
                  <option value="rem">rem</option>
                  <option value="%">%</option>
                  <option value="vw">vw</option>
                  <option value="vh">vh</option>
                </select>
              </div>
            </div>
          )}

          {/* Max Height */}
          {onMaxHeightChange && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Max Height
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={parseSize(maxHeight).value}
                  onChange={(e) => {
                    const currentUnit = parseSize(maxHeight).unit;
                    onMaxHeightChange?.(buildSize(e.target.value, currentUnit));
                  }}
                  className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="200"
                />
                <select
                  value={parseSize(maxHeight).unit}
                  onChange={(e) => {
                    const currentValue = parseSize(maxHeight).value;
                    onMaxHeightChange?.(buildSize(currentValue, e.target.value as 'px' | 'rem'));
                  }}
                  className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="px">px</option>
                  <option value="rem">rem</option>
                  <option value="%">%</option>
                  <option value="vw">vw</option>
                  <option value="vh">vh</option>
                </select>
              </div>
            </div>
          )}

          {/* Min Height */}
          {onMinHeightChange && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Min Height
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={parseSize(minHeight).value}
                  onChange={(e) => {
                    const currentUnit = parseSize(minHeight).unit;
                    onMinHeightChange?.(buildSize(e.target.value, currentUnit));
                  }}
                  className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="44"
                />
                <select
                  value={parseSize(minHeight).unit}
                  onChange={(e) => {
                    const currentValue = parseSize(minHeight).value;
                    onMinHeightChange?.(buildSize(currentValue, e.target.value as 'px' | 'rem'));
                  }}
                  className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="px">px</option>
                  <option value="rem">rem</option>
                </select>
              </div>
            </div>
          )}

          {/* Padding */}
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
        </div>
      </div>

      {/* Typography */}
      {(onFontSizeChange || onFontWeightChange) && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Typography</h4>
          <div className="space-y-3">
            {/* Font Size */}
            {onFontSizeChange && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Font Size
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={parseSize(fontSize).value}
                    onChange={(e) => {
                      const currentUnit = parseSize(fontSize).unit;
                      onFontSizeChange?.(buildSize(e.target.value, currentUnit));
                    }}
                    className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="16"
                  />
                  <select
                    value={parseSize(fontSize).unit}
                    onChange={(e) => {
                      const currentValue = parseSize(fontSize).value;
                      onFontSizeChange?.(buildSize(currentValue, e.target.value as 'px' | 'rem'));
                    }}
                    className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                  >
                    <option value="px">px</option>
                    <option value="rem">rem</option>
                  </select>
                </div>
              </div>
            )}

            {/* Font Weight */}
            {onFontWeightChange && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Font Weight
                </label>
                <input
                  type="number"
                  min="100"
                  max="900"
                  step="100"
                  value={fontWeight || ''}
                  onChange={(e) => onFontWeightChange?.(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="500"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Layout */}
      {onTextAlignChange && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Layout</h4>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Text Alignment
            </label>
            <select
              value={textAlign || 'center'}
              onChange={(e) => onTextAlignChange?.(e.target.value)}
              className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      )}

      {/* Content editor for buttons */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Content</h4>

        {/* Label */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Button Text
          </label>
          <input
            type="text"
            value={label || ''}
            onChange={(e) => onLabelChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Click"
          />
        </div>

        {/* Icon */}
        {onIconChange && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Icon (emoji, symbol or image)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={icon || ''}
                onChange={(e) => handleIconValueChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                placeholder="🛒 or data:image/png;base64,..."
              />
              {icon && (
                <button
                  type="button"
                  onClick={handleIconClear}
                  className="px-2 py-1 text-xs text-gray-500 border border-gray-300 rounded hover:bg-gray-50"
                  title="Remove icon"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <label className={`inline-flex px-3 py-2 border border-gray-300 rounded text-xs ${
                isIconUploading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
              }`}>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isIconUploading}
                  onChange={handleIconFileUpload}
                />
                {isIconUploading ? '📤 Uploading…' : '📤 Upload Icon'}
              </label>
              {icon && (
                hasImageIcon ? (
                  <img
                    src={icon}
                    alt="Button icon preview"
                    className="w-10 h-10 object-contain rounded border border-gray-200"
                  />
                ) : (
                  <span className="text-xl leading-none">{icon}</span>
                )
              )}
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              The image is saved as base64 directly in the config. You can also use an emoji or a text symbol.
            </p>
          </div>
        )}

        {/* Navigate to Page */}
        {onPageSlugChange && pages && pages.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Navigate to Page
            </label>
            <select
              value={pageSlug || ''}
              onChange={(e) => onPageSlugChange?.(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">No navigation (use custom action)</option>
              {pages.map((page) => (
                <option key={page} value={page}>
                  {page}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-gray-500 mt-1">
              Select a page to navigate to when button is clicked. URL will be /{pageSlug}
            </p>
          </div>
        )}

        {/* Action (URL or function) */}
        {onActionChange && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Action (URL or function)
            </label>
            <input
              type="text"
              value={onClick || ''}
              onChange={(e) => onActionChange?.(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="/shop"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Custom action (used if no page is selected above)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}