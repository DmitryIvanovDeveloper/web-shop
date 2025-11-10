'use client';

import React, { useState } from 'react';
import type { ComponentNode } from '../../../domain/entities/page-section.entity';

interface ComponentEditorProps {
  component: ComponentNode;
  onUpdate: (props: Record<string, unknown>) => void;
  onRemove: () => void;
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

export function ComponentEditor({ component, onUpdate, onRemove }: ComponentEditorProps): JSX.Element {
  const [isIconUploading, setIsIconUploading] = useState(false);

  const updateButtonIcon = (icon: string | null): void => {
    const currentProps = (component.props as Record<string, unknown>) || {};
    const nextProps = { ...currentProps };

    if (icon && icon.trim() !== '') {
      nextProps.icon = icon;
    } else {
      delete nextProps.icon;
    }

    onUpdate(nextProps);
  };

  const handleButtonIconUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsIconUploading(true);

    try {
      const base64 = await readFileAsDataUrl(file);
      updateButtonIcon(base64);
    } catch {
      // ignore upload errors for now
    } finally {
      setIsIconUploading(false);
      event.target.value = '';
    }
  };

  const renderPropsEditor = () => {
    switch (component.type) {
      case 'Text':
        return (
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Text Content
            </label>
            <textarea
              value={(component.props?.text as string) || ''}
              onChange={(e) => onUpdate({ ...component.props, text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              rows={4}
              placeholder="Enter text here..."
            />
          </div>
        );

      case 'Button':
        const iconValue = (component.props?.icon as string) || '';
        const hasImageIcon = iconValue.startsWith('data:image');

        return (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">
                Button Label
              </label>
              <input
                type="text"
                value={(component.props?.text as string) || ''}
                onChange={(e) => onUpdate({ ...component.props, text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Click me"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">
                Icon (emoji, symbol or image)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={iconValue}
                  onChange={(e) => updateButtonIcon(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="🛒 or data:image/png;base64,..."
                />
                {iconValue && (
                  <button
                    type="button"
                    onClick={() => updateButtonIcon(null)}
                    className="px-2 py-1 text-xs text-gray-500 border border-gray-300 rounded hover:bg-gray-50"
                    title="Remove icon"
                  >
                    ✕
                  </button>
                )}
              </div>
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
                    onChange={handleButtonIconUpload}
                  />
                  {isIconUploading ? '📤 Uploading…' : '📤 Upload Icon'}
                </label>
                {iconValue && (
                  hasImageIcon ? (
                    <img
                      src={iconValue}
                      alt="Button icon preview"
                      className="w-10 h-10 object-contain rounded border border-gray-200"
                    />
                  ) : (
                    <span className="text-xl leading-none">{iconValue}</span>
                  )
                )}
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Изображение сохраняется как base64 прямо в конфиге. Можно также использовать emoji или текстовый символ.
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">
                Action (URL or function)
              </label>
              <input
                type="text"
                value={(component.props?.onClick as string) || ''}
                onChange={(e) => onUpdate({ ...component.props, onClick: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                placeholder="/shop"
              />
            </div>
          </div>
        );

      case 'Image':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">
                Image URL
              </label>
              <input
                type="text"
                value={(component.props?.src as string) || ''}
                onChange={(e) => onUpdate({ ...component.props, src: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                placeholder="https://example.com/image.jpg"
              />
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

