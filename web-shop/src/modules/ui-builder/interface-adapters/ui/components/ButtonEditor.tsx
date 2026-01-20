'use client';

import React from 'react';
import { ColorInput } from './ColorInput';
import { Home, ShoppingBag, Gift, Star, Newspaper, RefreshCw, PartyPopper, Upload } from 'lucide-react';
import { LUCIDE_ICON_NAMES } from '../../../infrastructure/utils/icon-to-svg';

const ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  store: ShoppingBag,
  gift: Gift,
  star: Star,
  newspaper: Newspaper,
  refreshCw: RefreshCw,
  partyPopper: PartyPopper,
};

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

  iconSize?: string;
  onIconSizeChange?: (value: string) => void;

  iconGap?: string;
  onIconGapChange?: (value: string) => void;

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

  flexDirection?: string;
  onFlexDirectionChange?: (value: string) => void;

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
  iconSize,
  onIconSizeChange,
  iconGap,
  onIconGapChange,
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
  flexDirection,
  onFlexDirectionChange,
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

        {/* Icon selector */}
        {onIconChange && (
          <div className="space-y-3">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Icon
            </label>
            
            {/* Icon preview */}
            {icon && (
              <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded bg-white">
                  {(() => {
                    const iconSizeStyle = iconSize ? { width: iconSize, height: iconSize } : { width: '16px', height: '16px' };
                    const IconComponent = ICON_COMPONENTS[icon];
                    if (IconComponent) {
                      return <IconComponent className="w-4 h-4" style={iconSizeStyle} />;
                    }
                    if (icon.startsWith('data:image') || icon.startsWith('http')) {
                      return <img src={icon} alt="Icon" className="w-4 h-4" style={iconSizeStyle} />;
                    }
                    return <span className="text-xs text-gray-400">{icon}</span>;
                  })()}
                </div>
                <span className="text-xs text-gray-600 font-mono flex-1 truncate">
                  {icon.length > 50 ? `${icon.substring(0, 50)}...` : icon}
                </span>
                <button
                  type="button"
                  onClick={() => onIconChange?.(null)}
                  className="px-2 py-1 text-xs text-gray-500 border border-gray-300 rounded hover:bg-gray-50"
                  title="Remove icon"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Icon Size */}
            {onIconSizeChange && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Icon Size
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={iconSize || '16px'}
                    onChange={(e) => onIconSizeChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                    placeholder="16px"
                  />
                  <select
                    value={iconSize || '16px'}
                    onChange={(e) => onIconSizeChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                  >
                    <option value="12px">12px (Small)</option>
                    <option value="16px">16px (Default)</option>
                    <option value="20px">20px (Medium)</option>
                    <option value="24px">24px (Large)</option>
                    <option value="32px">32px (XLarge)</option>
                  </select>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Set icon size (e.g., 16px, 1rem, 1.5rem)
                </p>
              </div>
            )}

            {/* Icon Gap */}
            {onIconGapChange && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Gap Between Icon & Text
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={iconGap || '8px'}
                    onChange={(e) => onIconGapChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                    placeholder="8px"
                  />
                  <select
                    value={iconGap || '8px'}
                    onChange={(e) => onIconGapChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                  >
                    <option value="0px">0px (No gap)</option>
                    <option value="4px">4px (Small)</option>
                    <option value="8px">8px (Default)</option>
                    <option value="12px">12px (Medium)</option>
                    <option value="16px">16px (Large)</option>
                    <option value="24px">24px (XLarge)</option>
                  </select>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Set gap between icon and text (e.g., 8px, 0.5rem, 1rem)
                </p>
              </div>
            )}

          {/* Icon & text layout */}
          {onFlexDirectionChange && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Icon & Text Layout
              </label>
              <select
                value={flexDirection || 'row'}
                onChange={(e) => onFlexDirectionChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="row">Icon left, text right</option>
                <option value="row-reverse">Icon right, text left</option>
                <option value="column">Icon above text</option>
              </select>
            </div>
          )}

            {/* Lucide Icons Selection */}
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 uppercase tracking-wide">
                Choose from Lucide Icons
              </label>
              <div className="grid grid-cols-7 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {LUCIDE_ICON_NAMES.map((iconOption) => {
                  const IconComponent = ICON_COMPONENTS[iconOption.id];
                  const isSelected = icon === iconOption.id;
                  return (
                    <button
                      key={iconOption.id}
                      type="button"
                      onClick={() => onIconChange?.(iconOption.id)}
                      className={`flex flex-col items-center justify-center p-2 border rounded-lg transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      title={iconOption.label}
                    >
                      {IconComponent && <IconComponent className="w-4 h-4 text-gray-700" />}
                      <span className="text-[10px] text-gray-500 mt-1 truncate w-full text-center">
                        {iconOption.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Upload Custom Icon */}
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 uppercase tracking-wide">
                Upload Your Own Icon
              </label>
              <div className="space-y-2">
                {/* File upload */}
                <div>
                  <input
                    type="file"
                    accept="image/svg+xml,image/png,image/jpeg,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const result = event.target?.result;
                          if (typeof result === 'string') {
                            if (file.type === 'image/svg+xml') {
                              // Convert SVG to data URI
                              const svgDataUri = `data:image/svg+xml;base64,${btoa(result)}`;
                              onIconChange?.(svgDataUri);
                            } else {
                              // For other image types, use the result directly (already base64)
                              onIconChange?.(result);
                            }
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                    id="icon-file-input"
                  />
                  <label
                    htmlFor="icon-file-input"
                    className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm text-center border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Image File
                  </label>
                </div>

                {/* URL input */}
                <div>
                  <input
                    type="text"
                    value={icon && !icon.startsWith('data:image') && !icon.startsWith('http') && !LUCIDE_ICON_NAMES.some((opt) => icon === opt.id) ? icon : (icon && (icon.startsWith('http') || icon.startsWith('data:image')) ? icon : '')}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      onIconChange?.(value.length > 0 ? value : null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                    placeholder="https://example.com/icon.svg"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Enter image URL (SVG, PNG, JPG, GIF) or custom identifier
                  </p>
                </div>
              </div>
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

