'use client';

import React from 'react';
import type { PageSection, SectionLayout } from '../../../domain/entities/page-section.entity';

interface SectionEditorProps {
  section: PageSection;
  onUpdateLayout: (layout: SectionLayout) => void;
  onUpdateStyles: (styles: Record<string, unknown>) => void;
  onRemove: () => void;
}

export function SectionEditor({ section, onUpdateLayout, onUpdateStyles, onRemove }: SectionEditorProps): JSX.Element {
  const [uploading, setUploading] = React.useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB for base64 storage)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Convert file to base64
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read file as base64'));
          }
        };
        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsDataURL(file);
      });

      // Update styles with base64 image
      const newStyles = { ...section.styles };
      newStyles.backgroundImage = `url("${base64String}")`;
      if (!newStyles.backgroundSize) {
        newStyles.backgroundSize = 'cover';
      }
      if (!newStyles.backgroundPosition) {
        newStyles.backgroundPosition = 'center';
      }
      if (!newStyles.backgroundRepeat) {
        newStyles.backgroundRepeat = 'no-repeat';
      }

      onUpdateStyles(newStyles);
    } catch (error) {
      console.error('Error converting file to base64:', error);
      alert(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Section Settings</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {section.type.charAt(0).toUpperCase() + section.type.slice(1)}
          </p>
        </div>
        <button
          onClick={onRemove}
          className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
          title="Remove section"
        >
          🗑️ Remove
        </button>
      </div>

      {/* Layout Settings */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Layout</h4>

        {/* Grid Layout */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Grid Columns
          </label>
          <select
            value={section.layout.grid}
            onChange={(e) => onUpdateLayout({ ...section.layout, grid: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="1-column">1 Column</option>
            <option value="2-column">2 Columns</option>
            <option value="3-column">3 Columns</option>
            <option value="4-column">4 Columns</option>
          </select>
        </div>

        {/* Gap */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Gap Between Items
          </label>
          <div className="flex items-center gap-2">
            {(() => {
              // Parse gap value and unit
              const parseGap = (gapString: string | number | undefined): { value: number; unit: string } => {
                if (!gapString) return { value: 1, unit: 'rem' };
                const gap = typeof gapString === 'number' ? `${gapString}px` : gapString;
                
                // Try to match simple single value (e.g., "1rem", "20px")
                const match = gap.match(/^([\d.]+)\s*(rem|px|em|%)$/);
                if (match) {
                  return { value: parseFloat(match[1]), unit: match[2] };
                }
                
                // Default fallback
                return { value: 1, unit: 'rem' };
              };

              const { value: gapValue, unit: gapUnit } = parseGap(section.layout.gap);

              const handleGapValueChange = (newValue: string): void => {
                const newLayout = { ...section.layout };
                if (newValue) {
                  newLayout.gap = `${newValue}${gapUnit}`;
                } else {
                  newLayout.gap = '1rem';
                }
                onUpdateLayout(newLayout);
              };

              const handleGapUnitChange = (newUnit: string): void => {
                const newLayout = { ...section.layout };
                newLayout.gap = `${gapValue}${newUnit}`;
                onUpdateLayout(newLayout);
              };

              return (
                <>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={gapValue}
                    onChange={(e) => handleGapValueChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                    placeholder="1"
                  />
                  <select
                    value={gapUnit}
                    onChange={(e) => handleGapUnitChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="px">px</option>
                    <option value="rem">rem</option>
                    <option value="em">em</option>
                    <option value="%">%</option>
                  </select>
                </>
              );
            })()}
          </div>
          <p className="text-xs text-gray-400 mt-1">Examples: 1rem, 20px, 2em</p>
        </div>

        {/* Alignment */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Item Alignment
          </label>
          <select
            value={section.layout.align || 'start'}
            onChange={(e) => onUpdateLayout({ ...section.layout, align: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="start">Start (Top)</option>
            <option value="center">Center</option>
            <option value="end">End (Bottom)</option>
          </select>
        </div>
      </div>

      {/* Style Settings */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Styles</h4>

        {/* Background Color */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Background Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={(section.styles?.backgroundColor as string) || '#ffffff'}
              onChange={(e) => onUpdateStyles({ ...section.styles, backgroundColor: e.target.value })}
              className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={(section.styles?.backgroundColor as string) || '#ffffff'}
              onChange={(e) => onUpdateStyles({ ...section.styles, backgroundColor: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="#ffffff"
            />
          </div>
        </div>

        {/* Border */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Border
          </label>
          
          {/* Border Width */}
          <div className="mb-2">
            <div className="flex items-center gap-2">
              {(() => {
                const parseBorderWidth = (borderWidthString: string | number | undefined): { value: number; unit: string } => {
                  if (!borderWidthString) return { value: 0, unit: 'px' };
                  const borderWidth = typeof borderWidthString === 'number' ? `${borderWidthString}px` : borderWidthString;
                  const match = borderWidth.match(/^([\d.]+)\s*(px|rem|em)$/);
                  if (match) {
                    return { value: parseFloat(match[1]), unit: match[2] };
                  }
                  return { value: 0, unit: 'px' };
                };

                const { value: borderWidthValue, unit: borderWidthUnit } = parseBorderWidth(section.styles?.borderWidth as string | number | undefined);

                const handleBorderWidthValueChange = (newValue: string): void => {
                  const newStyles = { ...section.styles };
                  if (newValue) {
                    newStyles.borderWidth = `${newValue}${borderWidthUnit}`;
                  } else {
                    delete newStyles.borderWidth;
                  }
                  onUpdateStyles(newStyles);
                };

                const handleBorderWidthUnitChange = (newUnit: string): void => {
                  const newStyles = { ...section.styles };
                  newStyles.borderWidth = `${borderWidthValue}${newUnit}`;
                  onUpdateStyles(newStyles);
                };

                return (
                  <>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={borderWidthValue}
                      onChange={(e) => handleBorderWidthValueChange(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                      placeholder="0"
                    />
                    <select
                      value={borderWidthUnit}
                      onChange={(e) => handleBorderWidthUnitChange(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="px">px</option>
                      <option value="rem">rem</option>
                      <option value="em">em</option>
                    </select>
                  </>
                );
              })()}
            </div>
            <label className="text-xs text-gray-500 mt-1 block">Width</label>
          </div>

          {/* Border Style */}
          <div className="mb-2">
            <select
              value={(section.styles?.borderStyle as string) || 'none'}
              onChange={(e) => {
                const newStyles = { ...section.styles };
                if (e.target.value !== 'none') {
                  newStyles.borderStyle = e.target.value;
                } else {
                  delete newStyles.borderStyle;
                }
                onUpdateStyles(newStyles);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="none">None</option>
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="double">Double</option>
              <option value="groove">Groove</option>
              <option value="ridge">Ridge</option>
              <option value="inset">Inset</option>
              <option value="outset">Outset</option>
            </select>
            <label className="text-xs text-gray-500 mt-1 block">Style</label>
          </div>

          {/* Border Color */}
          <div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={(section.styles?.borderColor as string) || '#000000'}
                onChange={(e) => onUpdateStyles({ ...section.styles, borderColor: e.target.value })}
                className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={(section.styles?.borderColor as string) || '#000000'}
                onChange={(e) => onUpdateStyles({ ...section.styles, borderColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                placeholder="#000000"
              />
            </div>
            <label className="text-xs text-gray-500 mt-1 block">Color</label>
          </div>
        </div>

        {/* Background Image */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Background Image
          </label>
          
          {/* URL Input */}
          <div className="mb-2">
            <input
              type="text"
              value={(() => {
                const bgImage = (section.styles?.backgroundImage as string) || '';
                // Remove url("...") wrapper if present for editing
                if (bgImage.startsWith('url("') && bgImage.endsWith('")')) {
                  const content = bgImage.slice(5, -2);
                  // If it's base64, show a shorter indicator
                  if (content.startsWith('data:image/')) {
                    const match = content.match(/data:image\/([^;]+);base64,/);
                    const type = match ? match[1] : 'image';
                    return `[Base64 ${type.toUpperCase()} - ${Math.round(content.length / 1024)}KB]`;
                  }
                  return content;
                }
                return bgImage;
              })()}
              onChange={(e) => {
                const url = e.target.value.trim();
                const newStyles = { ...section.styles };
                
                // Don't update if it's the base64 indicator
                if (url.startsWith('[Base64')) {
                  return;
                }
                
                if (url) {
                  // Wrap in url("...") format for CSS
                  newStyles.backgroundImage = `url("${url}")`;
                  // Add background size and position defaults for better UX
                  if (!newStyles.backgroundSize) {
                    newStyles.backgroundSize = 'cover';
                  }
                  if (!newStyles.backgroundPosition) {
                    newStyles.backgroundPosition = 'center';
                  }
                  if (!newStyles.backgroundRepeat) {
                    newStyles.backgroundRepeat = 'no-repeat';
                  }
                } else {
                  delete newStyles.backgroundImage;
                  delete newStyles.backgroundSize;
                  delete newStyles.backgroundPosition;
                  delete newStyles.backgroundRepeat;
                }
                onUpdateStyles(newStyles);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="https://example.com/image.jpg or upload file below"
              disabled={uploading}
              readOnly={(() => {
                const bgImage = (section.styles?.backgroundImage as string) || '';
                if (bgImage.startsWith('url("data:image/')) {
                  return true; // Read-only for base64 images
                }
                return false;
              })()}
            />
            <p className="text-xs text-gray-400 mt-1">
              {(() => {
                const bgImage = (section.styles?.backgroundImage as string) || '';
                if (bgImage.startsWith('url("data:image/')) {
                  return 'Base64 image stored in page_config. Upload a new file to replace.';
                }
                return 'Enter image URL or upload a file (will be stored as base64 in page_config)';
              })()}
            </p>
          </div>

          {/* File Upload and Clear */}
          <div className="flex items-center gap-2">
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <div className={`px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-center text-gray-700 ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                {uploading ? '📤 Converting...' : '📤 Upload Image (Base64)'}
              </div>
            </label>
            {(section.styles?.backgroundImage as string) && (
              <button
                type="button"
                onClick={() => {
                  const newStyles = { ...section.styles };
                  delete newStyles.backgroundImage;
                  delete newStyles.backgroundSize;
                  delete newStyles.backgroundPosition;
                  delete newStyles.backgroundRepeat;
                  onUpdateStyles(newStyles);
                }}
                className="px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm text-red-600 font-medium transition-colors"
                title="Remove background image"
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* Background Image Options (shown only if background image exists) */}
        {(section.styles?.backgroundImage as string) && (
          <div className="space-y-2 pl-4 border-l-2 border-gray-200">
            {/* Background Size */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">
                Background Size
              </label>
              <select
                value={(section.styles?.backgroundSize as string) || 'cover'}
                onChange={(e) => onUpdateStyles({ ...section.styles, backgroundSize: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="auto">Auto</option>
                <option value="100% 100%">Stretch</option>
              </select>
            </div>

            {/* Background Position */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">
                Background Position
              </label>
              <select
                value={(section.styles?.backgroundPosition as string) || 'center'}
                onChange={(e) => onUpdateStyles({ ...section.styles, backgroundPosition: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="center">Center</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="top left">Top Left</option>
                <option value="top right">Top Right</option>
                <option value="bottom left">Bottom Left</option>
                <option value="bottom right">Bottom Right</option>
              </select>
            </div>
          </div>
        )}

        {/* Height */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Height
          </label>
          <div className="flex items-center gap-2">
            {(() => {
              // Parse height value and unit
              const parseHeight = (heightString: string | number | undefined): { value: number | string; unit: string } => {
                if (!heightString) return { value: '', unit: 'px' };
                const height = typeof heightString === 'number' ? `${heightString}px` : heightString;
                
                // Check for special values like 'auto'
                if (height === 'auto' || height === '100%' || height === 'inherit') {
                  return { value: height, unit: '' };
                }
                
                const match = height.match(/^([\d.]+)(vh|px|rem|em|%)$/);
                if (match) {
                  return { value: parseFloat(match[1]), unit: match[2] };
                }
                return { value: '', unit: 'px' };
              };

              const { value: heightValue, unit: heightUnit } = parseHeight(section.styles?.height as string | number | undefined);

              // If it's a special value (auto, 100%, etc), show as text input
              if (heightUnit === '' && typeof heightValue === 'string') {
                return (
                  <input
                    type="text"
                    value={heightValue}
                    onChange={(e) => {
                      const newStyles = { ...section.styles };
                      if (e.target.value) {
                        newStyles.height = e.target.value;
                      } else {
                        delete newStyles.height;
                      }
                      onUpdateStyles(newStyles);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                    placeholder="auto"
                  />
                );
              }

              const handleHeightValueChange = (newValue: string): void => {
                const newStyles = { ...section.styles };
                if (newValue && heightUnit) {
                  newStyles.height = `${newValue}${heightUnit}`;
                } else {
                  delete newStyles.height;
                }
                onUpdateStyles(newStyles);
              };

              const handleHeightUnitChange = (newUnit: string): void => {
                const newStyles = { ...section.styles };
                if (typeof heightValue === 'number' && newUnit) {
                  newStyles.height = `${heightValue}${newUnit}`;
                }
                onUpdateStyles(newStyles);
              };

              return (
                <>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={typeof heightValue === 'number' ? heightValue : ''}
                    onChange={(e) => handleHeightValueChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                    placeholder="100"
                  />
                  <select
                    value={heightUnit || 'px'}
                    onChange={(e) => handleHeightUnitChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="px">px</option>
                    <option value="rem">rem</option>
                    <option value="em">em</option>
                    <option value="vh">vh</option>
                    <option value="%">%</option>
                  </select>
                </>
              );
            })()}
          </div>
          <p className="text-xs text-gray-400 mt-1">Examples: 400px, 50vh, 10rem, auto</p>
        </div>

        {/* Border Radius */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Border Radius
          </label>
          <div className="flex items-center gap-2">
            {(() => {
              // Parse borderRadius value and unit
              const parseBorderRadius = (borderRadiusString: string | number | undefined): { value: number; unit: string } => {
                if (!borderRadiusString) return { value: 0.5, unit: 'rem' };
                const borderRadius = typeof borderRadiusString === 'number' ? `${borderRadiusString}px` : borderRadiusString;
                const match = borderRadius.match(/^([\d.]+)(rem|px|em|%)$/);
                if (match) {
                  return { value: parseFloat(match[1]), unit: match[2] };
                }
                return { value: 0.5, unit: 'rem' };
              };

              const { value: borderRadiusValue, unit: borderRadiusUnit } = parseBorderRadius(section.styles?.borderRadius as string | number | undefined);

              const handleBorderRadiusValueChange = (newValue: string): void => {
                const newStyles = { ...section.styles };
                if (newValue) {
                  newStyles.borderRadius = `${newValue}${borderRadiusUnit}`;
                } else {
                  delete newStyles.borderRadius;
                }
                onUpdateStyles(newStyles);
              };

              const handleBorderRadiusUnitChange = (newUnit: string): void => {
                const newStyles = { ...section.styles };
                newStyles.borderRadius = `${borderRadiusValue}${newUnit}`;
                onUpdateStyles(newStyles);
              };

              return (
                <>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={borderRadiusValue}
                    onChange={(e) => handleBorderRadiusValueChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                    placeholder="0.5"
                  />
                  <select
                    value={borderRadiusUnit}
                    onChange={(e) => handleBorderRadiusUnitChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="px">px</option>
                    <option value="rem">rem</option>
                    <option value="em">em</option>
                    <option value="%">%</option>
                  </select>
                </>
              );
            })()}
          </div>
          <p className="text-xs text-gray-400 mt-1">Examples: 0.5rem, 8px, 50%</p>
        </div>

        {/* Padding */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Padding
          </label>
          <div className="flex items-center gap-2">
            {(() => {
              // Parse padding value and unit
              const parsePadding = (paddingString: string | number | undefined): { value: number; unit: string } => {
                // Explicitly handle 0 as a valid value
                if (paddingString === 0 || paddingString === '0' || paddingString === '0px' || paddingString === '0rem' || paddingString === '0em' || paddingString === '0%') {
                  // Extract unit if present, default to 'rem'
                  if (typeof paddingString === 'string') {
                    const match = paddingString.match(/^0\s*(rem|px|em|%)?$/);
                    return { value: 0, unit: match && match[1] ? match[1] : 'rem' };
                  }
                  return { value: 0, unit: 'rem' };
                }
                
                if (!paddingString) return { value: 2, unit: 'rem' };
                const padding = typeof paddingString === 'number' ? `${paddingString}px` : paddingString;
                
                // Try to match simple single value (e.g., "2rem", "20px")
                const match = padding.match(/^([\d.]+)\s*(rem|px|em|%)$/);
                if (match) {
                  return { value: parseFloat(match[1]), unit: match[2] };
                }
                
                // Default fallback
                return { value: 2, unit: 'rem' };
              };

              const { value: paddingValue, unit: paddingUnit } = parsePadding(section.styles?.padding as string | number | undefined);

              const handlePaddingValueChange = (newValue: string): void => {
                const newStyles = { ...section.styles };
                // Allow 0 as a valid value - check for empty string specifically
                if (newValue !== '' && newValue !== null && newValue !== undefined) {
                  const numValue = parseFloat(newValue);
                  // Allow 0 or any positive number (including 0)
                  if (!isNaN(numValue) && numValue >= 0) {
                    newStyles.padding = `${newValue}${paddingUnit}`;
                  }
                } else {
                  delete newStyles.padding;
                }
                onUpdateStyles(newStyles);
              };

              const handlePaddingUnitChange = (newUnit: string): void => {
                const newStyles = { ...section.styles };
                newStyles.padding = `${paddingValue}${newUnit}`;
                onUpdateStyles(newStyles);
              };

              return (
                <>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={paddingValue}
                    onChange={(e) => handlePaddingValueChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                    placeholder="2"
                  />
                  <select
                    value={paddingUnit}
                    onChange={(e) => handlePaddingUnitChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="px">px</option>
                    <option value="rem">rem</option>
                    <option value="em">em</option>
                    <option value="%">%</option>
                  </select>
                </>
              );
            })()}
          </div>
          <p className="text-xs text-gray-400 mt-1">Examples: 2rem, 20px, 1em</p>
        </div>
      </div>

      {/* Component Count */}
      <div className="pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <span className="font-medium">{section.components.length}</span> component(s) in this section
        </div>
      </div>
    </div>
  );
}

