'use client';

import React from 'react';
import type { ComponentNode } from '../../../domain/entities/page-section.entity';
import { ButtonEditor } from './ButtonEditor';
import { TextEditor } from './TextEditor';

interface ComponentEditorProps {
  component: ComponentNode;
  onUpdate: (props: Record<string, unknown>, styles?: Record<string, unknown>) => void;
  onRemove: () => void;
  pages?: string[];
}

export function ComponentEditor({
  component,
  onUpdate,
  onRemove,
  pages = [],
}: ComponentEditorProps): JSX.Element {
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
          const updatedStyles = { ...textStyles, textColor: value };
          onUpdate(component.props ?? {}, updatedStyles);
        };

        const handleFontSizeChange = (value: string) => {
          const updatedStyles = { ...textStyles, fontSize: value };
          onUpdate(component.props ?? {}, updatedStyles);
        };

        const handleFontWeightChange = (value: string) => {
          const updatedStyles = { ...textStyles, fontWeight: value };
          onUpdate(component.props ?? {}, updatedStyles);
        };

        const handleTextAlignChange = (value: string) => {
          const updatedStyles = { ...textStyles, textAlign: value };
          onUpdate(component.props ?? {}, updatedStyles);
        };

        const handleTextDecorationChange = (value: string) => {
          const updatedStyles = { ...textStyles, textDecoration: value };
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

        const handleColorChange = (
          colorKey: 'backgroundColor' | 'textColor' | 'borderColor',
          newColor: string,
        ) => {
          const updatedStyles = { ...buttonStyles, [colorKey]: newColor };
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
          const updatedStyles = { ...buttonStyles, borderRadius: value };
          onUpdate(component.props || {}, updatedStyles);
        };

        const handleTextAlignChange = (value: string) => {
          const updatedStyles = { ...buttonStyles, textAlign: value };
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
              const updatedStyles = { ...buttonStyles, padding: value };
              onUpdate(component.props || {}, updatedStyles);
            }}
            borderRadius={(buttonStyles.borderRadius as string) || undefined}
            onBorderRadiusChange={handleBorderRadiusChange}
            textAlign={(buttonStyles.textAlign as string) || undefined}
            onTextAlignChange={handleTextAlignChange}
          />
        );
      }

      case 'Image': {
        const imageSrc = (component.props?.src as string) || '';

        const handleImageUrlChange = (value: string) => {
          onUpdate({ ...component.props, src: value.trim() });
        };

        return (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">
                Image URL
              </label>
              <input
                type="text"
                value={imageSrc}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                placeholder="https://images.example.com/your-image.png"
              />
              <p className="text-xs text-gray-400 mt-1">
                Enter image URL. (File upload is temporarily disabled in this simplified editor.)
              </p>
            </div>
          </div>
        );
      }

      default:
        return (
          <div className="text-xs text-gray-500">
            No editor available for component type: <code>{component.type}</code>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Component Settings</h3>
          <p className="text-xs text-gray-500 mt-0.5">{component.type}</p>
        </div>
        <button
          onClick={onRemove}
          className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
          title="Remove component"
        >
          🗑️ Remove
        </button>
      </div>

      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          Properties
        </h4>
        {renderPropsEditor()}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-400 font-mono">ID: {component.id}</div>
      </div>
    </div>
  );
}

