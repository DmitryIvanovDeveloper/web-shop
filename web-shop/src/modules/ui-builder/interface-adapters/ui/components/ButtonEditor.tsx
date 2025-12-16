'use client';

import React, { useState } from 'react';
import { ColorInput } from './ColorInput';

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
  onColorChange: (colorKey: 'backgroundColor' | 'textColor' | 'borderColor', value: string) => void;
  
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
  textAlign?: string;
  onTextAlignChange?: (value: string) => void;
  
  // Sections are shown automatically if corresponding handlers are provided
  // No need for showLayout/showPadding/showAction flags
}

export function ButtonEditor({
  backgroundColor,
  textColor,
  borderColor,
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
  textAlign,
  onTextAlignChange,
  width,
  onWidthChange,
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
        </div>
      </div>

      {/* Border Radius */}
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
              disabled={!onBorderRadiusChange}
              className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="0.5"
            />
            <select
              value={borderRadiusUnit}
              onChange={(e) => handleBorderRadiusUnitChange(e.target.value)}
              disabled={!onBorderRadiusChange}
              className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="rem">rem</option>
              <option value="px">px</option>
            </select>
          </div>
        </div>
      </div>

      {/* Width and Padding */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Spacing</h4>
        <div className="space-y-3">
          {/* Width */}
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
                disabled={!onWidthChange}
                className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="200"
              />
              <select
                value={widthUnit}
                onChange={(e) => handleWidthUnitChange(e.target.value)}
                disabled={!onWidthChange}
                className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="px">px</option>
                <option value="rem">rem</option>
                <option value="%">%</option>
                <option value="vw">vw</option>
                <option value="vh">vh</option>
              </select>
            </div>
          </div>

          {/* Padding */}
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
                disabled={!onPaddingChange}
                className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="1"
              />
              <select
                value={paddingUnit}
                onChange={(e) => handlePaddingUnitChange(e.target.value)}
                disabled={!onPaddingChange}
                className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="rem">rem</option>
                <option value="px">px</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Text Align */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Layout</h4>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Text Alignment
          </label>
          <select
            value={textAlign || 'center'}
            onChange={(e) => onTextAlignChange?.(e.target.value)}
            disabled={!onTextAlignChange}
            className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>

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
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Icon (emoji, symbol or image)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={icon || ''}
              onChange={(e) => handleIconValueChange(e.target.value)}
              disabled={!onIconChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="🛒 or data:image/png;base64,..."
            />
            {icon && onIconChange && (
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
          {onIconChange && (
            <>
              <div className="flex items-center gap-2 mt-2">
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
            </>
          )}
        </div>

        {/* Navigate to Page */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Navigate to Page
          </label>
          <select
            value={pageSlug || ''}
            onChange={(e) => onPageSlugChange?.(e.target.value || null)}
            disabled={!onPageSlugChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">No navigation (use custom action)</option>
            {pages.map((page) => (
              <option key={page} value={page}>
                {page}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-gray-500 mt-1">
            Select a page to navigate to when button is clicked. URL will be /{'{'}pageSlug{'}'}
          </p>
        </div>

        {/* Action (URL or function) */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Action (URL or function)
          </label>
          <input
            type="text"
            value={onClick || ''}
            onChange={(e) => onActionChange?.(e.target.value)}
            disabled={!onActionChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="/shop"
          />
          <p className="text-[10px] text-gray-500 mt-1">
            Custom action (used if no page is selected above)
          </p>
        </div>
      </div>
    </div>
  );
}

