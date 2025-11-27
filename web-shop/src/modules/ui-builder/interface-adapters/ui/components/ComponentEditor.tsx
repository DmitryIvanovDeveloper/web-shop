'use client';

import React, { useState } from 'react';
import type { ComponentNode } from '../../../domain/entities/page-section.entity';
import { ButtonEditor } from './ButtonEditor';
import { TextEditor } from './TextEditor';

interface ComponentEditorProps {
  component: ComponentNode;
  onUpdate: (props: Record<string, unknown>, styles?: Record<string, unknown>) => void;
  onRemove: () => void;
  pages?: string[];
}

export function ComponentEditor({ component, onUpdate, onRemove, pages = [] }: ComponentEditorProps): JSX.Element {
  const [isImageUploading, setIsImageUploading] = useState(false);

  const renderPropsEditor = () => {
    switch (component.type) {
      case 'Text': {
        const textStyles = (component.styles || {}) as Record<string, string>;
        const textColor = textStyles.textColor || '#111827';
        const fontSize = textStyles.fontSize || 'base';
        const fontWeight = textStyles.fontWeight || 'normal';
        const textAlign = textStyles.textAlign || 'left';
        const textDecoration = textStyles.textDecoration || 'none';

        const handleTextChange = (value: string) => {
          onUpdate({ ...component.props, text: value });
        };

        const handleTextColorChange = (value: string) => {
          const updatedStyles = {
            ...textStyles,
            textColor: value,
          };
          onUpdate(component.props ?? {}, updatedStyles);
        };

        const handleFontSizeChange = (value: string) => {
          const updatedStyles = {
            ...textStyles,
            fontSize: value,
          };
          onUpdate(component.props ?? {}, updatedStyles);
        };

        const handleFontWeightChange = (value: string) => {
          const updatedStyles = {
            ...textStyles,
            fontWeight: value,
          };
          onUpdate(component.props ?? {}, updatedStyles);
        };

        const handleTextAlignChange = (value: string) => {
          const updatedStyles = {
            ...textStyles,
            textAlign: value,
          };
          onUpdate(component.props ?? {}, updatedStyles);
        };

        const handleTextDecorationChange = (value: string) => {
          const updatedStyles = {
            ...textStyles,
            textDecoration: value,
          };
          onUpdate(component.props ?? {}, updatedStyles);
        };

        return (
          <TextEditor
            text={(component.props?.text as string) || ''}
            onTextChange={handleTextChange}
            textColor={textColor}
            onTextColorChange={handleTextColorChange}
            fontSize={fontSize}
            onFontSizeChange={handleFontSizeChange}
            fontWeight={fontWeight}
            onFontWeightChange={handleFontWeightChange}
            textAlign={textAlign}
            onTextAlignChange={handleTextAlignChange}
            textDecoration={textDecoration}
            onTextDecorationChange={handleTextDecorationChange}
          />
        );
      }

      case 'Button': {
        const buttonStyles = (component.styles || {}) as Record<string, string>;
        const backgroundColor = buttonStyles.backgroundColor || '#ffc629';
        const buttonTextColor = buttonStyles.textColor || '#ffffff';
        const borderColor = buttonStyles.borderColor || '#ffffff';

        const handleColorChange = (colorKey: 'backgroundColor' | 'textColor' | 'borderColor', newColor: string) => {
          const updatedStyles = {
            ...buttonStyles,
            [colorKey]: newColor,
          };
          onUpdate(component.props || {}, updatedStyles);
        };

        const handleLabelChange = (value: string) => {
          onUpdate({ ...component.props, text: value });
        };

        const handleIconChange = (value: string | null) => {
          const currentProps = (component.props as Record<string, unknown>) || {};
          const nextProps = { ...currentProps };
          if (value && value.trim() !== '') {
            nextProps.icon = value;
          } else {
            delete nextProps.icon;
          }
          onUpdate(nextProps);
        };

        const handlePageSlugChange = (value: string | null) => {
          const currentProps = (component.props as Record<string, unknown>) || {};
          const nextProps = { ...currentProps };
          if (value) {
            nextProps.pageSlug = value;
          } else {
            delete nextProps.pageSlug;
          }
          onUpdate(nextProps);
        };

        const handleActionChange = (value: string) => {
          onUpdate({ ...component.props, onClick: value });
        };

        const handleBorderRadiusChange = (value: string) => {
          const updatedStyles = {
            ...buttonStyles,
            borderRadius: value,
          };
          onUpdate(component.props || {}, updatedStyles);
        };

        const handleTextAlignChange = (value: string) => {
          const updatedStyles = {
            ...buttonStyles,
            textAlign: value,
          };
          onUpdate(component.props || {}, updatedStyles);
        };

        return (
          <ButtonEditor
            backgroundColor={backgroundColor}
            textColor={buttonTextColor}
            borderColor={borderColor}
            onColorChange={handleColorChange}
            label={(component.props?.text as string) || ''}
            onLabelChange={handleLabelChange}
            icon={(component.props?.icon as string) || null}
            onIconChange={handleIconChange}
            pageSlug={(component.props?.pageSlug as string) || null}
            onPageSlugChange={handlePageSlugChange}
            pages={pages}
            onClick={(component.props?.onClick as string) || ''}
            onActionChange={handleActionChange}
            padding={(buttonStyles.padding as string) || undefined}
            onPaddingChange={(value) => {
              const updatedStyles = {
                ...buttonStyles,
                padding: value,
              };
              onUpdate(component.props || {}, updatedStyles);
            }}
            borderRadius={(buttonStyles.borderRadius as string) || undefined}
            onBorderRadiusChange={handleBorderRadiusChange}
            textAlign={(buttonStyles.textAlign as string) || undefined}
            onTextAlignChange={handleTextAlignChange}
          />
        );
      }

      case 'Image':
        const handleImageFileUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
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

          setIsImageUploading(true);

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

            // Update component props with base64 image
            onUpdate({ ...component.props, src: base64String });
          } catch (error) {
            alert(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
          } finally {
            setIsImageUploading(false);
            // Reset file input
            event.target.value = '';
          }
        };

        const imageSrc = (component.props?.src as string) || '';
        const isBase64Image = imageSrc.startsWith('data:image/');

        return (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">
                Image URL
              </label>
              <input
                type="text"
                value={(() => {
                  // If it's base64, show a shorter indicator
                  if (isBase64Image) {
                    const match = imageSrc.match(/data:image\/([^;]+);base64,/);
                    const type = match ? match[1] : 'image';
                    const sizeKB = Math.round(imageSrc.length / 1024);
                    return `[Base64 ${type.toUpperCase()} - ${sizeKB}KB]`;
                  }
                  return imageSrc;
                })()}
                onChange={(e) => {
                  const url = e.target.value.trim();
                  // Don't update if it's the base64 indicator
                  if (url.startsWith('[Base64')) {
                    return;
                  }
                  onUpdate({ ...component.props, src: url });
                }}
                disabled={isBase64Image}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-400 mt-1">
                {isBase64Image
                  ? 'Base64 image stored in component. Upload a new file to replace.'
                  : 'Enter image URL or upload a file (will be stored as base64 in component)'}
              </p>
            </div>

            {/* File Upload */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">
                Upload Image
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    disabled={isImageUploading}
                    className="hidden"
                  />
                  <div className={`px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-center text-gray-700 ${isImageUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                    {isImageUploading ? '📤 Converting...' : '📤 Upload Image (Base64)'}
                  </div>
                </label>
                {imageSrc && (
                  <div className="flex-shrink-0">
                    {isBase64Image ? (
                      <img
                        src={imageSrc}
                        alt="Preview"
                        className="w-16 h-16 object-contain rounded border border-gray-200"
                      />
                    ) : (
                      <img
                        src={imageSrc}
                        alt="Preview"
                        className="w-16 h-16 object-contain rounded border border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">
                Alt Text
              </label>
              <input
                type="text"
                value={(component.props?.alt as string) || ''}
                onChange={(e) => onUpdate({ ...component.props, alt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Image description"
              />
            </div>
          </div>
        );

      case 'Video':
        return (
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Video URL
            </label>
            <input
              type="text"
              value={(component.props?.src as string) || ''}
              onChange={(e) => onUpdate({ ...component.props, src: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="https://example.com/video.mp4"
            />
          </div>
        );

      case 'ProductsList':
      case 'OffersList':
        return (
          <div className="text-sm text-gray-500 py-4 text-center border border-gray-200 rounded-lg">
            This component will automatically fetch and display data.
            <br />
            <span className="text-xs text-gray-400">No configuration needed</span>
          </div>
        );

      case 'Container':
        return (
          <div className="text-sm text-gray-500 py-4 text-center border border-gray-200 rounded-lg">
            Container for grouping components.
            <br />
            <span className="text-xs text-gray-400">Add child components in code</span>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500 py-4 text-center border border-gray-200 rounded-lg">
            No editor available for {component.type}
          </div>
        );
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Component Settings</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {component.type}
          </p>
        </div>
        <button
          onClick={onRemove}
          className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
          title="Remove component"
        >
          🗑️ Remove
        </button>
      </div>

      {/* Properties Editor */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Properties</h4>
        {renderPropsEditor()}
      </div>

      {/* Component ID */}
      <div className="pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-400 font-mono">
          ID: {component.id}
        </div>
      </div>
    </div>
  );
}

