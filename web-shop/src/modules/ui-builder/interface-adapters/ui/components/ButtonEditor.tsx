'use client';

import React from 'react';
import { ColorInput } from './ColorInput';

export interface ButtonEditorProps {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  hoverBackgroundColor?: string;
  onColorChange: (
    colorKey: 'backgroundColor' | 'textColor' | 'borderColor' | 'hoverBackgroundColor',
    value: string,
  ) => void;

  label: string;
  onLabelChange: (value: string) => void;

  icon?: string | null;
  onIconChange?: (value: string | null) => void;

  pageSlug?: string | null;
  onPageSlugChange?: (value: string | null) => void;
  pages?: string[];

  onClick?: string;
  onActionChange?: (value: string) => void;

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

  fontSize?: string;
  onFontSizeChange?: (value: string) => void;
  fontWeight?: string;
  onFontWeightChange?: (value: string) => void;
  minHeight?: string;
  onMinHeightChange?: (value: string) => void;
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
  return (
    <div className="space-y-6">
      {/* Colors */}
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
          <ColorInput
            label="hoverBackgroundColor"
            value={hoverBackgroundColor || '#5C6BC0'}
            onChange={(newColor) => onColorChange('hoverBackgroundColor', newColor)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Content</h4>

        {/* Button text */}
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

        {/* Icon as text/base64 */}
        {onIconChange && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Icon (emoji, symbol or image URL/base64)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={icon || ''}
                onChange={(e) =>
                  onIconChange?.(e.target.value.trim().length > 0 ? e.target.value : null)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                placeholder="🛒 or https://... or data:image/png;base64,..."
              />
              {icon && (
                <button
                  type="button"
                  onClick={() => onIconChange?.(null)}
                  className="px-2 py-1 text-xs text-gray-500 border border-gray-300 rounded hover:bg-gray-50"
                  title="Remove icon"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Spacing & layout (simplified, just raw strings) */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Layout</h4>

        {onWidthChange && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Width
            </label>
            <input
              type="text"
              value={width || ''}
              onChange={(e) => onWidthChange?.(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="e.g. 200px or 100%"
            />
          </div>
        )}

        {onMaxHeightChange && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Max Height
            </label>
            <input
              type="text"
              value={maxHeight || ''}
              onChange={(e) => onMaxHeightChange?.(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="e.g. 48px"
            />
          </div>
        )}

        {onMinHeightChange && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Min Height
            </label>
            <input
              type="text"
              value={minHeight || ''}
              onChange={(e) => onMinHeightChange?.(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="e.g. 44px"
            />
          </div>
        )}

        {onPaddingChange && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Padding
            </label>
            <input
              type="text"
              value={padding || ''}
              onChange={(e) => onPaddingChange?.(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="e.g. 0.75rem 1.5rem"
            />
          </div>
        )}

        {onBorderRadiusChange && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Border Radius
            </label>
            <input
              type="text"
              value={borderRadius || ''}
              onChange={(e) => onBorderRadiusChange?.(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="e.g. 0.5rem"
            />
          </div>
        )}

        {onTextAlignChange && (
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
        )}
      </div>

      {/* Typography */}
      {(onFontSizeChange || onFontWeightChange) && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Typography
          </h4>
          <div className="space-y-3">
            {onFontSizeChange && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Font Size
                </label>
                <input
                  type="text"
                  value={fontSize || ''}
                  onChange={(e) => onFontSizeChange?.(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                  placeholder="e.g. 14px"
                />
              </div>
            )}

            {onFontWeightChange && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Font Weight
                </label>
                <input
                  type="text"
                  value={fontWeight || ''}
                  onChange={(e) => onFontWeightChange?.(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                  placeholder="e.g. 500"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation and actions */}
      <div className="space-y-3">
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
              Select a page to navigate to when button is clicked. URL will be /{'{pageSlug}'}.
            </p>
          </div>
        )}

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
              Custom action (used if no page is selected above).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

